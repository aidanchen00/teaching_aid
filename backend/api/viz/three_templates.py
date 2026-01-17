"""
Three.js scene template specifications for educational concepts.
Returns safe, structured specs - NEVER executable code.
"""
from typing import Dict, Any, List
from enum import Enum

class SceneType(str, Enum):
    # Calculus
    DERIVATIVE_GRAPH = "derivative_graph"
    INTEGRAL_AREA = "integral_area"
    LIMIT_APPROACH = "limit_approach"
    CHAIN_RULE_COMPOSITION = "chain_rule_composition"
    PRODUCT_RULE_SPLIT = "product_rule_split"
    COORDINATE_SYSTEM = "coordinate_system"

    # Neural Networks
    NEURAL_NETWORK_DIAGRAM = "neural_network_diagram"
    ACTIVATION_FUNCTION_GRAPH = "activation_function_graph"
    GRADIENT_DESCENT_SURFACE = "gradient_descent_surface"

    # Linear Algebra
    VECTOR_VISUALIZATION = "vector_visualization"
    MATRIX_TRANSFORMATION = "matrix_transformation"
    EIGENSPACE_VISUALIZATION = "eigenspace_visualization"

    # Physics
    PROJECTILE_MOTION = "projectile_motion"
    FORCE_DIAGRAM = "force_diagram"
    WAVE_VISUALIZATION = "wave_visualization"
    PENDULUM_MOTION = "pendulum_motion"

    # Statistics
    DISTRIBUTION_CURVE = "distribution_curve"
    SCATTER_PLOT = "scatter_plot"
    PROBABILITY_TREE = "probability_tree"

    # Discrete Math
    GRAPH_VISUALIZATION = "graph_visualization"
    TREE_VISUALIZATION = "tree_visualization"
    SET_DIAGRAM = "set_diagram"

def get_derivative_graph_spec(topic: str) -> Dict[str, Any]:
    """
    Generate spec for derivative visualization with tangent line.
    Shows function curve with interactive tangent line at a point.
    """
    # Common derivative examples
    specs = {
        "derivatives": {
            "fn": "x^2",
            "point": 1.0,
            "range": [-3, 3],
            "fnLabel": "f(x) = x²",
            "derivativeLabel": "f'(x) = 2x"
        },
        "power_rule": {
            "fn": "x^3",
            "point": 1.5,
            "range": [-2, 2],
            "fnLabel": "f(x) = x³",
            "derivativeLabel": "f'(x) = 3x²"
        },
        "chain_rule": {
            "fn": "sin(2*x)",
            "point": 0.5,
            "range": [-3.14, 3.14],
            "fnLabel": "f(x) = sin(2x)",
            "derivativeLabel": "f'(x) = 2cos(2x)"
        },
    }
    
    spec = specs.get(topic, specs["derivatives"])
    
    return {
        "sceneType": SceneType.DERIVATIVE_GRAPH,
        "params": spec
    }

def get_integral_area_spec(topic: str) -> Dict[str, Any]:
    """
    Generate spec for integral visualization with shaded area.
    Shows function curve with area under curve highlighted.
    """
    specs = {
        "integrals": {
            "fn": "x^2",
            "a": 0,
            "b": 2,
            "range": [-1, 3],
            "fnLabel": "f(x) = x²",
            "areaLabel": "∫₀² x² dx = 8/3"
        },
        "definite_integrals": {
            "fn": "sin(x)",
            "a": 0,
            "b": 3.14159,
            "range": [-0.5, 3.5],
            "fnLabel": "f(x) = sin(x)",
            "areaLabel": "∫₀^π sin(x) dx = 2"
        },
        "integration_by_parts": {
            "fn": "x*exp(-x)",
            "a": 0,
            "b": 2,
            "range": [-0.5, 3],
            "fnLabel": "f(x) = xe^(-x)",
            "areaLabel": "∫ xe^(-x) dx"
        },
    }
    
    spec = specs.get(topic, specs["integrals"])
    
    return {
        "sceneType": SceneType.INTEGRAL_AREA,
        "params": spec
    }

