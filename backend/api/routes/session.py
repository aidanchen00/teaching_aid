from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional
from api.session_store import (
    create_session,
    get_session,
    update_session_center,
    find_node_by_label,
    switch_domain,
    get_all_domains,
)

router = APIRouter()

class CreateSessionResponse(BaseModel):
    sessionId: str
    domain: str

class SelectNodeRequest(BaseModel):
    nodeId: str

class SwitchDomainRequest(BaseModel):
    domain: str

class GraphResponse(BaseModel):
    centerId: str
    domain: str
    nodes: List[Dict[str, str]]
    links: List[Dict[str, str]]

class DomainsResponse(BaseModel):
    domains: Dict[str, Dict[str, str]]

@router.post("/create")
async def create_new_session(
    initial_center_id: str = "derivatives",
    domain: str = "calculus"
) -> CreateSessionResponse:
    """
    Create a new learning session.

    Args:
        initial_center_id: Optional starting node (defaults to domain's default)
        domain: Domain to start in (calculus, neural_networks, linear_algebra, physics, statistics, discrete_math)

    Returns:
        { "sessionId": "uuid", "domain": "calculus" }
    """
    session = create_session(initial_center_id, domain)
    print(f"[API] POST /session/create -> {session.session_id} (domain: {domain})")

    return CreateSessionResponse(sessionId=session.session_id, domain=session.domain)

@router.get("/{session_id}/graph")
async def get_session_graph(session_id: str) -> GraphResponse:
    """
    Get the current knowledge graph for a session.

    Args:
        session_id: Session identifier (UUID)

    Returns:
        {
            "centerId": "derivatives",
            "domain": "calculus",
            "nodes": [{"id": "...", "label": "..."}, ...],
            "links": [{"source": "...", "target": "..."}, ...]
        }
    """
    session = get_session(session_id)

    if not session:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")

    print(f"[API] GET /session/{session_id}/graph -> center: {session.center_id}, domain: {session.domain}")

    return GraphResponse(
        centerId=session.center_id,
        domain=session.domain,
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
        domain=session.domain,
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
        domain=session.domain,
        nodes=[{"id": node.id, "label": node.label} for node in session.nodes],
        links=[{"source": link.source, "target": link.target} for link in session.links]
    )

@router.get("/domains")
async def get_domains() -> DomainsResponse:
    """
    Get all available educational domains.

    Returns:
        {
            "domains": {
                "calculus": {"name": "Calculus", "default_center": "derivatives"},
                "neural_networks": {"name": "Neural Networks & ML", "default_center": "neural_networks"},
                ...
            }
        }
    """
    domains = get_all_domains()
    print(f"[API] GET /domains -> {len(domains)} domains")

    return DomainsResponse(domains=domains)

@router.post("/{session_id}/switch_domain")
async def switch_session_domain(session_id: str, request: SwitchDomainRequest) -> GraphResponse:
    """
    Switch a session to a different educational domain.

    Args:
        session_id: Session identifier
        request: { "domain": "neural_networks" }

    Returns:
        Updated graph in the new domain with default center
    """
    new_domain = request.domain

    session = switch_domain(session_id, new_domain)

    if not session:
        raise HTTPException(
            status_code=404,
            detail=f"Session {session_id} not found or invalid domain {new_domain}"
        )

    print(f"[API] POST /session/{session_id}/switch_domain -> new domain: {new_domain}, center: {session.center_id}")

    return GraphResponse(
        centerId=session.center_id,
        domain=session.domain,
        nodes=[{"id": node.id, "label": node.label} for node in session.nodes],
        links=[{"source": link.source, "target": link.target} for link in session.links]
    )
