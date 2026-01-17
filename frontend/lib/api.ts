/**
 * API client functions for lesson and visualization endpoints.
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export interface SelectLessonResponse {
  lessonId: string;
  title: string;
  summary: string;
  vizJobId: string;
}

export interface VizJobResponse {
  status: 'pending' | 'running' | 'done' | 'error';
  stage?: string;
  viz?: {
    type: 'three_spec' | 'manim_mp4' | 'image';
    spec?: any;
    url?: string;
  };
  message?: string;
}

/**
 * Select a lesson for a node and start visualization generation.
 */
export async function selectLesson(
  sessionId: string,
  nodeId: string
): Promise<SelectLessonResponse> {
  const response = await fetch(
    `${BACKEND_URL}/session/${sessionId}/lesson/select`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nodeId }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to select lesson: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Poll the status of a visualization generation job.
 */
export async function getVizJob(vizJobId: string): Promise<VizJobResponse> {
  const response = await fetch(`${BACKEND_URL}/viz/job/${vizJobId}`);

  if (!response.ok) {
    throw new Error(`Failed to get viz job: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Poll for visualization completion with automatic retries.
 * Polls every 1 second until the job is done or errors.
 */
export async function pollVizJob(
  vizJobId: string,
  onProgress?: (stage: string) => void,
  maxAttempts: number = 60
): Promise<VizJobResponse> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const result = await getVizJob(vizJobId);

    if (result.status === 'done' || result.status === 'error') {
      return result;
    }

    // Report progress
    if (onProgress && result.stage) {
      onProgress(result.stage);
    }

    // Wait 1 second before next poll
    await new Promise((resolve) => setTimeout(resolve, 1000));
    attempts++;
  }

  // Timeout
  throw new Error('Visualization generation timed out');
}