def get_limit_approach_spec(topic: str) -> Dict[str, Any]:
    """
    Generate spec for limit visualization.
    Shows point approaching a limit value.
    """
    specs = {
        "limits": {
            "fn": "(x^2-1)/(x-1)",
            "limitPoint": 1.0,
            "limitValue": 2.0,
            "direction": "both",
            "range": [-1, 3],
            "fnLabel": "f(x) = (x²-1)/(x-1)",
            "limitLabel": "lim[x→1] = 2"
        },
        "continuity": {
            "fn": "abs(x)",
            "limitPoint": 0.0,
            "limitValue": 0.0,
            "direction": "both",
            "range": [-2, 2],
            "fnLabel": "f(x) = |x|",
            "limitLabel": "Continuous at x=0"
        },
    }
    
    spec = specs.get(topic, specs["limits"])
    
    return {
        "sceneType": SceneType.LIMIT_APPROACH,
        "params": spec
    }

def get_chain_rule_composition_spec(topic: str) -> Dict[str, Any]:
    """
    Generate spec for chain rule visualization.
    Shows nested function composition.
    """
    return {
        "sceneType": SceneType.CHAIN_RULE_COMPOSITION,
        "params": {
            "outer": "x^2",
            "inner": "sin(x)",
            "composed": "(sin(x))^2",
            "range": [-3.14, 3.14],
            "outerLabel": "g(u) = u²",
            "innerLabel": "f(x) = sin(x)",
            "composedLabel": "h(x) = sin²(x)"
        }
    }

def get_product_rule_split_spec(topic: str) -> Dict[str, Any]:
    """
    Generate spec for product rule visualization.
    Shows two functions and their product.
    """
    return {
        "sceneType": SceneType.PRODUCT_RULE_SPLIT,
        "params": {
            "fn1": "x",
            "fn2": "sin(x)",
            "product": "x*sin(x)",
            "range": [-3.14, 3.14],
            "fn1Label": "f(x) = x",
            "fn2Label": "g(x) = sin(x)",
            "productLabel": "h(x) = x·sin(x)"
        }
    }

def get_coordinate_system_spec(topic: str) -> Dict[str, Any]:
    """
    Generate spec for general coordinate system.
    Shows 3D axes with labeled points.
    """
    # Generic points for various topics
    return {
        "sceneType": SceneType.COORDINATE_SYSTEM,
        "params": {
            "points": [
                {"x": 0, "y": 0, "z": 0, "label": "Origin"},
                {"x": 1, "y": 0, "z": 0, "label": "x"},
                {"x": 0, "y": 1, "z": 0, "label": "y"},
                {"x": 0, "y": 0, "z": 1, "label": "z"},
            ],
            "showGrid": True,
            "range": [-2, 2]
        }
    }

# =============================================================================
# NEURAL NETWORKS SPECS
# =============================================================================

def get_neural_network_diagram_spec(topic: str) -> Dict[str, Any]:
    """
    Generate spec for neural network architecture visualization.
    Shows layers of neurons with connections.
    """
    specs = {
        "neural_networks": {
            "layers": [4, 6, 6, 3],  # Input, hidden, hidden, output
            "layerLabels": ["Input", "Hidden 1", "Hidden 2", "Output"],
            "activations": ["none", "relu", "relu", "softmax"],
            "fnLabel": "Neural Network Architecture",
            "description": "Multi-layer perceptron"
        },
        "perceptron": {
            "layers": [3, 1],
            "layerLabels": ["Input", "Output"],
            "activations": ["none", "sigmoid"],
            "fnLabel": "Single Perceptron",
            "description": "Weighted sum → Activation"
        },
        "convolutional_networks": {
            "layers": [8, 4, 4, 2],
            "layerLabels": ["Conv", "Pool", "FC", "Output"],
            "activations": ["relu", "none", "relu", "softmax"],
            "fnLabel": "CNN Architecture",
            "description": "Convolution → Pooling → Dense"
        },
    }

    spec = specs.get(topic, specs["neural_networks"])

    return {
        "sceneType": SceneType.NEURAL_NETWORK_DIAGRAM,
        "params": spec
    }

