"""
LiveKit Voice Agent using the official Agents Framework
Uses ElevenLabs for TTS and STT, Google Gemini for LLM
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions, AgentServer, JobContext
from livekit.plugins import silero, elevenlabs, google


class TutorAgent(Agent):
    """AI Tutor agent that helps students learn."""

    def __init__(self) -> None:
        super().__init__(
            instructions="""You are a friendly AI tutor helping students learn.
Keep responses SHORT (1-2 sentences max). Be helpful and encouraging.
Do not use complex formatting, emojis, or special symbols.
Speak naturally and conversationally.""",
        )


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
        print(f"AGENT SPEAKING (source: {event.source})")
        print(f"{'='*50}\n")

    # Start the session
    await session.start(
        room=ctx.room,
        agent=TutorAgent(),
        room_input_options=RoomInputOptions(
            audio_enabled=True,
        ),
    )

    print("[Agent] Session started, listening for speech...")

    # Send initial greeting
    await session.generate_reply(
        instructions="Greet the student briefly and ask what they'd like to learn about today."
    )


if __name__ == "__main__":
    print("[Agent] Starting LiveKit Voice Agent...")
    agents.cli.run_app(server)
