"""
In-memory session store for managing learning sessions and knowledge graphs.
"""
import uuid
from typing import Dict, List, Optional
from dataclasses import dataclass, field

@dataclass
class GraphNode:
    id: str
    label: str

@dataclass
class GraphLink:
    source: str
    target: str

@dataclass
class Session:
    session_id: str
    center_id: str
    nodes: List[GraphNode] = field(default_factory=list)
    links: List[GraphLink] = field(default_factory=list)

# In-memory store
sessions: Dict[str, Session] = {}

# Knowledge domain structure - maps each concept to related concepts
KNOWLEDGE_GRAPH = {
    "derivatives": {
        "label": "Derivatives",
        "related": [
            ("limits", "Limits"),
            ("chain_rule", "Chain Rule"),
            ("product_rule", "Product Rule"),
            ("power_rule", "Power Rule"),
            ("implicit_differentiation", "Implicit Differentiation"),
        ]
    },
    "integrals": {
        "label": "Integrals",
        "related": [
            ("derivatives", "Derivatives"),
            ("integration_by_parts", "Integration by Parts"),
            ("substitution", "U-Substitution"),
            ("definite_integrals", "Definite Integrals"),
            ("fundamental_theorem", "Fundamental Theorem"),
        ]
    },
    "limits": {
        "label": "Limits",
        "related": [
            ("derivatives", "Derivatives"),
            ("continuity", "Continuity"),
            ("lhopitals_rule", "L'Hôpital's Rule"),
            ("infinite_limits", "Infinite Limits"),
            ("sequences", "Sequences"),
        ]
    },
    "chain_rule": {
        "label": "Chain Rule",
        "related": [
            ("derivatives", "Derivatives"),
            ("product_rule", "Product Rule"),
            ("implicit_differentiation", "Implicit Differentiation"),
            ("related_rates", "Related Rates"),
        ]
    },
    "product_rule": {
        "label": "Product Rule",
        "related": [
            ("derivatives", "Derivatives"),
            ("chain_rule", "Chain Rule"),
            ("quotient_rule", "Quotient Rule"),
        ]
    },
    "power_rule": {
        "label": "Power Rule",
        "related": [
            ("derivatives", "Derivatives"),
            ("polynomials", "Polynomials"),
            ("exponential_functions", "Exponential Functions"),
        ]
    },
    "implicit_differentiation": {
        "label": "Implicit Differentiation",
        "related": [
            ("derivatives", "Derivatives"),
            ("chain_rule", "Chain Rule"),
            ("related_rates", "Related Rates"),
        ]
    },
    "integration_by_parts": {
        "label": "Integration by Parts",
        "related": [
            ("integrals", "Integrals"),
            ("product_rule", "Product Rule"),
            ("definite_integrals", "Definite Integrals"),
        ]
    },
    "substitution": {
        "label": "U-Substitution",
        "related": [
            ("integrals", "Integrals"),
            ("chain_rule", "Chain Rule"),
            ("definite_integrals", "Definite Integrals"),
        ]
    },
    "definite_integrals": {
        "label": "Definite Integrals",
        "related": [
            ("integrals", "Integrals"),
            ("fundamental_theorem", "Fundamental Theorem"),
            ("riemann_sums", "Riemann Sums"),
        ]
    },
    "continuity": {
        "label": "Continuity",
        "related": [
            ("limits", "Limits"),
            ("derivatives", "Derivatives"),
            ("intermediate_value", "Intermediate Value Theorem"),
        ]
    },
}

def generate_graph(center_id: str) -> tuple[List[GraphNode], List[GraphLink]]:
    """
    Generate a deterministic knowledge graph centered on a specific node.
    
    Returns:
        - List of nodes (center + related)
        - List of links connecting center to related nodes
    """
    if center_id not in KNOWLEDGE_GRAPH:
        # Fallback to derivatives if unknown node
        center_id = "derivatives"
    
    center_data = KNOWLEDGE_GRAPH[center_id]
    
    # Build nodes
    nodes = [GraphNode(id=center_id, label=center_data["label"])]
    links = []
    
    for related_id, related_label in center_data["related"]:
        nodes.append(GraphNode(id=related_id, label=related_label))
        # Create bidirectional link
        links.append(GraphLink(source=center_id, target=related_id))
    
    return nodes, links

def create_session(initial_center_id: str = "derivatives") -> Session:
    """Create a new session with a unique ID."""
    session_id = str(uuid.uuid4())
    nodes, links = generate_graph(initial_center_id)
    
    session = Session(
        session_id=session_id,
        center_id=initial_center_id,
        nodes=nodes,
        links=links
    )
    
    sessions[session_id] = session
    return session

def get_session(session_id: str) -> Optional[Session]:
    """Get a session by ID."""
    return sessions.get(session_id)

def update_session_center(session_id: str, new_center_id: str) -> Optional[Session]:
    """Update the center node of a session and regenerate the graph."""
    session = sessions.get(session_id)
    if not session:
        return None
    
    # Validate the new center exists
    if new_center_id not in KNOWLEDGE_GRAPH:
        return None
    
    # Regenerate graph with new center
    nodes, links = generate_graph(new_center_id)
    session.center_id = new_center_id
    session.nodes = nodes
    session.links = links
    
    return session

def find_node_by_label(session_id: str, label: str) -> Optional[str]:
    """
    Find a node ID by its label (case-insensitive).
    Searches within the current session's graph.
    """
    session = sessions.get(session_id)
    if not session:
        return None
    
    label_lower = label.lower()
    for node in session.nodes:
        if node.label.lower() == label_lower:
            return node.id
    
    return None

