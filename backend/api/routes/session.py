from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List
from api.session_store import (
    create_session,
    get_session,
    update_session_center,
    find_node_by_label,
)

router = APIRouter()

class CreateSessionResponse(BaseModel):
    sessionId: str

class SelectNodeRequest(BaseModel):
    nodeId: str

class GraphResponse(BaseModel):
    centerId: str
    nodes: List[Dict[str, str]]
    links: List[Dict[str, str]]

@router.post("/create")
async def create_new_session(initial_center_id: str = "derivatives") -> CreateSessionResponse:
    """
    Create a new learning session.
    
    Returns:
        { "sessionId": "uuid" }
    """
    session = create_session(initial_center_id)
    print(f"[API] POST /session/create -> {session.session_id}")
    
    return CreateSessionResponse(sessionId=session.session_id)

@router.get("/{session_id}/graph")
async def get_session_graph(session_id: str) -> GraphResponse:
    """
    Get the current knowledge graph for a session.

    Args:
        session_id: Session identifier (UUID)

    Returns:
        {
            "centerId": "derivatives",
            "nodes": [{"id": "...", "label": "..."}, ...],
            "links": [{"source": "...", "target": "..."}, ...]
        }
    """
    session = get_session(session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")

    print(f"[API] GET /session/{session_id}/graph -> center: {session.center_id}")

    return GraphResponse(
        centerId=session.center_id,
        nodes=[{"id": node.id, "label": node.label} for node in session.nodes],
        links=[{"source": link.source, "target": link.target} for link in session.links]
    )

@router.post("/{session_id}/select_node")
async def select_node(session_id: str, request: SelectNodeRequest) -> GraphResponse:
    """
    Select a node as the new center and regenerate the graph.
    
    Args:
        session_id: Session identifier
        request: { "nodeId": "derivatives" }
    
    Returns:
        Updated graph with new center
    """
    node_id = request.nodeId
    
    session = update_session_center(session_id, node_id)
    
    if not session:
        raise HTTPException(
            status_code=404, 
            detail=f"Session {session_id} not found or invalid node {node_id}"
        )
    
    print(f"[API] POST /session/{session_id}/select_node -> new center: {node_id}")
    
    return GraphResponse(
        centerId=session.center_id,
        nodes=[{"id": node.id, "label": node.label} for node in session.nodes],
        links=[{"source": link.source, "target": link.target} for link in session.links]
    )

@router.post("/{session_id}/back_to_graph")
async def back_to_graph(session_id: str) -> GraphResponse:
    """
    Return to graph view (returns current graph, no state change).
    
    Args:
        session_id: Session identifier
    
    Returns:
        Current graph
    """
    session = get_session(session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
    
    print(f"[API] POST /session/{session_id}/back_to_graph")
    
    return GraphResponse(
        centerId=session.center_id,
        nodes=[{"id": node.id, "label": node.label} for node in session.nodes],
        links=[{"source": link.source, "target": link.target} for link in session.links]
    )
