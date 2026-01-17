import os
import io
import wave
import httpx
from typing import Optional

ELEVENLABS_STT_MODEL = "scribe_v2_realtime"


def _get_api_key() -> str:
    """Get API key at runtime to ensure dotenv has been loaded."""
    api_key = os.getenv("ELEVENLABS_API_KEY")
    if not api_key:
        raise Exception("ELEVENLABS_API_KEY environment variable is not set")
    return api_key


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
    # Get API key at runtime
    api_key = _get_api_key()

    # Convert PCM to WAV format
    wav_buffer = _pcm_to_wav(audio_bytes, sample_rate)

    # Call ElevenLabs API
    url = "https://api.elevenlabs.io/v1/speech-to-text/transcriptions"

    headers = {
        "xi-api-key": api_key
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
    print(f"[STT] API Key present: {bool(api_key)}")
    print(f"[STT] API Key length: {len(api_key)}")

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(url, headers=headers, files=files, data=data)
            print(f"[STT] Response status: {response.status_code}")
            response.raise_for_status()

            result = response.json()
            transcript = result.get("text", "")

            if not transcript or transcript.strip() == "":
                print("[STT] Warning: Empty transcript returned")
                return ""

            print(f"[STT] Success: '{transcript}'")
            return transcript

        except httpx.HTTPStatusError as e:
            # Try to get error details from response
            try:
                if hasattr(e.response, 'text') and e.response.text:
                    error_text = e.response.text
                    # Try to parse as JSON for better error message
                    try:
                        error_json = e.response.json()
                        if isinstance(error_json, dict):
                            error_msg = error_json.get('detail', {}).get('message', error_json.get('message', error_text))
                        else:
                            error_msg = error_text
                    except:
                        error_msg = error_text
                else:
                    error_msg = str(e)
            except:
                error_msg = str(e)
            
            print(f"[STT] HTTP error: {e.response.status_code} - {error_msg}")
            
            if e.response.status_code == 401:
                raise Exception("ElevenLabs API key is invalid or expired. Please check your ELEVENLABS_API_KEY environment variable.")
            elif e.response.status_code == 429:
                raise Exception("ElevenLabs API rate limit exceeded. Please try again later.")
            elif e.response.status_code == 400:
                raise Exception(f"ElevenLabs API bad request: {error_msg}")
            elif e.response.status_code == 413:
                raise Exception("Audio file too large for ElevenLabs API")
            else:
                raise Exception(f"ElevenLabs STT failed (HTTP {e.response.status_code}): {error_msg}")

        except httpx.TimeoutException:
            print("[STT] Request timeout")
            raise Exception("ElevenLabs STT request timed out")

        except Exception as e:
            print(f"[STT] Unexpected error: {e}")
            raise Exception(f"STT error: {str(e)}")


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
