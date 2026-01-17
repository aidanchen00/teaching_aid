"""
LiveKit Voice Agent using the official Agents Framework
Uses ElevenLabs for TTS and STT, Google Gemini for LLM
Supports dynamic domain switching for multi-topic knowledge graphs
"""

import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from livekit import agents
from livekit.agents import AgentServer, JobContext, RunContext
from livekit.agents.llm import function_tool
from livekit.agents.voice import Agent, AgentSession, RoomInputOptions
from livekit.plugins import silero, elevenlabs, google

try:
    # When run as module (python -m agent.main)
    from agent.backend_client import get_graph, switch_domain as api_switch_domain, select_node as api_select_node
    from agent.commands import AVAILABLE_DOMAINS
except ImportError:
    # When run directly or with livekit-agents
    from backend_client import get_graph, switch_domain as api_switch_domain, select_node as api_select_node
    from commands import AVAILABLE_DOMAINS

# Track session state per room
_room_sessions: dict = {}


class TutorAgent(Agent):
    """AI Tutor agent that helps students learn with multi-domain support."""

    def __init__(self, session_id: str = "learning-room", room=None) -> None:
        self.session_id = session_id
        self.current_domain = "calculus"
        self.current_nodes = []
        self._room = room  # rtc.Room instance for publishing data

        super().__init__(
            instructions="""You are a friendly AI tutor helping students learn various subjects.
Keep responses SHORT (1-2 sentences max). Be helpful and encouraging.
Do not use complex formatting, emojis, or special symbols.
Speak naturally and conversationally.

You can help students explore different educational domains:
- Calculus (derivatives, integrals, limits)
- Neural Networks & ML (perceptrons, backpropagation, activation functions)
- Linear Algebra (vectors, matrices, eigenvalues)
- Physics (mechanics, forces, waves)
- Statistics (probability, distributions, hypothesis testing)
- Discrete Math (graphs, trees, sets, logic)

When a student wants to learn about a new subject area, use the switch_domain tool.
When they want to focus on a specific topic within the current domain, use the select_topic tool.""",
        )

    async def on_enter(self):
        """Called when the agent enters the session."""
        # Load initial graph state
        try:
            graph_data = await get_graph(self.session_id)
            self.current_domain = graph_data.get("domain", "calculus")
            self.current_nodes = [n.get("label", n.get("id")) for n in graph_data.get("nodes", [])]
            print(f"[Agent] Loaded initial graph: domain={self.current_domain}, {len(self.current_nodes)} topics")
        except Exception as e:
            print(f"[Agent] Could not load initial graph: {e}")

        # Generate initial greeting
        domain_name = AVAILABLE_DOMAINS.get(self.current_domain, self.current_domain).split(" - ")[0]
        await self.session.generate_reply(
            instructions=f"Greet the student briefly. Mention you're currently exploring {domain_name} topics, but can switch to other subjects like neural networks, physics, linear algebra, statistics, or discrete math if they prefer. Ask what they'd like to learn about today.",
            allow_interruptions=False
        )

    async def _publish_graph_update(self, action: str, data: dict):
        """Publish graph update to the room via data channel."""
        if self._room and self._room.local_participant:
            try:
                message = json.dumps({
                    "type": "graph_update",
                    "action": action,
                    "data": data
                })
                await self._room.local_participant.publish_data(
                    message.encode(),
                    reliable=True
                )
                print(f"[Agent] Published graph update: {action}")
            except Exception as e:
                print(f"[Agent] Failed to publish update: {e}")

    @function_tool
    async def switch_domain(
        self,
        context: RunContext,
        domain: str,
    ) -> str:
        """Switch to a different educational domain/subject area.

        Args:
            domain: The domain to switch to. Valid options: calculus, neural_networks, linear_algebra, physics, statistics, discrete_math
        """
        if domain not in AVAILABLE_DOMAINS:
            return f"Invalid domain '{domain}'. Available domains are: {', '.join(AVAILABLE_DOMAINS.keys())}"

        try:
            result = await api_switch_domain(self.session_id, domain)
            self.current_domain = domain
            self.current_nodes = [n.get("label", n.get("id")) for n in result.get("nodes", [])]

            domain_name = AVAILABLE_DOMAINS[domain].split(" - ")[0]
            topics = ", ".join(self.current_nodes[:5])
            if len(self.current_nodes) > 5:
                topics += f", and {len(self.current_nodes) - 5} more"

            # Publish update to frontend
            await self._publish_graph_update("switch_domain", result)

            print(f"[Agent] Switched to domain: {domain}")
            return f"Switched to {domain_name}. Available topics include: {topics}"
        except Exception as e:
            print(f"[Agent] Error switching domain: {e}")
            return f"Sorry, I couldn't switch to {domain}. Please try again."

    @function_tool
    async def select_topic(
        self,
        context: RunContext,
        topic_id: str,
    ) -> str:
        """Select a specific topic within the current domain to focus on.

        Args:
            topic_id: The ID of the topic to select (e.g., 'derivatives', 'neural_networks', 'vectors')
        """
        try:
            result = await api_select_node(self.session_id, topic_id)
            self.current_nodes = [n.get("label", n.get("id")) for n in result.get("nodes", [])]

            center_label = next(
                (n.get("label") for n in result.get("nodes", []) if n.get("id") == topic_id),
                topic_id
            )

            # Publish update to frontend
            await self._publish_graph_update("select_node", result)

            print(f"[Agent] Selected topic: {topic_id}")
            return f"Now focused on {center_label}. Related topics: {', '.join(self.current_nodes[:4])}"
        except Exception as e:
            print(f"[Agent] Error selecting topic: {e}")
            return f"Sorry, I couldn't find the topic '{topic_id}'. Please try a different topic."

    @function_tool
    async def get_available_topics(
        self,
        context: RunContext,
    ) -> str:
        """Get the list of available topics in the current domain."""
        try:
            result = await get_graph(self.session_id)
            self.current_domain = result.get("domain", self.current_domain)
            self.current_nodes = [n.get("label", n.get("id")) for n in result.get("nodes", [])]

            domain_name = AVAILABLE_DOMAINS.get(self.current_domain, self.current_domain).split(" - ")[0]
            return f"Currently in {domain_name}. Available topics: {', '.join(self.current_nodes)}"
        except Exception as e:
            print(f"[Agent] Error getting topics: {e}")
            return "Sorry, I couldn't retrieve the topic list."

    @function_tool
    async def list_domains(
        self,
        context: RunContext,
    ) -> str:
        """List all available educational domains the student can explore."""
        domains_list = [f"{k}: {v}" for k, v in AVAILABLE_DOMAINS.items()]
        return f"Available domains: {'; '.join(domains_list)}"


# Create the server
server = AgentServer()


@server.rtc_session()
async def entrypoint(ctx: JobContext):
    """Main entrypoint for the agent."""

    print(f"[Agent] Job received for room: {ctx.room.name}")

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

    @session.on("speech_created")
    def on_speech(event):
        print(f"\n{'='*50}")
        print(f"AGENT RESPONDING: {event.content}")
        print(f"{'='*50}\n")

    # Use room name as session ID for backend API
    session_id = ctx.room.name
    print(f"[Agent] Using session ID: {session_id}")

    # Create the tutor agent with the session ID and room reference
    tutor = TutorAgent(session_id=session_id, room=ctx.room)

    # Start the session
    await session.start(
        room=ctx.room,
        agent=tutor,
        room_input_options=RoomInputOptions(
            audio_enabled=True,
        ),
    )

    print("[Agent] Session started, listening for speech...")


if __name__ == "__main__":
    print("[Agent] Starting LiveKit Voice Agent...")
    agents.cli.run_app(server)
