"""
LiveKit Voice Agent with Knowledge Graph Control
Uses function tools to let the LLM control the knowledge graph via voice
"""

import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions, AgentServer, JobContext, RunContext, function_tool
from livekit.plugins import silero, elevenlabs, google

from agent.backend_client import generate_graph_from_topic, get_graph, create_session


# Global state for the current session
_session_state = {
    "session_id": None,
    "current_graph": {"nodes": [], "links": [], "centerId": None}
}


class TutorAgent(Agent):
    """AI Tutor agent that controls the knowledge graph via voice."""

    def __init__(self) -> None:
        # Build node labels for context
        node_labels = [n.get("label", "") for n in _session_state["current_graph"].get("nodes", [])]
        labels_str = ", ".join(node_labels) if node_labels else "none yet"

        super().__init__(
            instructions=f"""You are a friendly AI tutor helping students learn through an interactive knowledge graph.

You can control the knowledge graph that the student sees using your tools:
- explore_topic: Generate a new knowledge graph about any topic the student asks about
- select_topic: Navigate to a specific topic already in the current graph
- back_to_graph: Return to the main graph view

Current topics in the knowledge graph: {labels_str}

IMPORTANT BEHAVIORS:
1. When a student asks "what is X" or "teach me X", use explore_topic to generate a graph about X
2. After generating a graph, tell them what topics are available and ask which they want to explore
3. When they mention a topic in the current graph, use select_topic to navigate to it
4. Keep responses SHORT (1-2 sentences). Be conversational and encouraging.
5. Always let the student know what they can do next

Do not use complex formatting, emojis, or special symbols. Speak naturally.""",
        )

    @function_tool()
    async def explore_topic(
        self,
        context: RunContext,
        topic: str,
    ) -> str:
        """Generate a new knowledge graph about a topic the student wants to learn.

        Args:
            topic: The topic to explore (e.g., "calculus", "machine learning", "physics")
        """
        print(f"[Agent Tool] Exploring topic: {topic}")

        try:
            # Generate graph from topic
            result = await generate_graph_from_topic(topic, _session_state["session_id"])

            # Update global state
            _session_state["current_graph"] = {
                "nodes": result.get("nodes", []),
                "links": result.get("links", []),
                "centerId": result.get("centerId")
            }

            # Send update_graph command to frontend (include session ID so frontend can use it)
            ctx = agents.get_job_context()
            await ctx.room.local_participant.publish_data(
                json.dumps({
                    "type": "command",
                    "payload": {
                        "action": "update_graph",
                        "graph": _session_state["current_graph"],
                        "sessionId": _session_state["session_id"],
                        "message": result.get("message", "")
                    }
                }),
                reliable=True,
            )

            # Build response with available topics
            node_labels = [n.get("label") for n in _session_state["current_graph"].get("nodes", [])]
            topics_str = ", ".join(node_labels)

            return f"Generated knowledge graph about {topic}. Available topics: {topics_str}. The student can now ask about any of these."

        except Exception as e:
            import traceback
            print(f"[Agent Tool] Error exploring topic: {e}")
            traceback.print_exc()
            return f"Sorry, I couldn't generate a graph about {topic}. Error: {str(e)}"

    @function_tool()
    async def select_topic(
        self,
        context: RunContext,
        topic_label: str,
    ) -> str:
        """Navigate to a specific topic in the current knowledge graph.

        Args:
            topic_label: The label of the topic to select (must match exactly from available topics)
        """
        print(f"[Agent Tool] Selecting topic: {topic_label}")

        # Find the node by label (case-insensitive)
        node = None
        for n in _session_state["current_graph"].get("nodes", []):
            if n.get("label", "").lower() == topic_label.lower():
                node = n
                break

        if not node:
            available = [n.get("label") for n in _session_state["current_graph"].get("nodes", [])]
            return f"Topic '{topic_label}' not found. Available topics: {', '.join(available)}"

        try:
            # Send select command to frontend
            ctx = agents.get_job_context()
            await ctx.room.local_participant.publish_data(
                json.dumps({
                    "type": "command",
                    "payload": {
                        "action": "select_node_by_label",
                        "label": node.get("label")
                    }
                }),
                reliable=True,
            )

            return f"Selected {node.get('label')}. The visualization will now show."

        except Exception as e:
            print(f"[Agent Tool] Error selecting topic: {e}")
            return f"Sorry, I couldn't select {topic_label}. Please try again."

    @function_tool()
    async def back_to_graph(
        self,
        context: RunContext,
    ) -> str:
        """Return to the main knowledge graph view."""
        print("[Agent Tool] Going back to graph")

        try:
            ctx = agents.get_job_context()
            await ctx.room.local_participant.publish_data(
                json.dumps({
                    "type": "command",
                    "payload": {"action": "back_to_graph"}
                }),
                reliable=True,
            )

            node_labels = [n.get("label") for n in _session_state["current_graph"].get("nodes", [])]
            topics_str = ", ".join(node_labels) if node_labels else "none"

            return f"Back to the knowledge graph. Available topics: {topics_str}"
        except Exception as e:
            print(f"[Agent Tool] Error going back to graph: {e}")
            return "Sorry, I couldn't go back to the graph."


