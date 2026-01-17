import os
import io
import wave
import httpx
from typing import Optional

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_STT_MODEL = "scribe_v2_realtime"

async def transcribe_utterance(audio_bytes: bytes, sample_rate: int) -> str:
    """
    Transcribe audio using ElevenLabs STT API.

    Args:
        audio_bytes: Raw PCM audio data (int16, mono)
        sample_rate: Sample rate (typically 16000)

    Returns:
        Transcribed text

    Raises:
        Exception if STT fails
    """

    # Convert PCM to WAV format
    wav_buffer = _pcm_to_wav(audio_bytes, sample_rate)

    # Call ElevenLabs API
    url = "https://api.elevenlabs.io/v1/speech-to-text/transcriptions"

    headers = {
        "xi-api-key": ELEVENLABS_API_KEY
    }

    files = {
        "file": ("audio.wav", wav_buffer, "audio/wav")
    }

    data = {
        "model_id": ELEVENLABS_STT_MODEL,
        "enable_logging": False,  # Zero retention mode
        "file_format": "other"  # We're sending WAV, not raw PCM
    }

    print(f"[STT] Sending {len(audio_bytes)} bytes to ElevenLabs (sample_rate={sample_rate})")

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(url, headers=headers, files=files, data=data)
            response.raise_for_status()

            result = response.json()
            transcript = result.get("text", "")

            print(f"[STT] Success: '{transcript}'")
            return transcript

        except httpx.HTTPStatusError as e:
            print(f"[STT] HTTP error: {e.response.status_code} - {e.response.text}")
            raise Exception(f"ElevenLabs STT failed: {e.response.status_code}")

        except Exception as e:
            print(f"[STT] Unexpected error: {e}")
            raise


def _pcm_to_wav(pcm_data: bytes, sample_rate: int) -> io.BytesIO:
    """
    Convert raw PCM audio to WAV format.

    Args:
        pcm_data: Raw PCM data (int16, mono)
        sample_rate: Sample rate in Hz

    Returns:
        BytesIO buffer containing WAV file
    """
    wav_buffer = io.BytesIO()

    with wave.open(wav_buffer, 'wb') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit = 2 bytes
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(pcm_data)

    wav_buffer.seek(0)
    return wav_buffer