def get_activation_function_spec(topic: str) -> Dict[str, Any]:
    """
    Generate spec for activation function graph.
    Shows the activation curve and its derivative.
    """
    specs = {
        "relu": {
            "fn": "max(0, x)",
            "derivativeFn": "x > 0 ? 1 : 0",
            "range": [-3, 3],
            "fnLabel": "ReLU: f(x) = max(0, x)",
            "derivativeLabel": "f'(x) = {1 if x > 0, 0 otherwise}"
        },
        "sigmoid": {
            "fn": "1/(1+exp(-x))",
            "derivativeFn": "sigmoid(x) * (1 - sigmoid(x))",
            "range": [-5, 5],
            "fnLabel": "Sigmoid: σ(x) = 1/(1+e⁻ˣ)",
            "derivativeLabel": "σ'(x) = σ(x)(1-σ(x))"
        },
        "activation_functions": {
            "fn": "tanh(x)",
            "derivativeFn": "1 - tanh(x)^2",
            "range": [-3, 3],
            "fnLabel": "Tanh: f(x) = tanh(x)",
            "derivativeLabel": "f'(x) = 1 - tanh²(x)"
        },
    }

    spec = specs.get(topic, specs["relu"])

    return {
        "sceneType": SceneType.ACTIVATION_FUNCTION_GRAPH,
        "params": spec
    }

def get_gradient_descent_spec(topic: str) -> Dict[str, Any]:
    """
    Generate spec for gradient descent visualization.
    Shows 3D loss surface with descent path.
    """
    specs = {
        "gradient_descent": {
            "surfaceFn": "x^2 + y^2",  # Simple paraboloid
            "startPoint": {"x": 2, "y": 2},
            "learningRate": 0.1,
            "steps": 10,
            "range": [-3, 3],
            "fnLabel": "Loss Surface: L(w₁, w₂) = w₁² + w₂²",
            "description": "Gradient descent path to minimum"
        },
        "backpropagation": {
            "surfaceFn": "sin(x)*cos(y) + x^2/10 + y^2/10",
            "startPoint": {"x": 1.5, "y": 1.5},
            "learningRate": 0.15,
            "steps": 15,
            "range": [-3, 3],
            "fnLabel": "Non-convex Loss Surface",
            "description": "Navigating local minima"
        },
        "loss_functions": {
            "surfaceFn": "x^2 + 2*y^2",  # Elliptic paraboloid
            "startPoint": {"x": 2, "y": 1},
            "learningRate": 0.1,
            "steps": 12,
            "range": [-3, 3],
            "fnLabel": "MSE Loss Surface",
            "description": "Mean Squared Error minimization"
        },
    }

    spec = specs.get(topic, specs["gradient_descent"])

    return {
        "sceneType": SceneType.GRADIENT_DESCENT_SURFACE,
        "params": spec
    }

# =============================================================================
# LINEAR ALGEBRA SPECS
# =============================================================================

def get_vector_visualization_spec(topic: str) -> Dict[str, Any]:
    """
    Generate spec for vector visualization.
    Shows vectors with operations like addition, dot product.
    """
    specs = {
        "vectors": {
            "vectors": [
                {"x": 2, "y": 1, "z": 0, "color": "#3b82f6", "label": "a"},
                {"x": 1, "y": 2, "z": 0, "color": "#10b981", "label": "b"},
                {"x": 3, "y": 3, "z": 0, "color": "#fbbf24", "label": "a + b"}
            ],
            "showSum": True,
            "fnLabel": "Vector Addition",
            "description": "a + b = (a₁+b₁, a₂+b₂)"
        },
        "dot_product": {
            "vectors": [
                {"x": 3, "y": 0, "z": 0, "color": "#3b82f6", "label": "a"},
                {"x": 2, "y": 2, "z": 0, "color": "#10b981", "label": "b"}
            ],
            "showProjection": True,
            "dotProduct": 6,
            "fnLabel": "Dot Product",
            "description": "a · b = |a||b|cos(θ) = 6"
        },
        "cross_product": {
            "vectors": [
                {"x": 1, "y": 0, "z": 0, "color": "#3b82f6", "label": "a"},
                {"x": 0, "y": 1, "z": 0, "color": "#10b981", "label": "b"},
                {"x": 0, "y": 0, "z": 1, "color": "#ef4444", "label": "a × b"}
            ],
            "showPlane": True,
            "fnLabel": "Cross Product",
            "description": "a × b is perpendicular to both"
        },
    }

    spec = specs.get(topic, specs["vectors"])

    return {
        "sceneType": SceneType.VECTOR_VISUALIZATION,
        "params": spec
    }

