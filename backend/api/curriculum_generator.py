"""
Gemini-based curriculum generator for creating structured learning content.
Generates nodes with descriptions for OpenNote integration and agent teaching.
"""
import os
import json
import re
from typing import Dict, List, Optional, Tuple
import google.generativeai as genai
from api.session_store import GraphNode, GraphLink

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

# Mapping of topics to visualization types
VIZ_TYPE_HINTS = {
    # Math topics work well with 3D visualization
    "calculus": "three",
    "derivative": "three",
    "integral": "three",
    "function": "three",
    "graph": "three",
    "geometry": "three",
    "vector": "three",
    "matrix": "three",
    "linear algebra": "three",
    "differential": "three",
    # Process/sequential topics work well with video/animation
    "algorithm": "video",
    "process": "video",
    "step": "video",
    "sequence": "video",
    "flow": "video",
    "transformation": "video",
    "animation": "video",
    # Conceptual topics work well with static diagrams
    "concept": "image",
    "definition": "image",
    "theorem": "image",
    "principle": "image",
    "overview": "image",
}


def infer_viz_type(topic_label: str) -> str:
    """Infer the best visualization type for a topic based on keywords."""
    label_lower = topic_label.lower()

    for keyword, viz_type in VIZ_TYPE_HINTS.items():
        if keyword in label_lower:
            return viz_type

    # Default to "three" for mathematical/technical content
    return "three"


def clean_json_response(text: str) -> str:
    """Extract JSON from Gemini response, handling markdown code blocks."""
    # Remove markdown code blocks
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*', '', text)
    text = text.strip()
    return text


async def generate_curriculum(curriculum_context: Dict) -> Tuple[List[GraphNode], List[GraphLink]]:
    """
    Generate curriculum structure from course info using Gemini.

    Args:
        curriculum_context: Dict containing:
            - title: Course name
            - school: University name
            - topics: List of topic strings
            - description: Course description
            - format: Teaching format

    Returns:
        Tuple of (nodes, links) for the knowledge graph
    """
    if not GOOGLE_API_KEY:
        print("[CurriculumGenerator] No API key, using fallback curriculum")
        return _generate_fallback_curriculum(curriculum_context)

    title = curriculum_context.get("title", "Unknown Course")
    school = curriculum_context.get("school", "Unknown University")
    topics = curriculum_context.get("topics", [])
    description = curriculum_context.get("description", "")

    topics_str = ", ".join(topics) if topics else "general course topics"

    prompt = f"""You are creating a structured curriculum for an interactive learning platform.

Course: {title}
University: {school}
Topics: {topics_str}
Description: {description}

Generate a knowledge graph curriculum with 5-8 interconnected nodes. Each node represents a key concept or topic.

IMPORTANT: Return ONLY valid JSON, no explanation or markdown.

Return a JSON object with this exact structure:
{{
  "nodes": [
    {{
      "id": "node-1",
      "label": "Introduction to [Topic]",
      "vizType": "three|video|image",
      "description": "2-3 sentences explaining this topic for students. Be specific and educational.",
      "summary": "One sentence context for the AI tutor to use when teaching."
    }},
    ...
  ],
  "links": [
    {{"source": "node-1", "target": "node-2"}},
    ...
  ],
  "centerId": "node-1"
}}

Guidelines:
- vizType should be "three" for math/3D concepts, "video" for processes/algorithms, "image" for diagrams/theory
- Make the first node an overview/introduction (this will be the center)
- Create logical connections between related topics
- description should be educational content suitable for OpenNote
- summary should be brief context for the AI tutor
- id should be lowercase with hyphens (e.g., "derivatives-intro")
- Keep labels concise (2-4 words)

Generate the curriculum now:"""

    try:
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        response = model.generate_content(prompt)

        if not response.text:
            raise Exception("No response from Gemini")

        # Parse the JSON response
        json_text = clean_json_response(response.text)
        curriculum_data = json.loads(json_text)

        # Convert to GraphNode and GraphLink objects
        nodes = [
            GraphNode(
                id=n["id"],
                label=n["label"],
                vizType=n.get("vizType", infer_viz_type(n["label"])),
                description=n.get("description", ""),
                summary=n.get("summary", "")
            )
            for n in curriculum_data.get("nodes", [])
        ]

        links = [
            GraphLink(source=l["source"], target=l["target"])
            for l in curriculum_data.get("links", [])
        ]

        print(f"[CurriculumGenerator] Generated {len(nodes)} nodes for '{title}'")
        return nodes, links

    except json.JSONDecodeError as e:
        print(f"[CurriculumGenerator] JSON parse error: {e}")
        print(f"[CurriculumGenerator] Raw response: {response.text[:500] if response.text else 'None'}")
        return _generate_fallback_curriculum(curriculum_context)
    except Exception as e:
        print(f"[CurriculumGenerator] Gemini error: {e}")
        return _generate_fallback_curriculum(curriculum_context)


def _generate_fallback_curriculum(curriculum_context: Dict) -> Tuple[List[GraphNode], List[GraphLink]]:
    """
    Generate a simple fallback curriculum when Gemini is unavailable.
    """
    title = curriculum_context.get("title", "Course")
    topics = curriculum_context.get("topics", [])

    # Create nodes from topics
    nodes = []
    links = []

    # Add center node for the course
    center_id = "course-overview"
    nodes.append(GraphNode(
        id=center_id,
        label=f"{title} Overview",
        vizType="image",
        description=f"An introduction to {title}. This course covers the fundamental concepts and skills needed to master this subject.",
        summary=f"Welcome to {title}! Let's explore what we'll learn."
    ))

    # Add topic nodes
    for i, topic in enumerate(topics[:6]):  # Limit to 6 topics
        node_id = f"topic-{i+1}"
        nodes.append(GraphNode(
            id=node_id,
            label=topic[:30],  # Truncate long labels
            vizType=infer_viz_type(topic),
            description=f"Learn about {topic}. This topic is essential for understanding the broader concepts in {title}.",
            summary=f"Let's dive into {topic}."
        ))
        # Link to center
        links.append(GraphLink(source=center_id, target=node_id))

    # Add some connections between topics
    for i in range(len(nodes) - 2):
        if i > 0:  # Skip center node
            links.append(GraphLink(source=f"topic-{i}", target=f"topic-{i+1}"))

    print(f"[CurriculumGenerator] Generated fallback curriculum with {len(nodes)} nodes")
    return nodes, links


def get_curriculum_metadata(session) -> Dict:
    """
    Extract curriculum metadata for OpenNote integration.

    Args:
        session: Session object with curriculum_context and curriculum_nodes

    Returns:
        Dict with metadata suitable for OpenNote API
    """
    context = session.curriculum_context or {}

    return {
        "metadata": {
            "university": context.get("school", "Unknown"),
            "course": context.get("title", "Unknown Course"),
            "generatedAt": None,  # Will be set by caller
            "topicCount": len(session.curriculum_nodes)
        },
        "nodes": [
            {
                "id": node.id,
                "label": node.label,
                "vizType": node.vizType,
                "description": node.description,
                "summary": node.summary
            }
            for node in session.curriculum_nodes
        ],
        "links": [
            {"source": link.source, "target": link.target}
            for link in session.links
        ]
    }
