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
        _model = genai.GenerativeModel('gemini-1.5-flash')
    return _model

SYSTEM_PROMPT = """You are a natural language understanding system for a learning application.

Your job is to map user speech transcripts into strict command JSON objects.

Available commands:
1. select_node_by_label - Navigate to a specific topic within the current domain
   Format: {{"action": "select_node_by_label", "label": "<exact_node_label>"}}

2. back_to_graph - Return to the main graph view
   Format: {{"action": "back_to_graph"}}

3. start_lesson - Begin a lesson on the current topic
   Format: {{"action": "start_lesson"}}

4. end_lesson - End the current lesson
   Format: {{"action": "end_lesson"}}

5. switch_domain - Switch to a different subject area
   Format: {{"action": "switch_domain", "domain": "<domain_key>"}}
   Available domains:
   - calculus: Calculus (derivatives, integrals, limits)
   - neural_networks: Neural Networks & ML (perceptrons, backpropagation, activation functions)
   - linear_algebra: Linear Algebra (vectors, matrices, eigenvalues)
   - physics: Physics (mechanics, forces, waves, energy)
   - statistics: Statistics (probability, distributions, hypothesis testing)
   - discrete_math: Discrete Math (graphs, trees, sets, logic)

6. clarify - Ask for clarification (you will NOT publish this)
   Format: {{"action": "clarify", "question": "What topic did you mean?"}}

Current domain: {current_domain}
Current available topics (node labels):
{node_labels}

Rules:
- ONLY output JSON, nothing else
- Match node labels exactly from the provided list
- If the user mentions a topic IN the current domain, use select_node_by_label
- If the user wants to change subjects/domains entirely, use switch_domain
- If you can't find an exact match or are unsure, use clarify
- Keywords: "go to", "show me", "learn about" + topic in current domain → select_node_by_label
- Keywords: "switch to", "change to", "I want to learn", "show me" + domain name → switch_domain
- Keywords: "back", "return", "go back" → back_to_graph
- Keywords: "start", "begin", "let's learn" → start_lesson
- Keywords: "stop", "end", "finish" → end_lesson

Examples:
User: "Show me derivatives"
Output: {{"action": "select_node_by_label", "label": "Derivatives"}}

User: "I want to learn about neural networks"
Output: {{"action": "switch_domain", "domain": "neural_networks"}}

User: "Switch to physics"
Output: {{"action": "switch_domain", "domain": "physics"}}

User: "Show me the linear algebra topics"
Output: {{"action": "switch_domain", "domain": "linear_algebra"}}

User: "Go back to the graph"
Output: {{"action": "back_to_graph"}}

User: "Let's start the lesson"
Output: {{"action": "start_lesson"}}

User: "What is calculus?"
Output: {{"action": "clarify", "question": "Did you want to learn about a specific topic? Available topics are: Derivatives, Integrals, Limits"}}
"""

async def map_transcript_to_command(transcript: str, node_labels: List[str], current_domain: str = "calculus") -> Dict:
    """
    Map user transcript to command JSON using Gemini.

    Args:
        transcript: User speech transcript
        node_labels: List of available node labels from graph
        current_domain: Current domain (calculus, neural_networks, etc.)

    Returns:
        Command dict with "action" and optional "label" or "domain"

    Raises:
        Exception if LLM fails
    """

    # Format prompt with current node labels and domain
    labels_str = ", ".join(node_labels)
    prompt = SYSTEM_PROMPT.format(node_labels=labels_str, current_domain=current_domain)

    # Construct request
    full_prompt = f"{prompt}\n\nUser transcript: \"{transcript}\"\n\nOutput JSON:"

    print(f"[NLU] Processing transcript: '{transcript}' (domain: {current_domain})")
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
