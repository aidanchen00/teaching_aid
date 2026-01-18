from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from api.session_store import (
    create_session,
    get_session,
    update_session_center,
    find_node_by_label,
)

router = APIRouter()

class CreateSessionRequest(BaseModel):
    curriculum: Optional[Dict[str, Any]] = None

class CreateSessionResponse(BaseModel):
    sessionId: str

class SelectNodeRequest(BaseModel):
    nodeId: str

class GraphNodeResponse(BaseModel):
    id: str
    label: str
    vizType: Optional[str] = None

class GraphResponse(BaseModel):
    centerId: str
    nodes: List[GraphNodeResponse]
    links: List[Dict[str, str]]

@router.post("/create")
async def create_new_session(request: Optional[CreateSessionRequest] = None) -> CreateSessionResponse:
    """
    Create a new learning session with initial 3 nodes and optional curriculum context.

    Args:
        request: Optional curriculum context from nexhacksv0

    Returns:
        { "sessionId": "uuid" }
    """
    curriculum_context = request.curriculum if request else None
    session = create_session(curriculum_context=curriculum_context)
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
        nodes=[
            GraphNodeResponse(id=node.id, label=node.label, vizType=node.vizType)
            for node in session.nodes
        ],
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
        nodes=[
            GraphNodeResponse(id=node.id, label=node.label, vizType=node.vizType)
            for node in session.nodes
        ],
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
        nodes=[
            GraphNodeResponse(id=node.id, label=node.label, vizType=node.vizType)
            for node in session.nodes
        ],
        links=[{"source": link.source, "target": link.target} for link in session.links]
    )
