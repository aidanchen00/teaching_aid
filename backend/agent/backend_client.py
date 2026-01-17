import os
import httpx
from typing import Dict, List


def _get_backend_url() -> str:
    """Get backend URL at runtime to ensure dotenv has been loaded."""
    return os.getenv("BACKEND_URL", "http://localhost:8000")


async def get_graph(session_id: str) -> Dict:
    """
    Get current graph state from backend.

    Args:
        session_id: Session ID (e.g., "learning-room")

    Returns:
        {
            "centerId": "derivatives",
            "domain": "calculus",
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
            print(f"[Backend] Fetched graph: {len(data.get('nodes', []))} nodes, domain: {data.get('domain')}")
            return data

        except httpx.HTTPStatusError as e:
            print(f"[Backend] HTTP error: {e.response.status_code}")
            raise Exception(f"Backend request failed: {e.response.status_code}")

        except Exception as e:
            print(f"[Backend] Unexpected error: {e}")
            raise


async def switch_domain(session_id: str, domain: str) -> Dict:
    """
    Switch session to a different educational domain.

    Args:
        session_id: Session ID
        domain: New domain (calculus, neural_networks, linear_algebra, physics, statistics, discrete_math)

    Returns:
        {
            "centerId": "neural_networks",
            "domain": "neural_networks",
            "nodes": [{"id": "...", "label": "..."}, ...]
        }

    Raises:
        Exception if backend request fails
    """
    backend_url = _get_backend_url()
    url = f"{backend_url}/session/{session_id}/switch_domain"

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.post(url, json={"domain": domain})
            response.raise_for_status()

            data = response.json()
            print(f"[Backend] Switched to domain: {domain}, center: {data.get('centerId')}, {len(data.get('nodes', []))} nodes")
            return data

        except httpx.HTTPStatusError as e:
            print(f"[Backend] HTTP error switching domain: {e.response.status_code}")
            raise Exception(f"Backend request failed: {e.response.status_code}")

        except Exception as e:
            print(f"[Backend] Unexpected error switching domain: {e}")
            raise


async def select_node(session_id: str, node_id: str) -> Dict:
    """
    Select a node as the new center in the graph.

    Args:
        session_id: Session ID
        node_id: Node ID to select

    Returns:
        Updated graph with new center

    Raises:
        Exception if backend request fails
    """
    backend_url = _get_backend_url()
    url = f"{backend_url}/session/{session_id}/select_node"

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.post(url, json={"nodeId": node_id})
            response.raise_for_status()

            data = response.json()
            print(f"[Backend] Selected node: {node_id}, domain: {data.get('domain')}")
            return data

        except httpx.HTTPStatusError as e:
            print(f"[Backend] HTTP error selecting node: {e.response.status_code}")
            raise Exception(f"Backend request failed: {e.response.status_code}")

        except Exception as e:
            print(f"[Backend] Unexpected error selecting node: {e}")
            raise