# Create the server
server = AgentServer()


@server.rtc_session()
async def entrypoint(ctx: JobContext):
    """Main entrypoint for the agent."""

    print(f"[Agent] Job received for room: {ctx.room.name}")

    # Create a learning session
    try:
        session_id = await create_session()
        initial_graph = await get_graph(session_id)
        _session_state["session_id"] = session_id
        _session_state["current_graph"] = initial_graph
        print(f"[Agent] Created session {session_id} with {len(initial_graph.get('nodes', []))} nodes")
    except Exception as e:
        print(f"[Agent] Failed to create session: {e}")
        import traceback
        traceback.print_exc()

    # Connect to the room
    await ctx.connect()

    print(f"[Agent] Connected to room: {ctx.room.name}")

    # Create the agent session with STT, LLM, and TTS
    session = AgentSession(
        stt=elevenlabs.STT(
            language_code="en",
        ),
        llm=google.LLM(
            model="gemini-2.0-flash",
        ),
        tts=elevenlabs.TTS(
            model="eleven_turbo_v2_5",
            voice_id="21m00Tcm4TlvDq8ikWAM",  # Rachel voice
        ),
        vad=silero.VAD.load(),
    )

    # Add event handlers for logging
    @session.on("user_input_transcribed")
    def on_transcription(event):
        print(f"\n{'='*50}")
        print(f"USER SAID: {event.transcript}")
        print(f"{'='*50}\n")

    @session.on("function_calls_finished")
    def on_function_calls(event):
        print(f"\n{'='*50}")
        print(f"FUNCTION CALLS FINISHED")
        print(f"{'='*50}\n")

    # Start the session with our tutor agent
    await session.start(
        room=ctx.room,
        agent=TutorAgent(),
        room_input_options=RoomInputOptions(
            audio_enabled=True,
        ),
    )

    print("[Agent] Session started, listening for speech...")

    # Build greeting with available topics
    node_labels = [n.get("label", "") for n in _session_state["current_graph"].get("nodes", [])]
    if node_labels:
        topics_hint = f"I can see we have some topics ready: {', '.join(node_labels)}. "
    else:
        topics_hint = ""

    # Send initial greeting
    await session.generate_reply(
        instructions=f"""Greet the student warmly and briefly. {topics_hint}
Ask what they'd like to learn about today.
Mention they can ask about ANY topic and you'll create a knowledge graph for them.
Keep it to 2-3 sentences max."""
    )


if __name__ == "__main__":
    print("[Agent] Starting LiveKit Voice Agent with Knowledge Graph Control...")
    agents.cli.run_app(server)