def get_matrix_transformation_spec(topic: str) -> Dict[str, Any]:
    """
    Generate spec for matrix transformation visualization.
    Shows how matrices transform the coordinate grid.
    """
    specs = {
        "linear_transformations": {
            "matrix": [[2, 0], [0, 2]],
            "matrixLabel": "Scaling: 2I",
            "fnLabel": "Linear Transformation",
            "description": "Grid scales by factor of 2"
        },
        "matrices": {
            "matrix": [[1, 0.5], [0, 1]],
            "matrixLabel": "Shear Matrix",
            "fnLabel": "Matrix Transformation",
            "description": "Horizontal shear transformation"
        },
        "matrix_multiplication": {
            "matrix": [[0, -1], [1, 0]],
            "matrixLabel": "90° Rotation",
            "fnLabel": "Rotation Matrix",
            "description": "Counter-clockwise rotation"
        },
    }

    spec = specs.get(topic, specs["linear_transformations"])

    return {
        "sceneType": SceneType.MATRIX_TRANSFORMATION,
        "params": spec
    }

def get_eigenspace_spec(topic: str) -> Dict[str, Any]:
    """
    Generate spec for eigenvalue/eigenvector visualization.
    Shows eigenvectors being scaled by eigenvalues.
    """
    specs = {
        "eigenvalues": {
            "matrix": [[3, 1], [0, 2]],
            "eigenvalues": [3, 2],
            "eigenvectors": [
                {"x": 1, "y": 0, "lambda": 3},
                {"x": -1, "y": 1, "lambda": 2}
            ],
            "fnLabel": "Eigenvalues",
            "description": "λ₁ = 3, λ₂ = 2"
        },
        "eigenvectors": {
            "matrix": [[2, 1], [1, 2]],
            "eigenvalues": [3, 1],
            "eigenvectors": [
                {"x": 1, "y": 1, "lambda": 3},
                {"x": 1, "y": -1, "lambda": 1}
            ],
            "fnLabel": "Eigenvectors",
            "description": "Directions unchanged by A"
        },
    }

    spec = specs.get(topic, specs["eigenvalues"])

    return {
        "sceneType": SceneType.EIGENSPACE_VISUALIZATION,
        "params": spec
    }

# =============================================================================
# PHYSICS SPECS
# =============================================================================

def get_projectile_motion_spec(topic: str) -> Dict[str, Any]:
    """
    Generate spec for projectile motion visualization.
    Shows parabolic trajectory with velocity vectors.
    """
    specs = {
        "projectile_motion": {
            "initialVelocity": {"x": 10, "y": 15},
            "gravity": 9.8,
            "angle": 56.3,
            "maxHeight": 11.5,
            "range": 30.6,
            "fnLabel": "Projectile Motion",
            "description": "v₀ = 18 m/s at 56.3°"
        },
        "kinematics": {
            "initialVelocity": {"x": 8, "y": 10},
            "gravity": 9.8,
            "angle": 51.3,
            "maxHeight": 5.1,
            "range": 16.3,
            "fnLabel": "Kinematic Equations",
            "description": "x = v₀t, y = v₀t - ½gt²"
        },
    }

    spec = specs.get(topic, specs["projectile_motion"])

    return {
        "sceneType": SceneType.PROJECTILE_MOTION,
        "params": spec
    }

