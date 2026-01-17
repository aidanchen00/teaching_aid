"""
Visualization generator with stubbed LLM decision logic.
Deterministically selects visualization modality based on topic.
"""
from typing import Dict, Any, Literal
from .three_templates import get_three_spec_for_topic
from .manim_renderer import render_manim_video
from .gemini_image import generate_gemini_image
from .job_manager import job_manager

VizType = Literal["three_spec", "manim_mp4", "image"]

def select_viz_modality(topic: str) -> VizType:
    """
    Stubbed LLM decision: deterministically select visualization type based on topic.

    In production, this would call an LLM to decide the best visualization type.
    For demo, we use simple rules based on topic domain.
    """
    topic_lower = topic.lower().replace(" ", "_")

    # ==========================================================================
    # CALCULUS
    # ==========================================================================
    # Interactive 3D graphs for derivative-related topics
    if topic_lower in [
        "derivatives",
        "chain_rule",
        "product_rule",
        "power_rule",
        "quotient_rule"
    ]:
        return "three_spec"

    # Animated videos for integral-related topics
    elif topic_lower in [
        "integrals",
        "definite_integrals",
        "integration_by_parts",
        "substitution",
        "riemann_sums"
    ]:
        return "manim_mp4"

    # Static diagrams for conceptual topics
    elif topic_lower in [
        "limits",
        "continuity",
        "implicit_differentiation",
        "related_rates",
        "sequences",
        "lhopitals_rule",
        "fundamental_theorem"
    ]:
        return "image"

    # ==========================================================================
    # NEURAL NETWORKS / ML
    # ==========================================================================
    # Interactive 3D for network architecture
    elif topic_lower in [
        "neural_networks",
        "perceptron",
        "convolutional_networks",
        "relu",
        "sigmoid",
        "activation_functions"
    ]:
        return "three_spec"

    # Animated videos for optimization/learning process
    elif topic_lower in [
        "gradient_descent",
        "backpropagation"
    ]:
        return "manim_mp4"

    # Static diagrams for conceptual ML topics
    elif topic_lower in [
        "loss_functions",
        "regularization"
    ]:
        return "image"

    # ==========================================================================
    # LINEAR ALGEBRA
    # ==========================================================================
    # Interactive 3D for vectors and transformations
    elif topic_lower in [
        "vectors",
        "dot_product",
        "cross_product",
        "eigenvalues",
        "eigenvectors"
    ]:
        return "three_spec"

    # Animated videos for transformations
    elif topic_lower in [
        "linear_transformations",
        "matrices",
        "matrix_multiplication"
    ]:
        return "manim_mp4"

    # Static diagrams for theory topics
    elif topic_lower in [
        "determinants",
        "inverse_matrix",
        "vector_spaces"
    ]:
        return "image"

    # ==========================================================================
    # PHYSICS
    # ==========================================================================
    # Interactive 3D for motion and waves
    elif topic_lower in [
        "kinematics",
        "projectile_motion",
        "waves",
        "oscillations"
    ]:
        return "three_spec"

    # Animated videos for dynamics
    elif topic_lower in [
        "forces",
        "momentum",
        "energy",
        "mechanics"
    ]:
        return "manim_mp4"

    # Static diagrams for laws and concepts
    elif topic_lower in [
        "newtons_laws",
        "work",
        "rotation"
    ]:
        return "image"

    # ==========================================================================
    # STATISTICS
    # ==========================================================================
    # Interactive 3D for distributions and regression
    elif topic_lower in [
        "normal_distribution",
        "distributions",
        "regression",
        "correlation"
    ]:
        return "three_spec"

    # Animated videos for probability concepts
    elif topic_lower in [
        "bayes_theorem",
        "probability"
    ]:
        return "manim_mp4"

    # Static diagrams for inference topics
    elif topic_lower in [
        "hypothesis_testing",
        "confidence_intervals",
        "expected_value",
        "variance"
    ]:
        return "image"

    # ==========================================================================
    # DISCRETE MATH
    # ==========================================================================
    # Interactive 3D for graphs and trees
    elif topic_lower in [
        "graphs",
        "trees"
    ]:
        return "three_spec"

    # Animated videos for traversals and algorithms
    elif topic_lower in [
        "paths",
        "cycles",
        "connectivity",
        "recursion"
    ]:
        return "manim_mp4"

    # Static diagrams for set theory and logic
    elif topic_lower in [
        "sets",
        "logic",
        "combinatorics",
        "permutations",
        "combinations",
        "proofs"
    ]:
        return "image"

    # ==========================================================================
    # DEFAULT
    # ==========================================================================
    else:
        return "three_spec"

async def generate_visualization(
    topic: str,
    lesson_title: str,
    summary: str,
    job_id: str
) -> Dict[str, Any]:
    """
    Generate visualization for a topic.
    
    Returns:
        Dict with 'type' and either 'spec' (for three_spec) or 'url' (for image/video)
    """
    # Select modality
    viz_type = select_viz_modality(topic)
    
    print(f"[VizGenerator] Selected {viz_type} for topic: {topic}")
    
    # Update job stage
    job_manager.update_stage(job_id, f"Generating {viz_type} visualization...")
    
    try:
        if viz_type == "three_spec":
            # Generate Three.js spec
            job_manager.update_stage(job_id, "Building interactive 3D specification...")
            spec = get_three_spec_for_topic(topic)
            return {
                "type": "three_spec",
                "spec": spec,
                "url": None
            }
        
        elif viz_type == "manim_mp4":
            # Render Manim video
            job_manager.update_stage(job_id, "Generating animation code...")
            url = await render_manim_video(topic, lesson_title, job_id)
            return {
                "type": "manim_mp4",
                "spec": None,
                "url": url
            }
        
        elif viz_type == "image":
            # Generate Gemini image
            job_manager.update_stage(job_id, "Creating educational diagram...")
            url = await generate_gemini_image(topic, lesson_title, summary, job_id)
            return {
                "type": "image",
                "spec": None,
                "url": url
            }
        
        else:
            raise ValueError(f"Unknown visualization type: {viz_type}")
    
    except Exception as e:
        print(f"[VizGenerator] Error generating {viz_type}: {e}")
        raise

async def generate_visualization_task(
    topic: str,
    lesson_title: str,
    summary: str,
    viz_job_id: str
):
    """
    Task wrapper for visualization generation.
    Updates job manager with progress and results.
    """
    try:
        result = await generate_visualization(topic, lesson_title, summary, viz_job_id)
        return result
    except Exception as e:
        raise Exception(f"Visualization generation failed: {str(e)}")

