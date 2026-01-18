import os
import json
import google.generativeai as genai
from typing import Dict, List, Optional

# Lazy initialization to ensure dotenv has been loaded
_model: Optional[genai.GenerativeModel] = None


def _get_model() -> genai.GenerativeModel:
    """Get or initialize the Gemini model at runtime."""
    global _model
    if _model is None:
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise Exception("GOOGLE_API_KEY environment variable is not set")
        genai.configure(api_key=api_key)
        _model = genai.GenerativeModel('gemini-2.0-flash')
    return _model

SYSTEM_PROMPT = """You are a natural language understanding system for an educational learning application with an interactive knowledge graph.

Your job is to map user speech transcripts into strict command JSON objects.

Available commands:
1. explore_topic - User wants to learn about a NEW topic (generates a new knowledge graph)
   Format: {{"action": "explore_topic", "topic": "<the topic they want to explore>"}}
   Use when: User asks "what is X", "teach me X", "explain X", "I want to learn about X", or mentions a topic NOT in the current graph

2. select_node_by_label - Navigate to an EXISTING topic in the current graph
   Format: {{"action": "select_node_by_label", "label": "<exact_node_label>"}}
   Use when: User wants to see a topic that IS in the current available topics list

3. back_to_graph - Return to the main graph view
   Format: {{"action": "back_to_graph"}}

4. start_lesson - Begin a lesson/visualization on the current topic
   Format: {{"action": "start_lesson"}}

5. end_lesson - End the current lesson
   Format: {{"action": "end_lesson"}}

6. conversation - General conversation, greeting, or unclear intent (agent will respond naturally)
   Format: {{"action": "conversation"}}

Current available topics in the knowledge graph (node labels):
{node_labels}

CRITICAL Rules:
- ONLY output valid JSON, nothing else
- If user asks about a topic NOT in the current graph → use explore_topic
- If user asks about a topic that IS in the current graph → use select_node_by_label
- Match node labels EXACTLY from the provided list for select_node_by_label
- Keywords: "what is", "teach me", "explain", "learn about" + NEW topic → explore_topic
- Keywords: "show me", "go to", "select" + EXISTING topic → select_node_by_label
- Keywords: "back", "return", "go back" → back_to_graph
- Keywords: "start", "begin", "let's learn", "show visualization" → start_lesson
- Keywords: "stop", "end", "finish", "done" → end_lesson
- Greetings, thanks, unclear requests → conversation

Examples:
User: "What is calculus?"
Available topics: Three.js, Manim, Nano Banana Pro
Output: {{"action": "explore_topic", "topic": "calculus"}}

User: "Teach me about machine learning"
Available topics: Calculus, Derivatives, Integrals
Output: {{"action": "explore_topic", "topic": "machine learning"}}

User: "Show me derivatives"
Available topics: Calculus, Derivatives, Integrals, Limits
Output: {{"action": "select_node_by_label", "label": "Derivatives"}}

User: "I want to learn about integrals"
Available topics: Calculus, Derivatives, Integrals, Limits
Output: {{"action": "select_node_by_label", "label": "Integrals"}}

User: "Go back to the graph"
Output: {{"action": "back_to_graph"}}

User: "Start the lesson"
Output: {{"action": "start_lesson"}}

User: "Hello, how are you?"
Output: {{"action": "conversation"}}
"""

async def map_transcript_to_command(transcript: str, node_labels: List[str]) -> Dict:
    """
    Map user transcript to command JSON using Gemini.

    Args:
        transcript: User speech transcript
        node_labels: List of available node labels from graph

    Returns:
        Command dict with "action" and optional "label"

    Raises:
        Exception if LLM fails
    """

    # Format prompt with current node labels
    labels_str = ", ".join(node_labels)
    prompt = SYSTEM_PROMPT.format(node_labels=labels_str)

    # Construct request
    full_prompt = f"{prompt}\n\nUser transcript: \"{transcript}\"\n\nOutput JSON:"

    print(f"[NLU] Processing transcript: '{transcript}'")
    print(f"[NLU] Available labels: {labels_str}")

    try:
        # Call Gemini (lazy initialization)
        model = _get_model()
        response = model.generate_content(full_prompt)
        output = response.text.strip()

        # Parse JSON
        # Remove markdown code blocks if present
        if output.startswith("```"):
            output = output.split("```")[1]
            if output.startswith("json"):
                output = output[4:]

        command = json.loads(output)

        print(f"[NLU] Generated command: {command}")
        return command

    except json.JSONDecodeError as e:
        print(f"[NLU] Failed to parse JSON: {output}")
        return {"action": "clarify", "question": "I didn't understand that. Can you rephrase?"}

    except Exception as e:
        print(f"[NLU] Error: {e}")
        raise Exception(f"Gemini LLM failed: {e}")
