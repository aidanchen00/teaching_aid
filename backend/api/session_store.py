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
    domain: str = "calculus"
    nodes: List[GraphNode] = field(default_factory=list)
    links: List[GraphLink] = field(default_factory=list)

# In-memory store
sessions: Dict[str, Session] = {}

# Domain registry - defines available educational domains
DOMAINS = {
    "calculus": {"name": "Calculus", "default_center": "derivatives"},
    "neural_networks": {"name": "Neural Networks & ML", "default_center": "neural_networks"},
    "linear_algebra": {"name": "Linear Algebra", "default_center": "vectors"},
    "physics": {"name": "Physics", "default_center": "mechanics"},
    "statistics": {"name": "Statistics", "default_center": "probability"},
    "discrete_math": {"name": "Discrete Math", "default_center": "graphs"},
}

# =============================================================================
# CALCULUS KNOWLEDGE GRAPH
# =============================================================================
CALCULUS_GRAPH = {
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

# =============================================================================
# NEURAL NETWORKS & ML KNOWLEDGE GRAPH
# =============================================================================
NEURAL_NETWORKS_GRAPH = {
    "neural_networks": {
        "label": "Neural Networks",
        "related": [
            ("perceptron", "Perceptron"),
            ("activation_functions", "Activation Functions"),
            ("backpropagation", "Backpropagation"),
            ("convolutional_networks", "CNNs"),
            ("loss_functions", "Loss Functions"),
        ]
    },
    "perceptron": {
        "label": "Perceptron",
        "related": [
            ("neural_networks", "Neural Networks"),
            ("activation_functions", "Activation Functions"),
            ("sigmoid", "Sigmoid"),
        ]
    },
    "activation_functions": {
        "label": "Activation Functions",
        "related": [
            ("neural_networks", "Neural Networks"),
            ("relu", "ReLU"),
            ("sigmoid", "Sigmoid"),
            ("perceptron", "Perceptron"),
        ]
    },
    "relu": {
        "label": "ReLU",
        "related": [
            ("activation_functions", "Activation Functions"),
            ("convolutional_networks", "CNNs"),
            ("backpropagation", "Backpropagation"),
        ]
    },
    "sigmoid": {
        "label": "Sigmoid",
        "related": [
            ("activation_functions", "Activation Functions"),
            ("perceptron", "Perceptron"),
            ("loss_functions", "Loss Functions"),
        ]
    },
    "backpropagation": {
        "label": "Backpropagation",
        "related": [
            ("neural_networks", "Neural Networks"),
            ("gradient_descent", "Gradient Descent"),
            ("loss_functions", "Loss Functions"),
            ("activation_functions", "Activation Functions"),
        ]
    },
    "gradient_descent": {
        "label": "Gradient Descent",
        "related": [
            ("backpropagation", "Backpropagation"),
            ("loss_functions", "Loss Functions"),
            ("regularization", "Regularization"),
        ]
    },
    "loss_functions": {
        "label": "Loss Functions",
        "related": [
            ("neural_networks", "Neural Networks"),
            ("backpropagation", "Backpropagation"),
            ("gradient_descent", "Gradient Descent"),
        ]
    },
    "convolutional_networks": {
        "label": "CNNs",
        "related": [
            ("neural_networks", "Neural Networks"),
            ("relu", "ReLU"),
            ("regularization", "Regularization"),
        ]
    },
    "regularization": {
        "label": "Regularization",
        "related": [
            ("neural_networks", "Neural Networks"),
            ("gradient_descent", "Gradient Descent"),
            ("convolutional_networks", "CNNs"),
        ]
    },
}

# =============================================================================
# LINEAR ALGEBRA KNOWLEDGE GRAPH
# =============================================================================
LINEAR_ALGEBRA_GRAPH = {
    "vectors": {
        "label": "Vectors",
        "related": [
            ("dot_product", "Dot Product"),
            ("cross_product", "Cross Product"),
            ("matrices", "Matrices"),
            ("vector_spaces", "Vector Spaces"),
        ]
    },
    "dot_product": {
        "label": "Dot Product",
        "related": [
            ("vectors", "Vectors"),
            ("cross_product", "Cross Product"),
            ("matrices", "Matrices"),
        ]
    },
    "cross_product": {
        "label": "Cross Product",
        "related": [
            ("vectors", "Vectors"),
            ("dot_product", "Dot Product"),
            ("determinants", "Determinants"),
        ]
    },
    "matrices": {
        "label": "Matrices",
        "related": [
            ("vectors", "Vectors"),
            ("matrix_multiplication", "Matrix Multiplication"),
            ("linear_transformations", "Linear Transformations"),
            ("determinants", "Determinants"),
        ]
    },
    "matrix_multiplication": {
        "label": "Matrix Multiplication",
        "related": [
            ("matrices", "Matrices"),
            ("linear_transformations", "Linear Transformations"),
            ("inverse_matrix", "Matrix Inverse"),
        ]
    },
    "linear_transformations": {
        "label": "Linear Transformations",
        "related": [
            ("matrices", "Matrices"),
            ("eigenvalues", "Eigenvalues"),
            ("eigenvectors", "Eigenvectors"),
        ]
    },
    "eigenvalues": {
        "label": "Eigenvalues",
        "related": [
            ("linear_transformations", "Linear Transformations"),
            ("eigenvectors", "Eigenvectors"),
            ("determinants", "Determinants"),
        ]
    },
    "eigenvectors": {
        "label": "Eigenvectors",
        "related": [
            ("eigenvalues", "Eigenvalues"),
            ("linear_transformations", "Linear Transformations"),
            ("vector_spaces", "Vector Spaces"),
        ]
    },
    "determinants": {
        "label": "Determinants",
        "related": [
            ("matrices", "Matrices"),
            ("inverse_matrix", "Matrix Inverse"),
            ("cross_product", "Cross Product"),
        ]
    },
    "inverse_matrix": {
        "label": "Matrix Inverse",
        "related": [
            ("matrices", "Matrices"),
            ("determinants", "Determinants"),
            ("matrix_multiplication", "Matrix Multiplication"),
        ]
    },
    "vector_spaces": {
        "label": "Vector Spaces",
        "related": [
            ("vectors", "Vectors"),
            ("eigenvectors", "Eigenvectors"),
            ("linear_transformations", "Linear Transformations"),
        ]
    },
}

# =============================================================================
# PHYSICS KNOWLEDGE GRAPH
# =============================================================================
PHYSICS_GRAPH = {
    "mechanics": {
        "label": "Mechanics",
        "related": [
            ("kinematics", "Kinematics"),
            ("forces", "Forces"),
            ("momentum", "Momentum"),
            ("energy", "Energy"),
            ("rotation", "Rotation"),
        ]
    },
    "kinematics": {
        "label": "Kinematics",
        "related": [
            ("mechanics", "Mechanics"),
            ("forces", "Forces"),
            ("projectile_motion", "Projectile Motion"),
        ]
    },
    "forces": {
        "label": "Forces",
        "related": [
            ("mechanics", "Mechanics"),
            ("newtons_laws", "Newton's Laws"),
            ("momentum", "Momentum"),
            ("kinematics", "Kinematics"),
        ]
    },
    "newtons_laws": {
        "label": "Newton's Laws",
        "related": [
            ("forces", "Forces"),
            ("momentum", "Momentum"),
            ("energy", "Energy"),
        ]
    },
    "momentum": {
        "label": "Momentum",
        "related": [
            ("mechanics", "Mechanics"),
            ("forces", "Forces"),
            ("newtons_laws", "Newton's Laws"),
            ("energy", "Energy"),
        ]
    },
    "energy": {
        "label": "Energy",
        "related": [
            ("mechanics", "Mechanics"),
            ("work", "Work"),
            ("momentum", "Momentum"),
        ]
    },
    "work": {
        "label": "Work",
        "related": [
            ("energy", "Energy"),
            ("forces", "Forces"),
            ("kinematics", "Kinematics"),
        ]
    },
    "rotation": {
        "label": "Rotation",
        "related": [
            ("mechanics", "Mechanics"),
            ("oscillations", "Oscillations"),
            ("momentum", "Momentum"),
        ]
    },
    "waves": {
        "label": "Waves",
        "related": [
            ("oscillations", "Oscillations"),
            ("energy", "Energy"),
            ("mechanics", "Mechanics"),
        ]
    },
    "oscillations": {
        "label": "Oscillations",
        "related": [
            ("waves", "Waves"),
            ("rotation", "Rotation"),
            ("energy", "Energy"),
        ]
    },
    "projectile_motion": {
        "label": "Projectile Motion",
        "related": [
            ("kinematics", "Kinematics"),
            ("forces", "Forces"),
            ("energy", "Energy"),
        ]
    },
}

# =============================================================================
# STATISTICS KNOWLEDGE GRAPH
# =============================================================================
STATISTICS_GRAPH = {
    "probability": {
        "label": "Probability",
        "related": [
            ("distributions", "Distributions"),
            ("bayes_theorem", "Bayes Theorem"),
            ("expected_value", "Expected Value"),
            ("variance", "Variance"),
        ]
    },
    "distributions": {
        "label": "Distributions",
        "related": [
            ("probability", "Probability"),
            ("normal_distribution", "Normal Distribution"),
            ("expected_value", "Expected Value"),
        ]
    },
    "normal_distribution": {
        "label": "Normal Distribution",
        "related": [
            ("distributions", "Distributions"),
            ("variance", "Variance"),
            ("hypothesis_testing", "Hypothesis Testing"),
        ]
    },
    "bayes_theorem": {
        "label": "Bayes Theorem",
        "related": [
            ("probability", "Probability"),
            ("distributions", "Distributions"),
            ("hypothesis_testing", "Hypothesis Testing"),
        ]
    },
    "expected_value": {
        "label": "Expected Value",
        "related": [
            ("probability", "Probability"),
            ("variance", "Variance"),
            ("distributions", "Distributions"),
        ]
    },
    "variance": {
        "label": "Variance",
        "related": [
            ("expected_value", "Expected Value"),
            ("normal_distribution", "Normal Distribution"),
            ("regression", "Regression"),
        ]
    },
    "hypothesis_testing": {
        "label": "Hypothesis Testing",
        "related": [
            ("normal_distribution", "Normal Distribution"),
            ("confidence_intervals", "Confidence Intervals"),
            ("bayes_theorem", "Bayes Theorem"),
        ]
    },
    "confidence_intervals": {
        "label": "Confidence Intervals",
        "related": [
            ("hypothesis_testing", "Hypothesis Testing"),
            ("normal_distribution", "Normal Distribution"),
            ("variance", "Variance"),
        ]
    },
    "regression": {
        "label": "Regression",
        "related": [
            ("correlation", "Correlation"),
            ("variance", "Variance"),
            ("expected_value", "Expected Value"),
        ]
    },
    "correlation": {
        "label": "Correlation",
        "related": [
            ("regression", "Regression"),
            ("variance", "Variance"),
            ("probability", "Probability"),
        ]
    },
}

# =============================================================================
# DISCRETE MATH KNOWLEDGE GRAPH
# =============================================================================
DISCRETE_MATH_GRAPH = {
    "graphs": {
        "label": "Graph Theory",
        "related": [
            ("trees", "Trees"),
            ("paths", "Paths"),
            ("cycles", "Cycles"),
            ("connectivity", "Connectivity"),
        ]
    },
    "trees": {
        "label": "Trees",
        "related": [
            ("graphs", "Graph Theory"),
            ("paths", "Paths"),
            ("recursion", "Recursion"),
        ]
    },
    "paths": {
        "label": "Paths",
        "related": [
            ("graphs", "Graph Theory"),
            ("cycles", "Cycles"),
            ("connectivity", "Connectivity"),
        ]
    },
    "cycles": {
        "label": "Cycles",
        "related": [
            ("graphs", "Graph Theory"),
            ("paths", "Paths"),
            ("trees", "Trees"),
        ]
    },
    "connectivity": {
        "label": "Connectivity",
        "related": [
            ("graphs", "Graph Theory"),
            ("paths", "Paths"),
            ("trees", "Trees"),
        ]
    },
    "combinatorics": {
        "label": "Combinatorics",
        "related": [
            ("permutations", "Permutations"),
            ("combinations", "Combinations"),
            ("sets", "Sets"),
        ]
    },
    "permutations": {
        "label": "Permutations",
        "related": [
            ("combinatorics", "Combinatorics"),
            ("combinations", "Combinations"),
            ("recursion", "Recursion"),
        ]
    },
    "combinations": {
        "label": "Combinations",
        "related": [
            ("combinatorics", "Combinatorics"),
            ("permutations", "Permutations"),
            ("sets", "Sets"),
        ]
    },
    "logic": {
        "label": "Logic",
        "related": [
            ("proofs", "Proofs"),
            ("sets", "Sets"),
            ("recursion", "Recursion"),
        ]
    },
    "proofs": {
        "label": "Proofs",
        "related": [
            ("logic", "Logic"),
            ("recursion", "Recursion"),
            ("sets", "Sets"),
        ]
    },
    "recursion": {
        "label": "Recursion",
        "related": [
            ("trees", "Trees"),
            ("proofs", "Proofs"),
            ("combinatorics", "Combinatorics"),
        ]
    },
    "sets": {
        "label": "Sets",
        "related": [
            ("logic", "Logic"),
            ("combinatorics", "Combinatorics"),
            ("graphs", "Graph Theory"),
        ]
    },
}

# =============================================================================
# DOMAIN GRAPH MAPPING
# =============================================================================
DOMAIN_GRAPHS = {
    "calculus": CALCULUS_GRAPH,
    "neural_networks": NEURAL_NETWORKS_GRAPH,
    "linear_algebra": LINEAR_ALGEBRA_GRAPH,
    "physics": PHYSICS_GRAPH,
    "statistics": STATISTICS_GRAPH,
    "discrete_math": DISCRETE_MATH_GRAPH,
}

# Legacy alias for backwards compatibility
KNOWLEDGE_GRAPH = CALCULUS_GRAPH

def get_knowledge_graph_for_domain(domain: str) -> Dict:
    """Get the knowledge graph for a specific domain."""
    return DOMAIN_GRAPHS.get(domain, CALCULUS_GRAPH)

def generate_graph(center_id: str, domain: str = "calculus") -> tuple[List[GraphNode], List[GraphLink]]:
    """
    Generate a deterministic knowledge graph centered on a specific node.

    Args:
        center_id: The node to center the graph on
        domain: The domain to use for the knowledge graph

    Returns:
        - List of nodes (center + related)
        - List of links connecting center to related nodes
    """
    graph = get_knowledge_graph_for_domain(domain)
    domain_info = DOMAINS.get(domain, DOMAINS["calculus"])

    if center_id not in graph:
        # Fallback to domain's default center if unknown node
        center_id = domain_info["default_center"]

    center_data = graph[center_id]

    # Build nodes
    nodes = [GraphNode(id=center_id, label=center_data["label"])]
    links = []

    for related_id, related_label in center_data["related"]:
        nodes.append(GraphNode(id=related_id, label=related_label))
        # Create bidirectional link
        links.append(GraphLink(source=center_id, target=related_id))

    return nodes, links

def create_session(initial_center_id: str = "derivatives", domain: str = "calculus") -> Session:
    """Create a new session with a unique ID."""
    session_id = str(uuid.uuid4())

    # If domain is specified but center_id is default, use domain's default
    domain_info = DOMAINS.get(domain, DOMAINS["calculus"])
    if initial_center_id == "derivatives" and domain != "calculus":
        initial_center_id = domain_info["default_center"]

    nodes, links = generate_graph(initial_center_id, domain)

    session = Session(
        session_id=session_id,
        center_id=initial_center_id,
        domain=domain,
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

    # Get the graph for the session's domain
    graph = get_knowledge_graph_for_domain(session.domain)

    # Validate the new center exists in the domain's graph
    if new_center_id not in graph:
        return None

    # Regenerate graph with new center
    nodes, links = generate_graph(new_center_id, session.domain)
    session.center_id = new_center_id
    session.nodes = nodes
    session.links = links

    return session

def switch_domain(session_id: str, new_domain: str) -> Optional[Session]:
    """Switch a session to a different domain."""
    session = sessions.get(session_id)
    if not session:
        return None

    # Validate the domain exists
    if new_domain not in DOMAINS:
        return None

    # Get domain info and default center
    domain_info = DOMAINS[new_domain]
    default_center = domain_info["default_center"]

    # Regenerate graph for new domain
    nodes, links = generate_graph(default_center, new_domain)
    session.domain = new_domain
    session.center_id = default_center
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

def get_all_domains() -> Dict:
    """Get all available domains."""
    return DOMAINS