def get_force_diagram_spec(topic: str) -> Dict[str, Any]:
    """
    Generate spec for force diagram visualization.
    Shows forces acting on an object.
    """
    specs = {
        "forces": {
            "forces": [
                {"x": 0, "y": 5, "label": "N", "color": "#3b82f6"},
                {"x": 0, "y": -5, "label": "W", "color": "#ef4444"},
                {"x": 3, "y": 0, "label": "F", "color": "#10b981"}
            ],
            "fnLabel": "Free Body Diagram",
            "description": "N + W + F = ma"
        },
        "newtons_laws": {
            "forces": [
                {"x": 5, "y": 0, "label": "F", "color": "#3b82f6"},
                {"x": -2, "y": 0, "label": "f", "color": "#ef4444"}
            ],
            "acceleration": {"x": 1.5, "y": 0},
            "mass": 2,
            "fnLabel": "Newton's Second Law",
            "description": "ΣF = ma"
        },
        "momentum": {
            "forces": [
                {"x": 4, "y": 0, "label": "p₁", "color": "#3b82f6"},
                {"x": -3, "y": 0, "label": "p₂", "color": "#10b981"}
            ],
            "fnLabel": "Momentum Conservation",
            "description": "p = mv, Δp = FΔt"
        },
    }

    spec = specs.get(topic, specs["forces"])

    return {
        "sceneType": SceneType.FORCE_DIAGRAM,
        "params": spec
    }

def get_wave_spec(topic: str) -> Dict[str, Any]:
    """
    Generate spec for wave visualization.
    Shows propagating sine wave.
    """
    specs = {
        "waves": {
            "amplitude": 1,
            "wavelength": 2,
            "frequency": 1,
            "phase": 0,
            "range": [0, 8],
            "fnLabel": "Wave Motion",
            "description": "y = A sin(kx - ωt)"
        },
        "oscillations": {
            "amplitude": 1.5,
            "wavelength": 3,
            "frequency": 0.5,
            "phase": 0,
            "range": [0, 12],
            "fnLabel": "Oscillations",
            "description": "Simple Harmonic Motion"
        },
    }

    spec = specs.get(topic, specs["waves"])

    return {
        "sceneType": SceneType.WAVE_VISUALIZATION,
        "params": spec
    }

def get_pendulum_spec(topic: str) -> Dict[str, Any]:
    """
    Generate spec for pendulum visualization.
    Shows oscillating pendulum.
    """
    return {
        "sceneType": SceneType.PENDULUM_MOTION,
        "params": {
            "length": 2,
            "initialAngle": 30,
            "gravity": 9.8,
            "damping": 0.05,
            "fnLabel": "Simple Pendulum",
            "description": "T = 2π√(L/g)"
        }
    }

# =============================================================================
# STATISTICS SPECS
# =============================================================================

def get_distribution_spec(topic: str) -> Dict[str, Any]:
    """
    Generate spec for distribution curve visualization.
    Shows probability distribution with key statistics.
    """
    specs = {
        "normal_distribution": {
            "mean": 0,
            "stdDev": 1,
            "showArea": True,
            "highlightRegion": [-1, 1],
            "range": [-4, 4],
            "fnLabel": "Normal Distribution",
            "description": "μ = 0, σ = 1, P(-1 < X < 1) ≈ 68%"
        },
        "distributions": {
            "mean": 5,
            "stdDev": 2,
            "showArea": False,
            "range": [-1, 11],
            "fnLabel": "Gaussian Distribution",
            "description": "f(x) = (1/σ√2π)e^(-(x-μ)²/2σ²)"
        },
        "probability": {
            "mean": 0,
            "stdDev": 1,
            "showArea": True,
            "highlightRegion": [0, 2],
            "range": [-4, 4],
            "fnLabel": "Probability Density",
            "description": "P(0 < X < 2) = shaded area"
        },
    }

    spec = specs.get(topic, specs["normal_distribution"])

    return {
        "sceneType": SceneType.DISTRIBUTION_CURVE,
        "params": spec
    }

def get_scatter_plot_spec(topic: str) -> Dict[str, Any]:
    """
    Generate spec for scatter plot with regression line.
    """
    specs = {
        "regression": {
            "points": [
                {"x": 1, "y": 2.1}, {"x": 2, "y": 3.9}, {"x": 3, "y": 6.2},
                {"x": 4, "y": 7.8}, {"x": 5, "y": 10.1}, {"x": 6, "y": 12.3}
            ],
            "regressionLine": {"slope": 2, "intercept": 0.1},
            "rSquared": 0.98,
            "fnLabel": "Linear Regression",
            "description": "ŷ = 2x + 0.1, R² = 0.98"
        },
        "correlation": {
            "points": [
                {"x": 1, "y": 1.5}, {"x": 2, "y": 2.8}, {"x": 3, "y": 4.2},
                {"x": 4, "y": 5.1}, {"x": 5, "y": 6.8}, {"x": 6, "y": 8.5}
            ],
            "regressionLine": {"slope": 1.4, "intercept": 0},
            "correlation": 0.95,
            "fnLabel": "Correlation",
            "description": "r = 0.95 (strong positive)"
        },
    }

    spec = specs.get(topic, specs["regression"])

    return {
        "sceneType": SceneType.SCATTER_PLOT,
        "params": spec
    }

