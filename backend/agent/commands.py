from typing import Dict, Any, Optional

# Supported command actions
VALID_ACTIONS = {
    "select_node_by_label",  # Requires: label
    "back_to_graph",         # No params
    "start_lesson",          # No params
    "end_lesson",            # No params
    "error",                 # Special: message
    "clarify"                # Special: question (not published)
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
