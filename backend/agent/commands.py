from typing import Dict, Any, Optional

# Supported command actions
VALID_ACTIONS = {
    "select_node_by_label",  # Requires: label
    "back_to_graph",         # No params
    "start_lesson",          # No params
    "end_lesson",            # No params
    "switch_domain",         # Requires: domain
    "error",                 # Special: message
    "clarify"                # Special: question (not published)
}

# Available domains for knowledge graphs
AVAILABLE_DOMAINS = {
    "calculus": "Calculus - derivatives, integrals, limits",
    "neural_networks": "Neural Networks & ML - perceptrons, backpropagation, activation functions",
    "linear_algebra": "Linear Algebra - vectors, matrices, eigenvalues",
    "physics": "Physics - mechanics, forces, waves, energy",
    "statistics": "Statistics - probability, distributions, hypothesis testing",
    "discrete_math": "Discrete Math - graphs, trees, sets, logic"
}

def validate_command(command: Dict[str, Any]) -> bool:
    """
    Validate command structure.

    Args:
        command: Command dict with "action" and optional params

    Returns:
        True if valid, False otherwise
    """

    if not isinstance(command, dict):
        return False

    action = command.get("action")
    if action not in VALID_ACTIONS:
        print(f"[Commands] Invalid action: {action}")
        return False

    # Validate required parameters
    if action == "select_node_by_label":
        if "label" not in command or not command["label"]:
            print(f"[Commands] Missing 'label' for select_node_by_label")
            return False

    if action == "switch_domain":
        if "domain" not in command or not command["domain"]:
            print(f"[Commands] Missing 'domain' for switch_domain")
            return False
        if command["domain"] not in AVAILABLE_DOMAINS:
            print(f"[Commands] Invalid domain: {command['domain']}")
            return False

    return True


def create_command(action: str, **kwargs) -> Dict[str, Any]:
    """
    Create a command dict.

    Args:
        action: Command action
        **kwargs: Additional parameters (e.g., label, message)

    Returns:
        Command dict
    """
    command = {"action": action}
    command.update(kwargs)
    return command
