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
    vizType: Optional[str] = None  # "three" | "video" | "image"
    expanded: bool = False  # Track if node has children
    depth: int = 0  # Track depth in tree (0=root, 1=first level, etc)
    parent_id: Optional[str] = None  # Track parent node ID

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
    curriculum_context: Optional[Dict] = None  # Context from nexhacksv0
    max_depth: int = 3  # Maximum depth for expansion (prevent infinite growth)

# In-memory store
sessions: Dict[str, Session] = {}

# Initial nodes for the knowledge graph - 3 specific visualization tools
INITIAL_NODES = [
    GraphNode(id="threejs", label="Three.js", vizType="three"),
    GraphNode(id="manim", label="Manim", vizType="video"),
    GraphNode(id="nano-banana-pro", label="Nano Banana Pro", vizType="image"),
]

# No links between them initially (they are independent tools)
INITIAL_LINKS: List[GraphLink] = []

# Default center is the first node
DEFAULT_CENTER_ID = "threejs"

def create_session(initial_center_id: str = None, curriculum_context: Optional[Dict] = None) -> Session:
    """Create a new session with the 3 initial nodes and optional curriculum context."""
    session_id = str(uuid.uuid4())

    # Use the 3 predefined nodes
    nodes = list(INITIAL_NODES)  # Copy to avoid mutation
    links = list(INITIAL_LINKS)
    center_id = initial_center_id if initial_center_id else DEFAULT_CENTER_ID

    session = Session(
        session_id=session_id,
        center_id=center_id,
        nodes=nodes,
        links=links,
        curriculum_context=curriculum_context
    )

    sessions[session_id] = session
    print(f"[SESSION] Created session {session_id} with curriculum: {curriculum_context.get('title') if curriculum_context else 'None'}")
    return session

def get_session(session_id: str) -> Optional[Session]:
    """Get a session by ID."""
    return sessions.get(session_id)

def update_session_center(session_id: str, new_center_id: str) -> Optional[Session]:
    """Update the center node of a session."""
    session = sessions.get(session_id)
    if not session:
        return None

    # Check if node exists in current session
    node_in_session = any(n.id == new_center_id for n in session.nodes)

    if node_in_session:
        # Update the center ID - keep existing nodes and links
        session.center_id = new_center_id
        print(f"[SessionStore] Updated center to {new_center_id}")
        return session

    # Node not found
    return None

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


def update_session_from_chat(
    session_id: str,
    nodes: List[dict],
    links: List[dict],
    center_id: str
) -> Optional[Session]:
    """
    Update a session with AI-generated graph data from chat.

    Args:
        session_id: The session ID to update
        nodes: List of node dicts with id, label, vizType
        links: List of link dicts with source, target
        center_id: The ID of the center node

    Returns:
        Updated session or None if session doesn't exist
    """
    session = sessions.get(session_id)
    if not session:
        return None

    # Convert to dataclass objects
    session.nodes = [
        GraphNode(
            id=n["id"],
            label=n["label"],
            vizType=n.get("vizType")
        )
        for n in nodes
    ]
    session.links = [
        GraphLink(source=l["source"], target=l["target"])
        for l in links
    ]
    session.center_id = center_id

    print(f"[SessionStore] Updated session {session_id} with {len(session.nodes)} nodes from chat")
    return session


def get_node_viz_type(session_id: str, node_id: str) -> Optional[str]:
    """
    Get the vizType for a specific node in a session.

    Returns:
        vizType string or None if not found
    """
    session = sessions.get(session_id)
    if not session:
        return None

    for node in session.nodes:
        if node.id == node_id:
            return node.vizType

    return None


def expand_node(
    session_id: str,
    parent_node_id: str,
    child_nodes: List[dict],
) -> Optional[Session]:
    """
    Expand a node by adding child nodes to it.

    Args:
        session_id: Session ID
        parent_node_id: ID of node to expand
        child_nodes: List of child node dicts with id, label, vizType

    Returns:
        Updated session or None if failed
    """
    session = sessions.get(session_id)
    if not session:
        print(f"[SessionStore] Session {session_id} not found")
        return None

    # Find parent node
    parent = None
    for node in session.nodes:
        if node.id == parent_node_id:
            parent = node
            break

    if not parent:
        print(f"[SessionStore] Parent node {parent_node_id} not found")
        return None

    # Check if already expanded
    if parent.expanded:
        print(f"[SessionStore] Node {parent_node_id} already expanded, skipping")
        return session

    # Check max depth
    if parent.depth >= session.max_depth:
        print(f"[SessionStore] Max depth {session.max_depth} reached for {parent_node_id}")
        return session

    # Add child nodes
    added_count = 0
    for child_data in child_nodes:
        child = GraphNode(
            id=child_data["id"],
            label=child_data["label"],
            vizType=child_data.get("vizType", "image"),
            expanded=False,
            depth=parent.depth + 1,
            parent_id=parent_node_id
        )
        session.nodes.append(child)

        # Add link from parent to child
        session.links.append(GraphLink(source=parent_node_id, target=child.id))
        added_count += 1

    # Mark parent as expanded
    parent.expanded = True

    print(f"[SessionStore] Expanded {parent_node_id} ({parent.label}) with {added_count} children at depth {parent.depth + 1}")
    return session

