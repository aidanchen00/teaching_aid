"""
Visualization generator - supports both SVG and Manim video.
- "three" and "image" vizTypes: SVG (cached or Gemini-generated)
- "video" vizType: Actual Manim-rendered MP4 videos
"""
from typing import Dict, Any
from .gemini_image import generate_gemini_svg, find_cached_svg
from .manim_generator import generate_manim_video, find_cached_video
from .job_manager import job_manager


async def generate_visualization(
    topic: str,
    lesson_title: str,
    summary: str,
    job_id: str,
    viz_type: str = "image"
) -> Dict[str, Any]:
    """
    Generate visualization for a topic.

    For "video" vizType: Generate actual Manim video (MP4)
    For "three"/"image" vizType: Generate SVG (cached or Gemini)

    Returns appropriate content based on type.
    """
    # Default to "image" if no vizType provided
    if not viz_type:
        viz_type = "image"

    print(f"[VizGenerator] Generating viz for topic={topic}, vizType={viz_type}")

    # Handle VIDEO type - use Manim
    if viz_type == "video":
        return await _generate_video(topic, lesson_title, summary, job_id)

    # Handle THREE and IMAGE types - use SVG
    return await _generate_svg(topic, lesson_title, summary, job_id, viz_type)


async def _generate_video(
    topic: str,
    lesson_title: str,
    summary: str,
    job_id: str
) -> Dict[str, Any]:
    """Generate Manim video for the topic."""
    # Check for pre-generated video first
    job_manager.update_stage(job_id, "Checking video cache...")
    cached_video = find_cached_video(topic)

    if cached_video:
        print(f"[VizGenerator] Video cache HIT: {topic}")
        return {
            "type": "video",
            "videoUrl": cached_video,
            "cached": True
        }

    # Generate with Manim
    print(f"[VizGenerator] Video cache MISS: rendering with Manim")
    job_manager.update_stage(job_id, "Rendering Manim animation...")

    success, result = await generate_manim_video(
        topic=topic,
        title=lesson_title,
        summary=summary,
        job_id=job_id
    )

    if success:
        return {
            "type": "video",
            "videoUrl": result,
            "cached": False
        }
    else:
        # Fallback to SVG if Manim fails
        print(f"[VizGenerator] Manim failed, falling back to SVG: {result}")
        job_manager.update_stage(job_id, "Manim failed, generating SVG fallback...")
        return await _generate_svg(topic, lesson_title, summary, job_id, "video")


async def _generate_svg(
    topic: str,
    lesson_title: str,
    summary: str,
    job_id: str,
    viz_type: str
) -> Dict[str, Any]:
    """Generate SVG visualization for the topic."""
    # Check for cached SVG first
    job_manager.update_stage(job_id, "Checking cache...")
    cached_svg = find_cached_svg(topic, lesson_title, viz_type)

    if cached_svg:
        print(f"[VizGenerator] SVG cache HIT: {topic} ({viz_type})")
        return {
            "type": "svg",
            "svgContent": cached_svg,
            "cached": True
        }

    # No cache - generate with Gemini
    print(f"[VizGenerator] SVG cache MISS: generating with Gemini")
    job_manager.update_stage(job_id, "Generating visualization...")

    svg_content = await generate_gemini_svg(
        topic=topic,
        lesson_title=lesson_title,
        summary=summary,
        viz_type=viz_type
    )

    return {
        "type": "svg",
        "svgContent": svg_content,
        "cached": False
    }


async def generate_visualization_task(
    topic: str,
    lesson_title: str,
    summary: str,
    viz_job_id: str,
    viz_type: str = None
):
    """
    Task wrapper for visualization generation.
    """
    try:
        result = await generate_visualization(
            topic=topic,
            lesson_title=lesson_title,
            summary=summary,
            job_id=viz_job_id,
            viz_type=viz_type
        )
        return result
    except Exception as e:
        print(f"[VizGenerator] Error: {e}")
        raise Exception(f"Visualization generation failed: {str(e)}")
