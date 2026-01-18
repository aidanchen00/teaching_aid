import os
import httpx
from typing import Dict, Optional


def _get_backend_url() -> str:
    """Get backend URL at runtime to ensure dotenv has been loaded."""
    url = os.getenv("BACKEND_URL", "http://localhost:8000")
    return url.rstrip('/')  # Remove trailing slash to avoid double slashes


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
    backend_url = _get_backend_url()
    url = f"{backend_url}/session/{session_id}/graph"

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


async def generate_graph_from_topic(topic: str, session_id: Optional[str] = None) -> Dict:
    """
    Generate a knowledge graph from a topic query using Gemini.

    Args:
        topic: User's topic query (e.g., "what is calculus", "teach me physics")
        session_id: Optional session ID to save the graph to

    Returns:
        {
            "message": "Brief explanation",
            "nodes": [...],
            "links": [...],
            "centerId": "..."
        }
    """
    backend_url = _get_backend_url()
    url = f"{backend_url}/chat"

    payload = {"message": topic}
    if session_id:
        payload["sessionId"] = session_id

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(url, json=payload)
            response.raise_for_status()

            data = response.json()
            print(f"[Backend] Generated graph: {len(data.get('nodes', []))} nodes, center={data.get('centerId')}")
            return data

        except httpx.HTTPStatusError as e:
            print(f"[Backend] HTTP error generating graph: {e.response.status_code}")
            raise Exception(f"Failed to generate graph: {e.response.status_code}")

        except Exception as e:
            print(f"[Backend] Error generating graph: {e}")
            raise


async def select_node(session_id: str, node_id: str) -> Dict:
    """
    Select a node in the session, updating the center.

    Args:
        session_id: Session ID
        node_id: ID of the node to select

    Returns:
        Updated graph data
    """
    backend_url = _get_backend_url()
    url = f"{backend_url}/session/{session_id}/select_node"

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.post(url, json={"nodeId": node_id})
            response.raise_for_status()

            data = response.json()
            print(f"[Backend] Selected node: {node_id}")
            return data

        except httpx.HTTPStatusError as e:
            print(f"[Backend] HTTP error selecting node: {e.response.status_code}")
            raise Exception(f"Failed to select node: {e.response.status_code}")

        except Exception as e:
            print(f"[Backend] Error selecting node: {e}")
            raise


async def create_session() -> str:
    """
    Create a new learning session.

    Returns:
        Session ID
    """
    backend_url = _get_backend_url()
    url = f"{backend_url}/session/create"

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.post(url)
            response.raise_for_status()

            data = response.json()
            session_id = data.get("sessionId")
            print(f"[Backend] Created session: {session_id}")
            return session_id

        except Exception as e:
            print(f"[Backend] Error creating session: {e}")
            raise
