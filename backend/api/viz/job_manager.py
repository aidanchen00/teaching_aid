"""
In-memory async job manager for visualization generation.

Limitations:
- Single-process only (jobs lost on restart)
- No persistence
- Memory grows with job history (should implement cleanup in production)
"""
import asyncio
import uuid
from datetime import datetime
from typing import Dict, Optional, Any, Callable, Awaitable
from dataclasses import dataclass, field
from enum import Enum

class JobStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    DONE = "done"
    ERROR = "error"

@dataclass
class Job:
    id: str
    status: JobStatus
    stage: str = ""
    result: Optional[Any] = None
    error: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

class JobManager:
    """Simple in-memory job manager using asyncio tasks."""
    
    def __init__(self):
        self.jobs: Dict[str, Job] = {}
        self._tasks: Dict[str, asyncio.Task] = {}
    
    def create_job(self) -> str:
        """Create a new job and return its ID."""
        job_id = str(uuid.uuid4())
        job = Job(id=job_id, status=JobStatus.PENDING)
        self.jobs[job_id] = job
        print(f"[JobManager] Created job {job_id}")
        return job_id
    
    def get_job(self, job_id: str) -> Optional[Job]:
        """Get job by ID."""
        return self.jobs.get(job_id)
    
    def update_stage(self, job_id: str, stage: str):
        """Update the current stage of a job."""
        if job_id in self.jobs:
            self.jobs[job_id].stage = stage
            self.jobs[job_id].updated_at = datetime.now()
            print(f"[JobManager] Job {job_id} stage: {stage}")
    
    def complete_job(self, job_id: str, result: Any):
        """Mark job as complete with result."""
        if job_id in self.jobs:
            self.jobs[job_id].status = JobStatus.DONE
            self.jobs[job_id].result = result
            self.jobs[job_id].updated_at = datetime.now()
            print(f"[JobManager] Job {job_id} completed")
    
    def fail_job(self, job_id: str, error: str):
        """Mark job as failed with error message."""
        if job_id in self.jobs:
            self.jobs[job_id].status = JobStatus.ERROR
            self.jobs[job_id].error = error
            self.jobs[job_id].updated_at = datetime.now()
            print(f"[JobManager] Job {job_id} failed: {error}")
    
    async def execute_job(
        self, 
        job_id: str, 
        task_func: Callable[..., Awaitable[Any]],
        *args,
        **kwargs
    ):
        """Execute an async task for a job."""
        if job_id not in self.jobs:
            return
        
        # Mark as running
        self.jobs[job_id].status = JobStatus.RUNNING
        self.jobs[job_id].updated_at = datetime.now()
        
        try:
            # Execute the task
            result = await task_func(*args, **kwargs)
            self.complete_job(job_id, result)
        except Exception as e:
            self.fail_job(job_id, str(e))
        finally:
            # Clean up task reference
            if job_id in self._tasks:
                del self._tasks[job_id]
    
    def start_job(
        self,
        job_id: str,
        task_func: Callable[..., Awaitable[Any]],
        *args,
        **kwargs
    ):
        """Start a job in the background."""
        task = asyncio.create_task(
            self.execute_job(job_id, task_func, *args, **kwargs)
        )
        self._tasks[job_id] = task
        print(f"[JobManager] Started job {job_id}")

# Global job manager instance
job_manager = JobManager()

