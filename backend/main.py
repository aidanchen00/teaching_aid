#!/usr/bin/env python3
"""
Single entry point for the backend.
Run with: python3 main.py

Starts both:
1. FastAPI server on port 8000
2. LiveKit agent for voice transcription
"""

import asyncio
import os
import sys
import signal
import subprocess
from pathlib import Path

# Add backend to path
BACKEND_DIR = Path(__file__).parent
sys.path.insert(0, str(BACKEND_DIR))

# Load environment variables
from dotenv import load_dotenv
load_dotenv(BACKEND_DIR / ".env")

def check_env():
    """Check required environment variables."""
    required = {
        "ELEVEN_API_KEY": "ElevenLabs STT/TTS",
        "LIVEKIT_URL": "LiveKit WebSocket URL",
        "LIVEKIT_API_KEY": "LiveKit API Key",
        "LIVEKIT_API_SECRET": "LiveKit API Secret",
    }

    missing = []
    for var, desc in required.items():
        val = os.getenv(var)
        if not val or val.startswith("your_"):
            missing.append(f"  {var} - {desc}")

    if missing:
        print("\n" + "="*60)
        print("MISSING ENVIRONMENT VARIABLES")
        print("="*60)
        print("\nPlease set these in backend/.env:\n")
        for m in missing:
            print(m)
        print("\nGet LiveKit credentials from: https://cloud.livekit.io")
        print("="*60 + "\n")
        return False
    return True


def run_fastapi():
    """Run FastAPI server."""
    import uvicorn
    from api.main import app

    print("\n[FastAPI] Starting server on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")


def run_agent():
    """Run LiveKit agent using LiveKit Agents CLI."""
    print("\n[Agent] Starting LiveKit agent...")

    agent_path = BACKEND_DIR / "agent" / "main.py"

    env = os.environ.copy()
    env["PYTHONPATH"] = str(BACKEND_DIR)
    env["PYTHONUNBUFFERED"] = "1"

    # Run agent with 'dev' mode - registers worker, LiveKit dispatches to rooms
    proc = subprocess.Popen(
        [sys.executable, "-u", str(agent_path), "dev"],
        cwd=str(BACKEND_DIR),
        env=env,
    )
    return proc


def main():
    print("\n" + "="*60)
    print("  TEACHING AID BACKEND")
    print("="*60)

    # Check environment
    env_ok = check_env()

    if not env_ok:
        print("[Warning] Starting without LiveKit agent (missing credentials)")
        print("[Warning] Voice transcription will not work\n")
        run_fastapi()
        return

    # Start agent in background
    agent_proc = run_agent()

    # Handle shutdown
    def shutdown(sig, frame):
        print("\n[Shutdown] Stopping services...")
        agent_proc.terminate()
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)

    # Run FastAPI in main thread (blocking)
    try:
        run_fastapi()
    finally:
        agent_proc.terminate()


if __name__ == "__main__":
    main()
