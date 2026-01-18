"""
Chat endpoint for AI-powered knowledge graph generation.
Uses Google Gemini to generate graph structures from user queries.
"""
import os
import json
import re
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import google.generativeai as genai

from api.session_store import update_session_from_chat, get_session

router = APIRouter()

# Configure Gemini
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

SYSTEM_PROMPT = """You are a knowledge graph generator for an educational platform. Generate a knowledge graph with visualization types for each node.

CRITICAL: Return valid JSON with this EXACT structure:
{
  "message": "Brief 1-2 sentence explanation of the topic",
  "nodes": [
    {"id": "main-topic", "label": "Main Topic", "vizType": "three"},
    {"id": "subtopic-1", "label": "Subtopic 1", "vizType": "video"},
    {"id": "subtopic-2", "label": "Subtopic 2", "vizType": "image"},
    {"id": "subtopic-3", "label": "Subtopic 3", "vizType": "three"}
  ],
  "links": [
    {"source": "main-topic", "target": "subtopic-1"},
    {"source": "main-topic", "target": "subtopic-2"},
    {"source": "main-topic", "target": "subtopic-3"}
  ],
  "centerId": "main-topic"
}

VISUALIZATION TYPES - Choose based on what best explains the concept:
- "three" = Interactive 3D visualization (best for: geometry, vectors, 3D shapes, graphs, neural networks, coordinate systems)
- "video" = Animated step-by-step explanation (best for: processes, algorithms, proofs, transformations, derivations)
- "image" = Static educational diagram (best for: formulas, definitions, comparisons, flowcharts, relationships)

RULES:
1. EXACTLY 4 nodes total: 1 center node + 3 branch nodes
2. NO sub-nodes - only center connects to 3 direct children
3. EVERY node MUST have vizType - distribute across all THREE types when possible
4. IDs: lowercase with hyphens (e.g., "chain-rule", "neural-network")
5. Labels: 1-3 words, title case (e.g., "Chain Rule", "Neural Network")
6. Links: Only from center to branches (3 links total)
7. centerId: Must match the center node's id

EXAMPLE - User asks "teach me calculus":
{
  "message": "Calculus studies rates of change and accumulation through derivatives and integrals.",
  "nodes": [
    {"id": "calculus", "label": "Calculus", "vizType": "three"},
    {"id": "derivatives", "label": "Derivatives", "vizType": "three"},
    {"id": "integrals", "label": "Integrals", "vizType": "video"},
    {"id": "limits", "label": "Limits", "vizType": "image"}
  ],
  "links": [
    {"source": "calculus", "target": "derivatives"},
    {"source": "calculus", "target": "integrals"},
    {"source": "calculus", "target": "limits"}
  ],
  "centerId": "calculus"
}

Return ONLY valid JSON. No markdown, no explanation, no code blocks."""


class ChatRequest(BaseModel):
    message: str
    sessionId: Optional[str] = None
    mode: str = "new"  # "new" (initial graph) or "expand" (add children)
    parentNodeId: Optional[str] = None  # Required for expansion mode


class GraphNode(BaseModel):
    id: str
    label: str
    vizType: str  # "three" | "video" | "image"


class GraphLink(BaseModel):
    source: str
    target: str


class ChatResponse(BaseModel):
    message: str
    nodes: List[GraphNode]
    links: List[GraphLink]
    centerId: str


def extract_json(text: str) -> dict:
    """Extract JSON from text, handling potential markdown code blocks."""
    # Try to find JSON in code blocks first
    json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
    if json_match:
        text = json_match.group(1)

    # Try to find raw JSON object
    json_match = re.search(r'\{[\s\S]*\}', text)
    if json_match:
        text = json_match.group(0)

    return json.loads(text)


