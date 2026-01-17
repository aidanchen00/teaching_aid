import numpy as np
from collections import deque
from typing import Optional, Tuple

class VoiceActivityDetector:
    """
    Voice activity detection using RMS energy threshold.
    Implements "send on silence" utterance segmentation.
    """

    def __init__(
        self,
        sample_rate: int = 16000,
        frame_duration_ms: int = 30,
        energy_threshold: float = 0.02,
        speech_start_frames: int = 3,
        silence_duration_ms: int = 1000,
        max_utterance_sec: float = 12.0,
        preroll_ms: int = 200
    ):
        self.sample_rate = sample_rate
        self.frame_duration_ms = frame_duration_ms
        self.energy_threshold = energy_threshold
        self.speech_start_frames = speech_start_frames
        self.silence_duration_ms = silence_duration_ms
        self.max_utterance_sec = max_utterance_sec
        self.preroll_ms = preroll_ms

        # Calculate frame sizes
        self.frame_samples = int(sample_rate * frame_duration_ms / 1000)
        self.silence_frames = int(silence_duration_ms / frame_duration_ms)
        self.max_utterance_frames = int(max_utterance_sec * 1000 / frame_duration_ms)
        self.preroll_frames = int(preroll_ms / frame_duration_ms)

        # State
        self.is_speech = False
        self.speech_start_count = 0
        self.silence_count = 0
        self.utterance_buffer = []
        self.preroll_buffer = deque(maxlen=self.preroll_frames)

        print(f"[VAD] Initialized: threshold={energy_threshold}, silence_duration={silence_duration_ms}ms")

    def process_frame(self, frame: np.ndarray) -> Tuple[bool, Optional[bytes]]:
        """
        Process an audio frame and return (utterance_complete, audio_buffer).

        Args:
            frame: Audio samples as int16 numpy array

        Returns:
            (True, audio_bytes) if utterance is complete
            (False, None) otherwise
        """

        # Compute RMS energy
        energy = self._compute_energy(frame)

        # Add to preroll buffer
        self.preroll_buffer.append(frame.tobytes())

        # State machine
        if not self.is_speech:
            # Waiting for speech to start
            if energy > self.energy_threshold:
                self.speech_start_count += 1
                if self.speech_start_count >= self.speech_start_frames:
                    # Speech started - add preroll
                    self.is_speech = True
                    self.utterance_buffer = list(self.preroll_buffer)
                    print("[VAD] Speech started")
            else:
                self.speech_start_count = 0

        else:
            # Currently in speech
            self.utterance_buffer.append(frame.tobytes())

            if energy < self.energy_threshold:
                self.silence_count += 1

                # Check if silence duration exceeded
                if self.silence_count >= self.silence_frames:
                    print(f"[VAD] Speech ended (silence: {self.silence_duration_ms}ms)")
                    return self._finalize_utterance()
            else:
                self.silence_count = 0

            # Check max utterance length
            if len(self.utterance_buffer) >= self.max_utterance_frames:
                print(f"[VAD] Speech ended (max length: {self.max_utterance_sec}s)")
                return self._finalize_utterance()

        return False, None

    def _compute_energy(self, frame: np.ndarray) -> float:
        """Compute RMS energy of audio frame"""
        if len(frame) == 0:
            return 0.0

        # Convert to float [-1, 1]
        samples = frame.astype(np.float32) / 32768.0

        # RMS
        rms = np.sqrt(np.mean(samples ** 2))
        return rms

    def _finalize_utterance(self) -> Tuple[bool, bytes]:
        """Finalize and return the utterance buffer"""
        audio_bytes = b''.join(self.utterance_buffer)

        # Reset state
        self.is_speech = False
        self.speech_start_count = 0
        self.silence_count = 0
        self.utterance_buffer = []

        return True, audio_bytes
