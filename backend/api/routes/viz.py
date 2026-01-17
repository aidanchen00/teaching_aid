"""Visualization job endpoints."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, Literal

from api.viz.job_manager import job_manager, JobStatus

router = APIRouter()

class VizJobResponse(BaseModel):
    status: str
    stage: Optional[str] = None
    viz: Optional[Dict[str, Any]] = None
    message: Optional[str] = None

@router.get("/viz/job/{job_id}")
async def get_viz_job(job_id: str) -> VizJobResponse:
    """
    Poll the status of a visualization generation job.
    
    Returns:
        - status="pending": Job not yet started
        - status="running": Job in progress (includes stage)
        - status="done": Job complete (includes viz result)
        - status="error": Job failed (includes error message)
    """
    job = job_manager.get_job(job_id)
    
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    
    # Pending
    if job.status == JobStatus.PENDING:
        return VizJobResponse(
            status="pending",
            stage="Initializing..."
        )
    
    # Running
    elif job.status == JobStatus.RUNNING:
        return VizJobResponse(
            status="running",
            stage=job.stage or "Processing..."
        )
    
    # Done
    elif job.status == JobStatus.DONE:
        return VizJobResponse(
            status="done",
            viz=job.result
        )
    
    # Error
    elif job.status == JobStatus.ERROR:
        return VizJobResponse(
            status="error",
            message=job.error or "Unknown error occurred"
        )
    
    else:
        raise HTTPException(status_code=500, detail=f"Unknown job status: {job.status}")