def get_probability_tree_spec(topic: str) -> Dict[str, Any]:
    """
    Generate spec for probability tree visualization.
    Shows branching probability outcomes.
    """
    specs = {
        "bayes_theorem": {
            "nodes": [
                {"id": "root", "label": "Start", "probability": 1},
                {"id": "A", "label": "A", "probability": 0.3, "parent": "root"},
                {"id": "not_A", "label": "A'", "probability": 0.7, "parent": "root"},
                {"id": "B_given_A", "label": "B|A", "probability": 0.8, "parent": "A"},
                {"id": "B_given_not_A", "label": "B|A'", "probability": 0.2, "parent": "not_A"}
            ],
            "fnLabel": "Bayes' Theorem",
            "description": "P(A|B) = P(B|A)P(A) / P(B)"
        },
        "expected_value": {
            "nodes": [
                {"id": "root", "label": "E[X]", "probability": 1},
                {"id": "x1", "label": "x₁=10", "probability": 0.5, "parent": "root"},
                {"id": "x2", "label": "x₂=20", "probability": 0.3, "parent": "root"},
                {"id": "x3", "label": "x₃=30", "probability": 0.2, "parent": "root"}
            ],
            "expectedValue": 16,
            "fnLabel": "Expected Value",
            "description": "E[X] = Σ xᵢP(xᵢ) = 16"
        },
    }

    spec = specs.get(topic, specs["bayes_theorem"])

    return {
        "sceneType": SceneType.PROBABILITY_TREE,
        "params": spec
    }

# =============================================================================
# DISCRETE MATH SPECS
# =============================================================================

def get_graph_visualization_spec(topic: str) -> Dict[str, Any]:
    """
    Generate spec for graph theory visualization.
    Shows nodes and edges.
    """
    specs = {
        "graphs": {
            "nodes": [
                {"id": "A", "x": 0, "y": 2},
                {"id": "B", "x": 2, "y": 2},
                {"id": "C", "x": 2, "y": 0},
                {"id": "D", "x": 0, "y": 0},
                {"id": "E", "x": 1, "y": 1}
            ],
            "edges": [
                {"source": "A", "target": "B"},
                {"source": "B", "target": "C"},
                {"source": "C", "target": "D"},
                {"source": "D", "target": "A"},
                {"source": "A", "target": "E"},
                {"source": "E", "target": "C"}
            ],
            "fnLabel": "Graph G = (V, E)",
            "description": "|V| = 5, |E| = 6"
        },
        "paths": {
            "nodes": [
                {"id": "1", "x": 0, "y": 0},
                {"id": "2", "x": 1, "y": 1},
                {"id": "3", "x": 2, "y": 0},
                {"id": "4", "x": 3, "y": 1},
                {"id": "5", "x": 4, "y": 0}
            ],
            "edges": [
                {"source": "1", "target": "2"},
                {"source": "2", "target": "3"},
                {"source": "3", "target": "4"},
                {"source": "4", "target": "5"}
            ],
            "highlightPath": ["1", "2", "3", "4", "5"],
            "fnLabel": "Path in Graph",
            "description": "Path from 1 to 5"
        },
        "cycles": {
            "nodes": [
                {"id": "A", "x": 0, "y": 1.5},
                {"id": "B", "x": 1.3, "y": 0.5},
                {"id": "C", "x": 0.8, "y": -1},
                {"id": "D", "x": -0.8, "y": -1},
                {"id": "E", "x": -1.3, "y": 0.5}
            ],
            "edges": [
                {"source": "A", "target": "B"},
                {"source": "B", "target": "C"},
                {"source": "C", "target": "D"},
                {"source": "D", "target": "E"},
                {"source": "E", "target": "A"}
            ],
            "highlightCycle": ["A", "B", "C", "D", "E", "A"],
            "fnLabel": "Cycle C₅",
            "description": "Pentagon cycle"
        },
        "connectivity": {
            "nodes": [
                {"id": "1", "x": 0, "y": 1},
                {"id": "2", "x": 1, "y": 1},
                {"id": "3", "x": 2, "y": 1},
                {"id": "4", "x": 0, "y": 0},
                {"id": "5", "x": 2, "y": 0}
            ],
            "edges": [
                {"source": "1", "target": "2"},
                {"source": "2", "target": "3"},
                {"source": "4", "target": "5"}
            ],
            "components": [["1", "2", "3"], ["4", "5"]],
            "fnLabel": "Connected Components",
            "description": "Two components"
        },
    }

    spec = specs.get(topic, specs["graphs"])

    return {
        "sceneType": SceneType.GRAPH_VISUALIZATION,
        "params": spec
    }

