"""
Three.js scene template specifications for calculus concepts.
Returns safe, structured specs - NEVER executable code.
"""
from typing import Dict, Any, List
from enum import Enum

class SceneType(str, Enum):
    DERIVATIVE_GRAPH = "derivative_graph"
    INTEGRAL_AREA = "integral_area"
    LIMIT_APPROACH = "limit_approach"
    CHAIN_RULE_COMPOSITION = "chain_rule_composition"
    PRODUCT_RULE_SPLIT = "product_rule_split"
    COORDINATE_SYSTEM = "coordinate_system"

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

def get_three_spec_for_topic(topic: str) -> Dict[str, Any]:
    """
    Get the appropriate Three.js spec for a given topic.
    Returns a safe, structured specification.
    """
    topic_lower = topic.lower().replace(" ", "_")
    
    # Map topics to scene types
    if topic_lower in ["derivatives", "power_rule"]:
        return get_derivative_graph_spec(topic_lower)
    elif topic_lower in ["chain_rule"]:
        return get_chain_rule_composition_spec(topic_lower)
    elif topic_lower in ["product_rule"]:
        return get_product_rule_split_spec(topic_lower)
    elif topic_lower in ["integrals", "definite_integrals", "integration_by_parts"]:
        return get_integral_area_spec(topic_lower)
    elif topic_lower in ["limits", "continuity"]:
        return get_limit_approach_spec(topic_lower)
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

