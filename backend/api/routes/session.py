from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import datetime
from api.session_store import (
    create_session,
    get_session,
    update_session_center,
    find_node_by_label,
    set_curriculum_nodes,
    update_current_node,
    get_node_by_id,
    set_opennote_materials,
    get_opennote_materials,
)
from api.curriculum_generator import generate_curriculum, get_curriculum_metadata
from api.opennote_client import generate_opennote_materials

router = APIRouter()

class CreateSessionRequest(BaseModel):
    curriculum: Optional[Dict[str, Any]] = None

class CreateSessionResponse(BaseModel):
    sessionId: str
    curriculumGenerated: bool = False
    opennoteGenerated: bool = False

class SelectNodeRequest(BaseModel):
    nodeId: str

class GraphNodeResponse(BaseModel):
    id: str
    label: str
    vizType: Optional[str] = None
    description: Optional[str] = None
    summary: Optional[str] = None

class GraphResponse(BaseModel):
    centerId: str
    nodes: List[GraphNodeResponse]
    links: List[Dict[str, str]]

@router.post("/create")
async def create_new_session(request: Optional[CreateSessionRequest] = None) -> CreateSessionResponse:
    """
    Create a new learning session with initial 3 nodes and optional curriculum context.
    If curriculum context is provided, generates a curriculum using Gemini and OpenNote materials.

    Args:
        request: Optional curriculum context from nexhacksv0

    Returns:
        { "sessionId": "uuid", "curriculumGenerated": bool, "opennoteGenerated": bool }
    """
    curriculum_context = request.curriculum if request else None
    session = create_session(curriculum_context=curriculum_context)
    print(f"[API] POST /session/create -> {session.session_id}")

    curriculum_generated = False
    opennote_generated = False

    # If curriculum context provided, generate curriculum
    if curriculum_context:
        try:
            nodes, links = await generate_curriculum(curriculum_context)
            if nodes:
                set_curriculum_nodes(session.session_id, nodes, links)
                curriculum_generated = True
                print(f"[API] Generated curriculum with {len(nodes)} nodes")

                # Generate OpenNote materials from curriculum
                try:
                    materials = await generate_opennote_materials({
                        "metadata": curriculum_context,
                        "topics": [
                            {
                                "id": node.id,
                                "label": node.label,
                                "description": node.description,
                                "summary": node.summary
                            }
                            for node in nodes
                        ]
                    })

                    if materials:
                        set_opennote_materials(session.session_id, materials)
                        opennote_generated = True
                        print(f"[API] Generated OpenNote materials for session")
                except Exception as e:
                    print(f"[API] OpenNote generation failed: {e}")

        except Exception as e:
            print(f"[API] Curriculum generation failed: {e}")

    return CreateSessionResponse(
        sessionId=session.session_id,
        curriculumGenerated=curriculum_generated,
        opennoteGenerated=opennote_generated
    )

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
            GraphNodeResponse(
                id=node.id,
                label=node.label,
                vizType=node.vizType,
                description=node.description,
                summary=node.summary
            )
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
            GraphNodeResponse(
                id=node.id,
                label=node.label,
                vizType=node.vizType,
                description=node.description,
                summary=node.summary
            )
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
            GraphNodeResponse(
                id=node.id,
                label=node.label,
                vizType=node.vizType,
                description=node.description,
                summary=node.summary
            )
            for node in session.nodes
        ],
        links=[{"source": link.source, "target": link.target} for link in session.links]
    )


# ============ New Curriculum Endpoints ============

class CurriculumResponse(BaseModel):
    """Response for curriculum data (for OpenNote integration)."""
    metadata: Dict[str, Any]
    nodes: List[GraphNodeResponse]
    links: List[Dict[str, str]]


class NodeSelectResponse(BaseModel):
    """Response for node selection."""
    node: GraphNodeResponse
    message: str


@router.get("/{session_id}/curriculum")
async def get_curriculum(session_id: str) -> CurriculumResponse:
    """
    Get full curriculum data for OpenNote integration.

    Args:
        session_id: Session identifier

    Returns:
        Curriculum with metadata, nodes (with descriptions), and links
    """
    session = get_session(session_id)

    if not session:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")

    # Use curriculum_nodes if available, otherwise fall back to regular nodes
    nodes_to_use = session.curriculum_nodes if session.curriculum_nodes else session.nodes

    context = session.curriculum_context or {}

    curriculum_data = {
        "metadata": {
            "university": context.get("school", "Unknown"),
            "course": context.get("title", "Unknown Course"),
            "generatedAt": datetime.utcnow().isoformat(),
            "topicCount": len(nodes_to_use)
        },
        "nodes": [
            GraphNodeResponse(
                id=node.id,
                label=node.label,
                vizType=node.vizType,
                description=node.description,
                summary=node.summary
            )
            for node in nodes_to_use
        ],
        "links": [{"source": link.source, "target": link.target} for link in session.links]
    }

    print(f"[API] GET /session/{session_id}/curriculum -> {len(nodes_to_use)} nodes")

    return CurriculumResponse(**curriculum_data)


@router.post("/{session_id}/node/select")
async def select_node_for_teaching(session_id: str, request: SelectNodeRequest) -> NodeSelectResponse:
    """
    Select a node for teaching. Updates current_node_id in session.

    Args:
        session_id: Session identifier
        request: { "nodeId": "derivatives" }

    Returns:
        The selected node with its description
    """
    node_id = request.nodeId

    node = update_current_node(session_id, node_id)

    if not node:
        raise HTTPException(
            status_code=404,
            detail=f"Session {session_id} not found or node {node_id} not found"
        )

    print(f"[API] POST /session/{session_id}/node/select -> {node_id}")

    return NodeSelectResponse(
        node=GraphNodeResponse(
            id=node.id,
            label=node.label,
            vizType=node.vizType,
            description=node.description,
            summary=node.summary
        ),
        message=f"Selected node: {node.label}"
    )


# ============ OpenNote Endpoints ============

class OpenNoteMaterialsResponse(BaseModel):
    """Response for OpenNote materials."""
    materials: Dict[str, Any]
    breakoutRoomId: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


@router.get("/{session_id}/opennote")
async def get_opennote(session_id: str) -> OpenNoteMaterialsResponse:
    """
    Get OpenNote materials for a session (notebook, flashcards, practice problems).

    Args:
        session_id: Session identifier

    Returns:
        OpenNote materials and breakout room info
    """
    session = get_session(session_id)

    if not session:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")

    materials = session.opennote_materials

    if not materials:
        raise HTTPException(status_code=404, detail="OpenNote materials not found for this session")

    print(f"[API] GET /session/{session_id}/opennote -> materials found")

    return OpenNoteMaterialsResponse(
        materials=materials,
        breakoutRoomId=session.breakout_room_id,
        metadata=session.curriculum_context
    )
