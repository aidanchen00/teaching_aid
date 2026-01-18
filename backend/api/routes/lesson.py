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

# Lesson content mapped by node ID - includes prompts for AI teaching
LESSON_CONTENT = {
    # The 3 main visualization tool nodes
    "threejs": {
        "title": "Three.js",
        "summary": "Three.js is a powerful JavaScript library for creating 3D graphics in the browser using WebGL. It provides a scene graph, cameras, lights, materials, and geometries to build interactive 3D visualizations, games, and animations. Key concepts include: Scene (container for all objects), Camera (perspective or orthographic view), Renderer (WebGL output to canvas), Mesh (geometry + material), and the animation loop using requestAnimationFrame."
    },
    "manim": {
        "title": "Manim",
        "summary": "Manim (Mathematical Animation Engine) is a Python library created by Grant Sanderson (3Blue1Brown) for creating precise mathematical animations. It excels at animating geometric transformations, function graphs, LaTeX equations, and step-by-step mathematical proofs. Key concepts include: Scene class (container for animations), Mobjects (mathematical objects), Animations (Create, Transform, FadeIn), and the construct() method where animations are defined. Manim outputs video files perfect for educational content."
    },
    "nano-banana-pro": {
        "title": "Nano Banana Pro",
        "summary": "Nano Banana Pro is a compact single-board computer designed for edge computing and AI applications. It features an ARM Cortex-A76 quad-core CPU, 8GB LPDDR4 RAM, integrated NPU (Neural Processing Unit) with 6 TOPS performance, GPIO pins for hardware interfacing, USB-C power delivery, Gigabit Ethernet, and eMMC storage. Ideal for robotics, IoT gateways, AI inference at the edge, and embedded Linux projects with low power consumption (15W TDP)."
    },
    # Topic categories for chat-generated nodes
    "calculus": {
        "title": "Calculus",
        "summary": "Calculus is the mathematical study of continuous change. It has two major branches: Differential Calculus (derivatives, rates of change, slopes of curves) and Integral Calculus (integrals, areas under curves, accumulation). Key concepts include limits, derivatives, integrals, the Fundamental Theorem of Calculus, chain rule, product rule, and applications in physics, engineering, and optimization."
    },
    "chemistry": {
        "title": "Chemistry",
        "summary": "Chemistry is the study of matter, its properties, composition, and transformations. Key concepts include: atomic structure (protons, neutrons, electrons), the periodic table organization, chemical bonds (ionic, covalent, metallic), molecular geometry, chemical reactions and equations, stoichiometry, acids and bases, and thermodynamics. Understanding chemistry helps explain everything from cooking to medicine to materials science."
    },
    "social": {
        "title": "Social Sciences",
        "summary": "Social sciences study human society and social relationships. This includes psychology (individual behavior and mental processes), sociology (social structures and group dynamics), economics (resource allocation and markets), political science (governance and power), and anthropology (human cultures). Key concepts include social norms, institutions, networks, collective behavior, identity formation, and how societies organize and change over time."
    },
}

class DirectLessonRequest(BaseModel):
    nodeId: str
    nodeLabel: str
    vizType: str = "image"  # "three" | "video" | "image"


@router.post("/lesson/direct")
async def select_lesson_direct(request: DirectLessonRequest) -> SelectLessonResponse:
    """
    Select a lesson directly without needing a session.
    Used when graph is controlled by voice agent.
    """
    node_id = request.nodeId
    node_label = request.nodeLabel
    viz_type = request.vizType

    # Get lesson content or generate from label
    lesson_content = LESSON_CONTENT.get(node_id, {
        "title": node_label,
        "summary": f"Learn about {node_label} and explore its key concepts."
    })

    lesson_id = str(uuid.uuid4())
    viz_job_id = job_manager.create_job()

    print(f"[Lesson] Direct lesson for {node_id} ({node_label}), vizType: {viz_type}")

    job_manager.start_job(
        viz_job_id,
        generate_visualization_task,
        topic=node_id,
        lesson_title=lesson_content["title"],
        summary=lesson_content["summary"],
        viz_job_id=viz_job_id,
        viz_type=viz_type
    )

    return SelectLessonResponse(
        lessonId=lesson_id,
        title=lesson_content["title"],
        summary=lesson_content["summary"],
        vizJobId=viz_job_id
    )


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

    # Get vizType from node if available (from chat-generated nodes)
    node_viz_type = getattr(node, 'vizType', None)
    print(f"[Lesson] Node {node_id} has vizType: {node_viz_type}")

    # Start visualization generation in background
    # Note: job_id is passed separately to task_func via kwargs
    job_manager.start_job(
        viz_job_id,
        generate_visualization_task,
        topic=node_id,
        lesson_title=lesson_content["title"],
        summary=lesson_content["summary"],
        viz_job_id=viz_job_id,  # passed as viz_job_id to avoid conflict
        viz_type=node_viz_type  # pass vizType from node
    )
    
    print(f"[Lesson] Selected lesson for node {node_id}, vizJobId={viz_job_id}")
    
    return SelectLessonResponse(
        lessonId=lesson_id,
        title=lesson_content["title"],
        summary=lesson_content["summary"],
        vizJobId=viz_job_id
    )