@router.post("", response_model=ChatResponse)
async def generate_graph(request: ChatRequest):
    """Generate a knowledge graph from a user query using Gemini."""

    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not configured")

    try:
        # Initialize Gemini model
        model = genai.GenerativeModel('gemini-2.0-flash-exp')

        # EXPANSION MODE: Generate 3 child nodes for a parent topic
        if request.mode == "expand":
            if not request.parentNodeId:
                raise HTTPException(status_code=400, detail="parentNodeId required for expansion mode")

            expansion_prompt = f"""Generate 3 specific subtopics for "{request.message}".

Return ONLY valid JSON with this structure:
{{
  "message": "Brief 1-sentence explanation of how these subtopics relate to {request.message}",
  "nodes": [
    {{"id": "subtopic-1", "label": "Subtopic 1 Name", "vizType": "three"}},
    {{"id": "subtopic-2", "label": "Subtopic 2 Name", "vizType": "video"}},
    {{"id": "subtopic-3", "label": "Subtopic 3 Name", "vizType": "image"}}
  ]
}}

RULES:
- EXACTLY 3 nodes (no more, no less)
- IDs: lowercase-with-hyphens (e.g., "u-substitution", "integration-by-parts")
- Labels: 2-4 words, specific subtopics of {request.message}
- Mix all 3 vizTypes (one of each: three, video, image)
- Make subtopics SPECIFIC and educational

Example for "Integrals":
{{
  "message": "These three techniques cover the core methods for solving integrals.",
  "nodes": [
    {{"id": "u-substitution", "label": "U-Substitution", "vizType": "three"}},
    {{"id": "integration-by-parts", "label": "Integration by Parts", "vizType": "video"}},
    {{"id": "definite-integrals", "label": "Definite Integrals", "vizType": "image"}}
  ]
}}

Return ONLY JSON, no markdown, no explanation."""

            response = model.generate_content(expansion_prompt)

            if not response.text:
                raise HTTPException(status_code=500, detail="No response from Gemini")

            # Parse JSON response
            try:
                parsed = extract_json(response.text)
            except json.JSONDecodeError as e:
                print(f"[Chat] Failed to parse expansion JSON: {response.text}")
                raise HTTPException(status_code=500, detail=f"Failed to parse expansion response: {str(e)}")

            # Validate structure
            if "nodes" not in parsed or "message" not in parsed:
                raise HTTPException(status_code=500, detail="Invalid expansion structure from AI")

            # Validate nodes
            for node in parsed["nodes"]:
                if not all(key in node for key in ["id", "label", "vizType"]):
                    raise HTTPException(status_code=500, detail="Invalid node structure in expansion")
                if node["vizType"] not in ["three", "video", "image"]:
                    node["vizType"] = "image"  # Default fallback

            print(f"[Chat] Generated expansion for {request.message}: {len(parsed['nodes'])} children")

            # Add to session as children
            if request.sessionId:
                from api.session_store import expand_node
                result = expand_node(request.sessionId, request.parentNodeId, parsed["nodes"])
                if result:
                    print(f"[Chat] Expanded node {request.parentNodeId} in session {request.sessionId}")
                else:
                    print(f"[Chat] Failed to expand node {request.parentNodeId}")

            return ChatResponse(
                message=parsed["message"],
                nodes=[GraphNode(**n) for n in parsed["nodes"]],
                links=[],  # Links are created automatically in expand_node
                centerId=request.parentNodeId or ""
            )

        # NORMAL MODE: Generate initial 4-node graph
        # Generate graph
        prompt = f"{SYSTEM_PROMPT}\n\nUser query: {request.message}\n\nGenerate the knowledge graph JSON:"

        response = model.generate_content(prompt)

        if not response.text:
            raise HTTPException(status_code=500, detail="No response from Gemini")

        # Parse JSON response
        try:
            parsed = extract_json(response.text)
        except json.JSONDecodeError as e:
            print(f"[Chat] Failed to parse JSON: {response.text}")
            raise HTTPException(status_code=500, detail=f"Failed to parse graph response: {str(e)}")

        # Validate structure
        if not all(key in parsed for key in ["message", "nodes", "links", "centerId"]):
            raise HTTPException(status_code=500, detail="Invalid graph structure from AI")

        # Validate nodes have required fields
        for node in parsed["nodes"]:
            if not all(key in node for key in ["id", "label", "vizType"]):
                raise HTTPException(status_code=500, detail="Invalid node structure")
            if node["vizType"] not in ["three", "video", "image"]:
                node["vizType"] = "image"  # Default fallback

        print(f"[Chat] Generated graph: {len(parsed['nodes'])} nodes, center={parsed['centerId']}")

        # Save to session if sessionId provided
        if request.sessionId:
            session = get_session(request.sessionId)
            if session:
                update_session_from_chat(
                    request.sessionId,
                    parsed["nodes"],
                    parsed["links"],
                    parsed["centerId"]
                )
                print(f"[Chat] Saved graph to session {request.sessionId}")

        return ChatResponse(
            message=parsed["message"],
            nodes=[GraphNode(**n) for n in parsed["nodes"]],
            links=[GraphLink(**l) for l in parsed["links"]],
            centerId=parsed["centerId"]
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"[Chat] Error generating graph: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate graph: {str(e)}")