def get_tree_visualization_spec(topic: str) -> Dict[str, Any]:
    """
    Generate spec for tree visualization.
    Shows hierarchical tree structure.
    """
    specs = {
        "trees": {
            "root": {"id": "1", "value": 10},
            "nodes": [
                {"id": "2", "value": 5, "parent": "1"},
                {"id": "3", "value": 15, "parent": "1"},
                {"id": "4", "value": 3, "parent": "2"},
                {"id": "5", "value": 7, "parent": "2"},
                {"id": "6", "value": 12, "parent": "3"},
                {"id": "7", "value": 20, "parent": "3"}
            ],
            "treeType": "binary",
            "fnLabel": "Binary Search Tree",
            "description": "Height = 2, Nodes = 7"
        },
        "recursion": {
            "root": {"id": "fib(5)", "value": 5},
            "nodes": [
                {"id": "fib(4)", "value": 3, "parent": "fib(5)"},
                {"id": "fib(3)", "value": 2, "parent": "fib(5)"},
                {"id": "fib(3)_", "value": 2, "parent": "fib(4)"},
                {"id": "fib(2)", "value": 1, "parent": "fib(4)"}
            ],
            "treeType": "recursion",
            "fnLabel": "Recursion Tree",
            "description": "fib(5) = fib(4) + fib(3)"
        },
    }

    spec = specs.get(topic, specs["trees"])

    return {
        "sceneType": SceneType.TREE_VISUALIZATION,
        "params": spec
    }

def get_set_diagram_spec(topic: str) -> Dict[str, Any]:
    """
    Generate spec for set/Venn diagram visualization.
    """
    specs = {
        "sets": {
            "sets": [
                {"id": "A", "label": "A", "elements": [1, 2, 3, 4, 5]},
                {"id": "B", "label": "B", "elements": [4, 5, 6, 7, 8]}
            ],
            "intersection": [4, 5],
            "union": [1, 2, 3, 4, 5, 6, 7, 8],
            "fnLabel": "Set Operations",
            "description": "A ∩ B = {4, 5}"
        },
        "logic": {
            "sets": [
                {"id": "P", "label": "P", "elements": ["a", "b", "c"]},
                {"id": "Q", "label": "Q", "elements": ["b", "c", "d"]}
            ],
            "intersection": ["b", "c"],
            "fnLabel": "Logical Sets",
            "description": "P ∧ Q represented as intersection"
        },
        "combinatorics": {
            "sets": [
                {"id": "S", "label": "Sample Space", "elements": [1, 2, 3, 4, 5, 6]},
                {"id": "E", "label": "Event", "elements": [2, 4, 6]}
            ],
            "fnLabel": "Sample Space",
            "description": "P(E) = |E|/|S| = 1/2"
        },
    }

    spec = specs.get(topic, specs["sets"])

    return {
        "sceneType": SceneType.SET_DIAGRAM,
        "params": spec
    }

