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

from agent.backend_client import generate_graph_from_topic, get_graph, create_session, expand_node


# Global state for the current session
_session_state = {
    "session_id": None,
    "current_graph": {"nodes": [], "links": [], "centerId": None},
    "curriculum_context": None,  # Context from nexhacksv0
    "curriculum_nodes": [],  # Generated curriculum nodes with descriptions
    "current_node": None,  # Currently selected node for teaching
    "agent_session": None  # Reference to AgentSession for auto-teaching
}


class TutorAgent(Agent):
    """AI Tutor agent that controls the knowledge graph via voice."""

    def __init__(self) -> None:
        # Build node labels for context
        node_labels = [n.get("label", "") for n in _session_state["current_graph"].get("nodes", [])]
        labels_str = ", ".join(node_labels) if node_labels else "none yet"

        # Build curriculum context if available
        curriculum_info = ""
        if _session_state["curriculum_context"]:
            curr = _session_state["curriculum_context"]
            topics = ", ".join(curr.get("topics", []))
            curriculum_info = f"""
CURRICULUM CONTEXT:
The student is learning: {curr.get("title", "Unknown")}
From: {curr.get("school", "Unknown")}
Topics covered: {topics}
This context can help you tailor your tutoring to their course content.
"""

        # Build curriculum nodes info if available (for OpenNote integration)
        curriculum_nodes_info = ""
        if _session_state["curriculum_nodes"]:
            node_summaries = []
            for node in _session_state["curriculum_nodes"]:
                summary = node.get("summary", "") or node.get("description", "")[:50]
                node_summaries.append(f"- {node.get('label')}: {summary}")
            curriculum_nodes_info = f"""
CURRICULUM TOPICS (click to learn):
{chr(10).join(node_summaries)}

When the student clicks a topic in the graph, you will be notified automatically.
Be ready to start teaching about the clicked topic immediately.
"""

        super().__init__(
            instructions=f"""You are a friendly AI tutor helping students learn through an interactive knowledge graph.
{curriculum_info}
{curriculum_nodes_info}

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
6. When you receive a notification that a student clicked a topic, START TEACHING immediately about that topic!

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
            # EXPANSION LOGIC: Check if node needs expansion
            # If not already expanded and depth allows, trigger expansion in background
            node_id = node.get("id")
            node_expanded = node.get("expanded", False)
            node_depth = node.get("depth", 0)

            print(f"[Agent Tool] Node {node_id}: expanded={node_expanded}, depth={node_depth}")

            if not node_expanded and node_depth < 3:
                print(f"[Agent Tool] Triggering expansion for {node_id}")
                try:
                    # Expand the node (generates 3 children)
                    expansion_result = await expand_node(
                        _session_state["session_id"],
                        node_id,
                        node.get("label")
                    )

                    # Fetch updated graph from backend
                    updated_graph = await get_graph(_session_state["session_id"])
                    _session_state["current_graph"] = updated_graph

                    print(f"[Agent Tool] Expansion complete, graph now has {len(updated_graph.get('nodes', []))} nodes")

                    # Send updated graph to frontend
                    ctx = agents.get_job_context()
                    await ctx.room.local_participant.publish_data(
                        json.dumps({
                            "type": "command",
                            "payload": {
                                "action": "update_graph",
                                "graph": updated_graph,
                                "sessionId": _session_state["session_id"],
                                "message": expansion_result.get("message", "")
                            }
                        }),
                        reliable=True,
                    )
                except Exception as e:
                    print(f"[Agent Tool] Error expanding node: {e}")
                    # Continue with selection even if expansion fails

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

    # Check if room name contains session ID (from nexhacksv0 integration)
    # Room format: learning-room-{session_id}
    existing_session_id = None
    if "learning-room-" in ctx.room.name:
        parts = ctx.room.name.split("learning-room-")
        if len(parts) > 1:
            existing_session_id = parts[1]
            print(f"[Agent] Found existing session ID in room name: {existing_session_id}")

    # Create or fetch learning session
    try:
        if existing_session_id:
            # Fetch existing session (created by nexhacksv0)
            print(f"[Agent] Fetching existing session: {existing_session_id}")
            initial_graph = await get_graph(existing_session_id)
            _session_state["session_id"] = existing_session_id
            _session_state["current_graph"] = initial_graph

            # Fetch curriculum context and nodes from session
            from api.session_store import get_session as get_session_obj
            session_obj = get_session_obj(existing_session_id)
            if session_obj:
                if session_obj.curriculum_context:
                    _session_state["curriculum_context"] = session_obj.curriculum_context
                    print(f"[Agent] Loaded curriculum context: {session_obj.curriculum_context.get('title')}")
                # Load curriculum nodes with descriptions for teaching
                if session_obj.curriculum_nodes:
                    _session_state["curriculum_nodes"] = [
                        {
                            "id": node.id,
                            "label": node.label,
                            "vizType": node.vizType,
                            "description": node.description,
                            "summary": node.summary
                        }
                        for node in session_obj.curriculum_nodes
                    ]
                    print(f"[Agent] Loaded {len(session_obj.curriculum_nodes)} curriculum nodes")
        else:
            # Create new session (manual start from teaching_aid)
            session_id = await create_session()
            initial_graph = await get_graph(session_id)
            _session_state["session_id"] = session_id
            _session_state["current_graph"] = initial_graph
            print(f"[Agent] Created new session {session_id} with {len(initial_graph.get('nodes', []))} nodes")
    except Exception as e:
        print(f"[Agent] Failed to create/fetch session: {e}")
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
            model="gemini-2.5-flash",
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

    # Store session reference for auto-teaching
    _session_state["agent_session"] = session

    # Start the session with our tutor agent
    await session.start(
        room=ctx.room,
        agent=TutorAgent(),
        room_input_options=RoomInputOptions(
            audio_enabled=True,
        ),
    )

    print("[Agent] Session started, listening for speech...")

    # Add data channel listener for node selection (auto-teaching)
    @ctx.room.on("data_received")
    async def on_data_received(data: bytes, participant=None, kind=None, topic=None):
        """Handle incoming data from frontend (node selection events)."""
        try:
            message = json.loads(data.decode())
            print(f"[Agent] Received data: {message}")

            if message.get("type") == "command":
                payload = message.get("payload", {})
                action = payload.get("action")

                if action == "node_selected":
                    # Student clicked on a node - auto-teach!
                    node_data = {
                        "id": payload.get("nodeId"),
                        "label": payload.get("label"),
                        "vizType": payload.get("vizType"),
                        "description": payload.get("description", "")
                    }
                    _session_state["current_node"] = node_data

                    print(f"[Agent] Node selected: {node_data['label']}")

                    # Generate auto-teaching response
                    description = node_data.get("description") or f"the topic of {node_data['label']}"
                    viz_type = node_data.get("vizType", "image")

                    viz_hint = ""
                    if viz_type == "three":
                        viz_hint = "A 3D visualization is now showing."
                    elif viz_type == "video":
                        viz_hint = "An animated visualization is now playing."
                    else:
                        viz_hint = "A diagram is now displayed."

                    # Use the stored session to generate a teaching response
                    agent_session = _session_state.get("agent_session")
                    if agent_session:
                        await agent_session.generate_reply(
                            instructions=f"""The student clicked on "{node_data['label']}" in the knowledge graph.

Topic description: {description}
{viz_hint}

Start teaching about this topic immediately! Give a brief, engaging introduction (2-3 sentences).
Explain what they're seeing in the visualization and what they'll learn.
Be enthusiastic but concise. End by asking if they have questions or want to go deeper."""
                        )
                    else:
                        print("[Agent] Warning: No agent session available for auto-teaching")

        except json.JSONDecodeError as e:
            print(f"[Agent] Failed to parse data message: {e}")
        except Exception as e:
            print(f"[Agent] Error handling data: {e}")
            import traceback
            traceback.print_exc()

    # Build greeting with available topics and curriculum context
    node_labels = [n.get("label", "") for n in _session_state["current_graph"].get("nodes", [])]
    if node_labels:
        topics_hint = f"I can see we have some topics ready: {', '.join(node_labels)}. "
    else:
        topics_hint = ""

    # Add curriculum-specific greeting if available
    curriculum_greeting = ""
    if _session_state["curriculum_context"]:
        curr = _session_state["curriculum_context"]
        course_name = curr.get("title", "this course")
        school_name = curr.get("school", "")
        curriculum_greeting = f"Welcome to {course_name}"
        if school_name:
            curriculum_greeting += f" from {school_name}"
        curriculum_greeting += "! "

        # Add topics hint if curriculum nodes available
        if _session_state["curriculum_nodes"]:
            topics = [n["label"] for n in _session_state["curriculum_nodes"][:3]]
            if topics:
                curriculum_greeting += f"We'll explore topics like {', '.join(topics)}. "

    # Send initial greeting
    await session.generate_reply(
        instructions=f"""Greet the student warmly and briefly. {curriculum_greeting}{topics_hint}
Ask what they'd like to learn about today.
Mention they can ask about ANY topic and you'll create a knowledge graph for them.
Keep it to 2-3 sentences max."""
    )


if __name__ == "__main__":
    print("[Agent] Starting LiveKit Voice Agent with Knowledge Graph Control...")
    agents.cli.run_app(server)
