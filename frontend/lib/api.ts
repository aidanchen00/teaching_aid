/**
 * API client functions for lesson and visualization endpoints.
 */
import { GraphData, GraphNode, GraphLink, VizType } from './types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export interface SelectLessonResponse {
  lessonId: string;
  title: string;
  summary: string;
  vizJobId: string;
}

export interface ChatResponse {
  message: string;
  nodes: GraphNode[];
  links: GraphLink[];
  centerId: string;
}

export interface VizJobResponse {
  status: 'pending' | 'running' | 'done' | 'error';
  stage?: string;
  viz?: {
    type: 'svg' | 'video';
    svgContent?: string;
    videoUrl?: string;
    cached?: boolean;
  };
  message?: string;
}

/**
 * Select a lesson directly without needing a session.
 * Used when graph is controlled by voice agent.
 */
export async function selectLessonDirect(
  nodeId: string,
  nodeLabel: string,
  vizType: string = 'image'
): Promise<SelectLessonResponse> {
  const response = await fetch(
    `${BACKEND_URL}/lesson/direct`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nodeId, nodeLabel, vizType }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to select lesson: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Select a lesson for a node and start visualization generation.
 * Falls back to direct endpoint if session-based fails.
 */
export async function selectLesson(
  sessionId: string,
  nodeId: string,
  nodeLabel?: string,
  vizType?: string
): Promise<SelectLessonResponse> {
  // Try session-based first
  try {
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

    if (response.ok) {
      return response.json();
    }

    // If 404, fall back to direct endpoint
    if (response.status === 404 && nodeLabel) {
      console.log('[API] Session not found, using direct endpoint');
      return selectLessonDirect(nodeId, nodeLabel, vizType || 'image');
    }

    throw new Error(`Failed to select lesson: ${response.statusText}`);
  } catch (error: any) {
    // If we have node info, try direct endpoint
    if (nodeLabel) {
      console.log('[API] Falling back to direct endpoint');
      return selectLessonDirect(nodeId, nodeLabel, vizType || 'image');
    }
    throw error;
  }
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

/**
 * Generate a knowledge graph from a user query using AI.
 */
export async function generateGraphFromChat(message: string): Promise<ChatResponse> {
  const response = await fetch(`${BACKEND_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate graph: ${response.statusText}`);
  }

  return response.json();
}

