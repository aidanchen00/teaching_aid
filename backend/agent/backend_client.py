import os
import httpx
from typing import Dict, List

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

async def get_graph(session_id: str) -> Dict:
    """
    Get current graph state from backend.

    Args:
        session_id: Session ID (e.g., "learning-room")

    Returns:
        {
            "centerId": "derivatives",
            "nodes": [{"id": "derivatives", "label": "Derivatives"}, ...]
        }

    Raises:
        Exception if backend request fails
    """

    url = f"{BACKEND_URL}/session/{session_id}/graph"

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(url)
            response.raise_for_status()

            data = response.json()
            print(f"[Backend] Fetched graph: {len(data.get('nodes', []))} nodes")
            return data

        except httpx.HTTPStatusError as e:
            print(f"[Backend] HTTP error: {e.response.status_code}")
            raise Exception(f"Backend request failed: {e.response.status_code}")

        except Exception as e:
            print(f"[Backend] Unexpected error: {e}")
            raise
