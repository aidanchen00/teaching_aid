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

