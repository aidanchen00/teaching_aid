"""Lesson selection endpoints."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict
import uuid

from api.session_store import get_session
from api.viz.job_manager import job_manager
from api.viz.generator import generate_visualization_task

router = APIRouter()

class SelectLessonRequest(BaseModel):
    nodeId: str

class SelectLessonResponse(BaseModel):
    lessonId: str
    title: str
    summary: str
    vizJobId: str

# Lesson content mapped by node ID
LESSON_CONTENT = {
    # ==========================================================================
    # CALCULUS
    # ==========================================================================
    "derivatives": {
        "title": "Derivatives",
        "summary": "Learn about rates of change and slopes of curves. Derivatives measure how a function changes as its input changes, forming the foundation of calculus."
    },
    "integrals": {
        "title": "Integrals",
        "summary": "Discover how to find areas under curves and accumulate quantities. Integrals are the reverse operation of derivatives and have applications across physics and engineering."
    },
    "limits": {
        "title": "Limits",
        "summary": "Understand the behavior of functions as they approach specific values. Limits are the foundational concept that makes calculus rigorous and precise."
    },
    "chain_rule": {
        "title": "Chain Rule",
        "summary": "Master the technique for differentiating composite functions. The chain rule is essential for working with nested functions and complex relationships."
    },
    "product_rule": {
        "title": "Product Rule",
        "summary": "Learn how to differentiate products of functions. This rule is crucial when working with functions that are multiplied together."
    },
    "power_rule": {
        "title": "Power Rule",
        "summary": "The simplest and most fundamental differentiation rule. Learn how to differentiate any power of x quickly and efficiently."
    },
    "implicit_differentiation": {
        "title": "Implicit Differentiation",
        "summary": "Differentiate equations where y is not isolated. This technique is powerful for curves and relationships that cannot be easily expressed as y=f(x)."
    },
    "integration_by_parts": {
        "title": "Integration by Parts",
        "summary": "A technique for integrating products of functions. Based on the product rule, this method helps solve complex integrals."
    },
    "substitution": {
        "title": "U-Substitution",
        "summary": "Simplify complex integrals through clever variable substitution. This technique is the integral analog of the chain rule."
    },
    "definite_integrals": {
        "title": "Definite Integrals",
        "summary": "Calculate exact areas and accumulated quantities. Definite integrals give specific numerical values rather than general formulas."
    },
    "continuity": {
        "title": "Continuity",
        "summary": "Explore functions that have no breaks or jumps. Continuous functions are smooth and predictable, making them easier to analyze."
    },
    "fundamental_theorem": {
        "title": "Fundamental Theorem of Calculus",
        "summary": "The bridge connecting derivatives and integrals. This theorem shows that differentiation and integration are inverse operations."
    },

    # ==========================================================================
    # NEURAL NETWORKS / ML
    # ==========================================================================
    "neural_networks": {
        "title": "Neural Networks",
        "summary": "Learn the architecture of artificial neural networks. Understand how layers of interconnected neurons can learn complex patterns from data."
    },
    "perceptron": {
        "title": "The Perceptron",
        "summary": "The simplest neural network unit. A perceptron computes a weighted sum of inputs and applies an activation function to produce output."
    },
    "activation_functions": {
        "title": "Activation Functions",
        "summary": "How non-linearity enables learning. Activation functions like ReLU, sigmoid, and tanh allow networks to learn complex, non-linear relationships."
    },
    "relu": {
        "title": "ReLU Activation",
        "summary": "Rectified Linear Unit - the most popular activation function. ReLU outputs the input directly if positive, otherwise outputs zero."
    },
    "sigmoid": {
        "title": "Sigmoid Activation",
        "summary": "S-shaped squashing function that maps inputs to (0, 1). Useful for binary classification and probability outputs."
    },
    "backpropagation": {
        "title": "Backpropagation",
        "summary": "How networks learn via gradient flow. Backpropagation computes gradients of the loss with respect to each weight using the chain rule."
    },
    "gradient_descent": {
        "title": "Gradient Descent",
        "summary": "Optimization by following gradients. An iterative algorithm that updates parameters in the direction that reduces the loss function."
    },
    "loss_functions": {
        "title": "Loss Functions",
        "summary": "Measuring prediction error. Loss functions like MSE and cross-entropy quantify how wrong predictions are, guiding the learning process."
    },
    "convolutional_networks": {
        "title": "CNNs",
        "summary": "Neural networks for image processing. Convolutional layers detect spatial features like edges, textures, and patterns in images."
    },
    "regularization": {
        "title": "Regularization",
        "summary": "Preventing overfitting in neural networks. Techniques like L1, L2 regularization, and dropout help models generalize better."
    },

    # ==========================================================================
    # LINEAR ALGEBRA
    # ==========================================================================
    "vectors": {
        "title": "Vectors",
        "summary": "Quantities with magnitude and direction. Vectors are fundamental objects in linear algebra, representing points, displacements, and forces."
    },
    "dot_product": {
        "title": "Dot Product",
        "summary": "Measuring alignment between vectors. The dot product returns a scalar indicating how much two vectors point in the same direction."
    },
    "cross_product": {
        "title": "Cross Product",
        "summary": "Creating perpendicular vectors. The cross product of two 3D vectors produces a vector perpendicular to both, with magnitude equal to the parallelogram area."
    },
    "matrices": {
        "title": "Matrices",
        "summary": "Arrays representing linear transformations. Matrices can rotate, scale, shear, and project vectors in space."
    },
    "matrix_multiplication": {
        "title": "Matrix Multiplication",
        "summary": "Composing linear transformations. When you multiply matrices, you're combining their transformations into a single operation."
    },
    "linear_transformations": {
        "title": "Linear Transformations",
        "summary": "Functions preserving vector space structure. Linear transformations map lines to lines and preserve the origin."
    },
    "eigenvalues": {
        "title": "Eigenvalues",
        "summary": "Scaling factors of transformations. Eigenvalues tell you how much eigenvectors are stretched or compressed by a matrix."
    },
    "eigenvectors": {
        "title": "Eigenvectors",
        "summary": "Invariant directions under transformation. Eigenvectors are special directions that only get scaled, not rotated, by a matrix."
    },
    "determinants": {
        "title": "Determinants",
        "summary": "Volume scaling factor of a transformation. The determinant tells you how a matrix scales areas (2D) or volumes (3D)."
    },
    "inverse_matrix": {
        "title": "Matrix Inverse",
        "summary": "Reversing transformations. The inverse matrix undoes a transformation, useful for solving systems of equations."
    },
    "vector_spaces": {
        "title": "Vector Spaces",
        "summary": "Abstract spaces for vectors. Vector spaces define rules for addition and scalar multiplication that vectors must follow."
    },

    # ==========================================================================
    # PHYSICS
    # ==========================================================================
    "mechanics": {
        "title": "Mechanics",
        "summary": "Study of motion and forces. Mechanics describes how objects move and what causes them to move or change direction."
    },
    "kinematics": {
        "title": "Kinematics",
        "summary": "Describing motion mathematically. Kinematics uses position, velocity, and acceleration to describe how objects move through space."
    },
    "forces": {
        "title": "Forces",
        "summary": "Push and pull interactions. Forces cause objects to accelerate, decelerate, or change direction according to Newton's laws."
    },
    "newtons_laws": {
        "title": "Newton's Laws",
        "summary": "Fundamental laws of motion. These three laws describe inertia, F=ma, and action-reaction pairs that govern all mechanical systems."
    },
    "momentum": {
        "title": "Momentum",
        "summary": "Mass in motion. Momentum (p=mv) is conserved in isolated systems and transfers between objects in collisions."
    },
    "energy": {
        "title": "Energy",
        "summary": "Capacity to do work. Energy exists in many forms - kinetic, potential, thermal - and is always conserved in closed systems."
    },
    "work": {
        "title": "Work",
        "summary": "Force times displacement. Work is energy transferred to an object when a force moves it through a distance."
    },
    "waves": {
        "title": "Waves",
        "summary": "Energy transfer through medium. Waves carry energy without transporting matter, described by wavelength, frequency, and amplitude."
    },
    "oscillations": {
        "title": "Oscillations",
        "summary": "Repetitive back-and-forth motion. Simple harmonic motion describes systems like pendulums and springs that oscillate periodically."
    },
    "rotation": {
        "title": "Rotation",
        "summary": "Circular and angular motion. Rotation involves angular velocity, torque, and moment of inertia - the rotational analogs of linear motion."
    },
    "projectile_motion": {
        "title": "Projectile Motion",
        "summary": "Objects moving under gravity. Projectiles follow parabolic paths, with horizontal and vertical motion analyzed independently."
    },

    # ==========================================================================
    # STATISTICS
    # ==========================================================================
    "probability": {
        "title": "Probability",
        "summary": "Measuring likelihood of events. Probability quantifies uncertainty, ranging from 0 (impossible) to 1 (certain)."
    },
    "distributions": {
        "title": "Distributions",
        "summary": "Patterns in random variables. Probability distributions describe how likely different outcomes are for a random variable."
    },
    "normal_distribution": {
        "title": "Normal Distribution",
        "summary": "The bell curve. The normal distribution appears throughout nature and statistics, characterized by mean and standard deviation."
    },
    "bayes_theorem": {
        "title": "Bayes Theorem",
        "summary": "Updating beliefs with evidence. Bayes' theorem calculates conditional probabilities, essential for machine learning and inference."
    },
    "expected_value": {
        "title": "Expected Value",
        "summary": "Average outcome of a random variable. Expected value weights each outcome by its probability, giving the long-run average."
    },
    "variance": {
        "title": "Variance",
        "summary": "Spread of data around the mean. Variance measures how dispersed values are from the expected value."
    },
    "hypothesis_testing": {
        "title": "Hypothesis Testing",
        "summary": "Making decisions from data. Hypothesis tests use sample data to decide whether to reject null hypotheses about populations."
    },
    "confidence_intervals": {
        "title": "Confidence Intervals",
        "summary": "Range of plausible values. Confidence intervals provide a range likely to contain the true population parameter."
    },
    "regression": {
        "title": "Regression",
        "summary": "Predicting relationships between variables. Regression finds the best-fit line or curve to model how variables relate."
    },
    "correlation": {
        "title": "Correlation",
        "summary": "Strength of linear relationship. Correlation measures how strongly two variables move together, from -1 to +1."
    },

    # ==========================================================================
    # DISCRETE MATH
    # ==========================================================================
    "graphs": {
        "title": "Graph Theory",
        "summary": "Networks of nodes and edges. Graphs model connections between objects, used in social networks, routing, and algorithms."
    },
    "trees": {
        "title": "Trees",
        "summary": "Hierarchical connected graphs. Trees have no cycles and one path between any two nodes, used in data structures and search."
    },
    "paths": {
        "title": "Paths",
        "summary": "Sequences through graphs. A path is a sequence of vertices connected by edges, fundamental to graph algorithms."
    },
    "cycles": {
        "title": "Cycles",
        "summary": "Closed paths in graphs. A cycle is a path that starts and ends at the same vertex, important for detecting loops."
    },
    "connectivity": {
        "title": "Connectivity",
        "summary": "Reachability in graphs. Connectivity determines whether paths exist between vertices and identifies components."
    },
    "combinatorics": {
        "title": "Combinatorics",
        "summary": "Counting techniques. Combinatorics counts arrangements, selections, and configurations of objects."
    },
    "permutations": {
        "title": "Permutations",
        "summary": "Ordered arrangements. Permutations count the number of ways to arrange objects where order matters."
    },
    "combinations": {
        "title": "Combinations",
        "summary": "Unordered selections. Combinations count selections where order doesn't matter, like choosing committee members."
    },
    "logic": {
        "title": "Logic",
        "summary": "Formal reasoning with propositions. Logic provides rules for combining statements with AND, OR, NOT, and implications."
    },
    "proofs": {
        "title": "Proofs",
        "summary": "Mathematical arguments. Proofs demonstrate that statements are true using deduction, contradiction, or induction."
    },
    "recursion": {
        "title": "Recursion",
        "summary": "Self-referential definitions. Recursive functions and structures define themselves in terms of smaller instances."
    },
    "sets": {
        "title": "Sets",
        "summary": "Collections of distinct objects. Sets support operations like union, intersection, and complement for working with groups."
    },
}

@router.post("/session/{session_id}/lesson/select")
async def select_lesson(session_id: str, request: SelectLessonRequest) -> SelectLessonResponse:
    """
    Select a lesson for a node and start visualization generation.
    
    This endpoint:
    1. Gets lesson content for the node
    2. Creates a visualization job
    3. Starts the job in the background
    4. Returns immediately with lesson info and job ID
    """
    # Verify session exists
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
    
    # Get node info
    node_id = request.nodeId
    node = next((n for n in session.nodes if n.id == node_id), None)
    if not node:
        raise HTTPException(status_code=404, detail=f"Node {node_id} not found in session")
    
    # Get lesson content
    lesson_content = LESSON_CONTENT.get(node_id, {
        "title": node.label,
        "summary": f"Learn about {node.label} and its applications in calculus."
    })
    
    # Create lesson ID
    lesson_id = str(uuid.uuid4())
    
    # Create visualization job
    viz_job_id = job_manager.create_job()
    
    # Start visualization generation in background
    # Note: job_id is passed separately to task_func via kwargs
    job_manager.start_job(
        viz_job_id,
        generate_visualization_task,
        topic=node_id,
        lesson_title=lesson_content["title"],
        summary=lesson_content["summary"],
        viz_job_id=viz_job_id  # passed as viz_job_id to avoid conflict
    )
    
    print(f"[Lesson] Selected lesson for node {node_id}, vizJobId={viz_job_id}")
    
    return SelectLessonResponse(
        lessonId=lesson_id,
        title=lesson_content["title"],
        summary=lesson_content["summary"],
        vizJobId=viz_job_id
    )

