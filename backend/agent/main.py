import asyncio
import os
import io
import wave
import httpx
import ssl
import certifi
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Fix SSL certificate verification on macOS Python 3.13
os.environ['SSL_CERT_FILE'] = certifi.where()
os.environ['REQUESTS_CA_BUNDLE'] = certifi.where()

from livekit import rtc
from livekit.agents import (
    AgentServer,
    AutoSubscribe,
    JobContext,
    cli,
)

# Simple STT function - just ElevenLabs API
async def transcribe_audio(audio_bytes: bytes, sample_rate: int) -> str:
    """Send audio to ElevenLabs and get text back"""
    
    api_key = os.getenv("ELEVENLABS_API_KEY")
    if not api_key:
        print("❌ ELEVENLABS_API_KEY not set!")
        return ""
    
    # Convert raw PCM to WAV
    wav_buffer = io.BytesIO()
    with wave.open(wav_buffer, 'wb') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(audio_bytes)
    wav_buffer.seek(0)
    
    # Call ElevenLabs
    url = "https://api.elevenlabs.io/v1/speech-to-text/transcriptions"
    headers = {"xi-api-key": api_key}
    files = {"file": ("audio.wav", wav_buffer, "audio/wav")}
    data = {"model_id": "scribe_v2_realtime"}
    
    print(f"📤 Sending {len(audio_bytes)} bytes to ElevenLabs...")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(url, headers=headers, files=files, data=data)
            response.raise_for_status()
            result = response.json()
            text = result.get("text", "")
            print(f"✅ STT Result: '{text}'")
            return text
        except Exception as e:
            print(f"❌ STT Error: {e}")
            return ""

# Create agent server
server = AgentServer()

@server.rtc_session()
async def entrypoint(ctx: JobContext):
    """Simple agent: collect audio and transcribe"""
    
    print(f"🤖 Agent joining room: {ctx.room.name}")
    
    # Connect to room
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    room = ctx.room
    
    print(f"✅ Connected as '{room.local_participant.identity}'")
    
    # Buffer to collect audio chunks
    audio_buffer = []
    buffer_duration = 3.0  # Process every 3 seconds
    sample_rate = 16000
    
    async def process_audio_track(track: rtc.Track, participant: rtc.RemoteParticipant):
        """Collect audio and send to STT every few seconds"""
        nonlocal audio_buffer, sample_rate
        
        print(f"🎤 Listening to {participant.identity}")
        
        audio_stream = rtc.AudioStream(track)
        frames_collected = 0
        max_frames = int(buffer_duration * 100)  # ~100 frames per second at 10ms chunks
        
        async for frame_event in audio_stream:
            frame = frame_event.frame
            
            # Update sample rate from first frame
            if frames_collected == 0:
                sample_rate = frame.sample_rate
                print(f"📊 Sample rate: {sample_rate} Hz")
            
            # Collect audio data
            audio_buffer.append(bytes(frame.data))
            frames_collected += 1
            
            # Process every N frames
            if frames_collected >= max_frames:
                # Combine all chunks
                combined_audio = b''.join(audio_buffer)
                
                # Send to STT (don't block the audio stream)
                asyncio.create_task(transcribe_audio(combined_audio, sample_rate))
                
                # Reset buffer
                audio_buffer = []
                frames_collected = 0
    
    def on_track_subscribed(
        track: rtc.Track,
        publication: rtc.RemoteTrackPublication,
        participant: rtc.RemoteParticipant,
    ):
        """Start processing when audio track arrives"""
        if track.kind == rtc.TrackKind.KIND_AUDIO:
            if "agent" not in participant.identity.lower():
                print(f"👂 Subscribed to {participant.identity}'s audio")
                asyncio.create_task(process_audio_track(track, participant))
    
    # Listen for tracks
    room.on("track_subscribed", on_track_subscribed)
    
    # Check for existing tracks
    for participant in room.remote_participants.values():
        if "agent" in participant.identity.lower():
            continue
        for pub in participant.track_publications.values():
            if pub.track and pub.kind == rtc.TrackKind.KIND_AUDIO:
                on_track_subscribed(pub.track, pub, participant)
    
    print("🎧 Agent ready! Speak and I'll transcribe...")
    
    # Keep running
    try:
        while True:
            await asyncio.sleep(1)
    except asyncio.CancelledError:
        print("👋 Agent shutting down")

if __name__ == "__main__":
    cli.run_app(server)