def get_three_spec_for_topic(topic: str) -> Dict[str, Any]:
    """
    Get the appropriate Three.js spec for a given topic.
    Returns a safe, structured specification.
    """
    topic_lower = topic.lower().replace(" ", "_")

    # ==========================================================================
    # CALCULUS
    # ==========================================================================
    if topic_lower in ["derivatives", "power_rule"]:
        return get_derivative_graph_spec(topic_lower)
    elif topic_lower in ["chain_rule"]:
        return get_chain_rule_composition_spec(topic_lower)
    elif topic_lower in ["product_rule", "quotient_rule"]:
        return get_product_rule_split_spec(topic_lower)
    elif topic_lower in ["integrals", "definite_integrals", "integration_by_parts", "substitution"]:
        return get_integral_area_spec(topic_lower)
    elif topic_lower in ["limits", "continuity"]:
        return get_limit_approach_spec(topic_lower)

    # ==========================================================================
    # NEURAL NETWORKS / ML
    # ==========================================================================
    elif topic_lower in ["neural_networks", "perceptron", "convolutional_networks"]:
        return get_neural_network_diagram_spec(topic_lower)
    elif topic_lower in ["relu", "sigmoid", "activation_functions"]:
        return get_activation_function_spec(topic_lower)
    elif topic_lower in ["gradient_descent", "backpropagation", "loss_functions"]:
        return get_gradient_descent_spec(topic_lower)
    elif topic_lower in ["regularization"]:
        return get_neural_network_diagram_spec("neural_networks")

    # ==========================================================================
    # LINEAR ALGEBRA
    # ==========================================================================
    elif topic_lower in ["vectors", "dot_product", "cross_product"]:
        return get_vector_visualization_spec(topic_lower)
    elif topic_lower in ["matrices", "linear_transformations", "matrix_multiplication"]:
        return get_matrix_transformation_spec(topic_lower)
    elif topic_lower in ["eigenvalues", "eigenvectors"]:
        return get_eigenspace_spec(topic_lower)
    elif topic_lower in ["determinants", "inverse_matrix", "vector_spaces"]:
        return get_matrix_transformation_spec("matrices")

    # ==========================================================================
    # PHYSICS
    # ==========================================================================
    elif topic_lower in ["projectile_motion", "kinematics"]:
        return get_projectile_motion_spec(topic_lower)
    elif topic_lower in ["forces", "newtons_laws", "momentum", "mechanics"]:
        return get_force_diagram_spec(topic_lower)
    elif topic_lower in ["waves", "oscillations"]:
        return get_wave_spec(topic_lower)
    elif topic_lower in ["rotation", "energy", "work"]:
        return get_pendulum_spec(topic_lower)

    # ==========================================================================
    # STATISTICS
    # ==========================================================================
    elif topic_lower in ["normal_distribution", "distributions", "probability", "variance"]:
        return get_distribution_spec(topic_lower)
    elif topic_lower in ["regression", "correlation"]:
        return get_scatter_plot_spec(topic_lower)
    elif topic_lower in ["bayes_theorem", "expected_value"]:
        return get_probability_tree_spec(topic_lower)
    elif topic_lower in ["hypothesis_testing", "confidence_intervals"]:
        return get_distribution_spec("normal_distribution")

    # ==========================================================================
    # DISCRETE MATH
    # ==========================================================================
    elif topic_lower in ["graphs", "paths", "cycles", "connectivity"]:
        return get_graph_visualization_spec(topic_lower)
    elif topic_lower in ["trees", "recursion"]:
        return get_tree_visualization_spec(topic_lower)
    elif topic_lower in ["sets", "logic", "combinatorics", "permutations", "combinations", "proofs"]:
        return get_set_diagram_spec(topic_lower)

    # ==========================================================================
    # DEFAULT
    # ==========================================================================
    else:
        # Default to coordinate system
        return get_coordinate_system_spec(topic_lower)

def validate_three_spec(spec: Dict[str, Any]) -> bool:
    """
    Validate that a Three.js spec follows the safe structure.
    Returns True if valid, False otherwise.
    """
    if "sceneType" not in spec:
        return False
    
    if spec["sceneType"] not in [s.value for s in SceneType]:
        return False
    
    if "params" not in spec:
        return False
    
    # Additional validation could check parameter types
    return True

