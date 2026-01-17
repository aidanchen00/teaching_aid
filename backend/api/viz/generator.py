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
    For demo, we use simple rules:
    - Derivatives, Chain Rule, Power Rule -> three_spec (interactive)
    - Integrals, Definite Integrals -> manim_mp4 (animated)
    - Limits, Continuity, Implicit Differentiation -> image (diagram)
    """
    topic_lower = topic.lower().replace(" ", "_")
    
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
        "lhopitals_rule"
    ]:
        return "image"
    
    # Default to three_spec for unknown topics
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

