#!/usr/bin/env python3
"""
Single entry point for the backend.
Run with: python3 main.py

Starts both:
1. FastAPI server on port 8000
2. LiveKit agent for voice interaction
"""

import asyncio
import os
import sys
import signal
import threading
import multiprocessing
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


def run_agent_process():
    """Run LiveKit agent in a separate process."""
    # Import inside function to avoid issues with multiprocessing
    import os
    import sys
    from pathlib import Path

    # Setup paths
    backend_dir = Path(__file__).parent
    sys.path.insert(0, str(backend_dir))

    # Load env
    from dotenv import load_dotenv
    load_dotenv(backend_dir / ".env")

    # Inject 'start' argument for the LiveKit CLI (not 'dev' which uses file watcher)
    sys.argv = [sys.argv[0], 'start']

    # Now import agent dependencies
    from livekit import agents

    # Import the agent module to get entrypoint
    from agent.main import entrypoint

    print("[Agent] Starting LiveKit agent worker...")

    # Run the agent using WorkerOptions
    agents.cli.run_app(
        agents.WorkerOptions(
            entrypoint_fnc=entrypoint,
        )
    )


def main():
    print("\n" + "="*60)
    print("  TEACHING AID BACKEND")
    print("="*60)

    # Check environment
    env_ok = check_env()

    if not env_ok:
        print("[Warning] Starting without LiveKit agent (missing credentials)")
        print("[Warning] Voice interaction will not work\n")
        run_fastapi()
        return

    # Start agent in a separate process (not daemon so it can spawn children)
    print("\n[Agent] Launching LiveKit agent process...")
    agent_process = multiprocessing.Process(target=run_agent_process, args=())
    agent_process.start()

    print(f"[Agent] Agent process started (PID: {agent_process.pid})")

    # Handle shutdown
    def shutdown(sig, frame):
        print("\n[Shutdown] Stopping services...")
        if agent_process.is_alive():
            agent_process.terminate()
            agent_process.join(timeout=5)
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)

    # Run FastAPI in main process (blocking)
    try:
        run_fastapi()
    finally:
        if agent_process.is_alive():
            agent_process.terminate()
            agent_process.join(timeout=5)


if __name__ == "__main__":
    # Required for multiprocessing on macOS
    multiprocessing.set_start_method('spawn', force=True)
    main()
