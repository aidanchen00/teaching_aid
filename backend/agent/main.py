import asyncio
import os
import json
import numpy as np
from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import JobContext, WorkerOptions, cli

from vad import VoiceActivityDetector
from stt_elevenlabs import transcribe_utterance
from backend_client import get_graph
from nlu import map_transcript_to_command
from commands import validate_command

load_dotenv()

SESSION_ID = "learning-room"  # Constant session ID

async def entrypoint(ctx: JobContext):
    """Agent entry point - joins room and processes audio"""

    # Connect to room
    await ctx.connect()
    room = ctx.room

    # Publish agent's own tracks (silent audio + placeholder video)
    # This makes the agent appear in the frontend
    audio_source = rtc.AudioSource(16000, 1)
    video_source = rtc.VideoSource(640, 480)

    audio_track = rtc.LocalAudioTrack.create_audio_track("agent_audio", audio_source)
    video_track = rtc.LocalVideoTrack.create_video_track("agent_video", video_source)

    await room.local_participant.publish_track(audio_track, rtc.TrackPublishOptions())
    await room.local_participant.publish_track(video_track, rtc.TrackPublishOptions())

    print(f"[Agent] Connected to room: {room.name} as '{room.local_participant.identity}'")

    # Initialize VAD
    vad = VoiceActivityDetector(
        sample_rate=16000,
        frame_duration_ms=30,
        silence_duration_ms=1000,
        max_utterance_sec=12.0
    )

    # Wait for user to join and subscribe to their audio
    async def wait_for_user():
        """Wait for a user participant and subscribe to their audio"""
        while True:
            for participant in room.remote_participants.values():
                if "agent" not in participant.identity.lower():
                    print(f"[Agent] Found user participant: {participant.identity}")

                    # Subscribe to user's audio track
                    for publication in participant.track_publications.values():
                        if publication.kind == rtc.TrackKind.KIND_AUDIO and publication.track:
                            print(f"[Agent] Subscribing to {participant.identity}'s audio")
                            return publication.track

                    # If track not yet available, wait for it
                    print(f"[Agent] Waiting for {participant.identity}'s audio track...")

            await asyncio.sleep(0.5)

    # Get user's audio track
    user_audio_track = await wait_for_user()

    # Create audio stream from track
    audio_stream = rtc.AudioStream(user_audio_track)

    print(f"[Agent] Processing audio stream...")

    # Process audio frames
    async for frame in audio_stream:
        # Convert frame data to numpy array
        audio_data = np.frombuffer(frame.data, dtype=np.int16)

        utterance_complete, audio_buffer = vad.process_frame(audio_data)

        if utterance_complete and audio_buffer:
            # Process utterance in background (don't block audio stream)
            asyncio.create_task(process_utterance(room, audio_buffer, vad.sample_rate))


async def process_utterance(room: rtc.Room, audio_buffer: bytes, sample_rate: int):
    """Process a complete utterance: STT → Backend → NLU → Publish"""

    print(f"[Agent] Processing utterance ({len(audio_buffer)} bytes)")

    # 1. STT with ElevenLabs
    try:
        transcript = await transcribe_utterance(audio_buffer, sample_rate)
        print(f"[Agent] Transcript: '{transcript}'")

        if not transcript or transcript.strip() == "":
            print("[Agent] Empty transcript, skipping")
            return

    except Exception as e:
        print(f"[Agent] STT failed: {e}")
        await send_error_command(room, "Speech recognition failed")
        return

    # 2. Query backend for graph
    try:
        graph_data = await get_graph(SESSION_ID)
        node_labels = [node["label"] for node in graph_data["nodes"]]
        print(f"[Agent] Graph nodes: {node_labels}")
    except Exception as e:
        print(f"[Agent] Backend query failed: {e}")
        await send_error_command(room, "Failed to fetch graph data")
        return

    # 3. NLU with Gemini
    try:
        command = await map_transcript_to_command(transcript, node_labels)
        print(f"[Agent] Command: {command}")

        if command.get("action") == "clarify":
            print(f"[Agent] Clarification needed: {command.get('question')}")
            return  # Don't publish clarify commands (Step 3 requirement)

        # Validate command
        if not validate_command(command):
            print(f"[Agent] Invalid command format: {command}")
            return

    except Exception as e:
        print(f"[Agent] NLU failed: {e}")
        await send_error_command(room, "Failed to understand command")
        return

    # 4. Publish command via data channel
    await send_command(room, command)


async def send_command(room: rtc.Room, command: dict):
    """Publish command to frontend via data channel"""
    message = {
        "type": "command",
        "payload": command
    }

    data = json.dumps(message).encode("utf-8")

    await room.local_participant.publish_data(
        data,
        reliable=True
    )

    print(f"[Agent] Published command: {command}")


async def send_error_command(room: rtc.Room, error_message: str):
    """Send error command to frontend"""
    await send_command(room, {
        "action": "error",
        "message": error_message
    })


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
        )
    )
