/**
 * API client for openpreneurship backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Types matching the backend API
export interface WorkflowSetOption {
  id: string;
  title: string;
  description: string;
  workflows: string[];
  rationale: string;
}

export interface PlanResponse {
  options: WorkflowSetOption[];
  analysis: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  purpose: string;
  inputs: string[];
  outputs: string[];
}

export interface WorkflowSchema {
  id: string;
  name: string;
  status: string;
  steps: WorkflowStep[];
  n8n_workflow_id?: string;
  n8n_json?: Record<string, unknown>;
}

export interface WorkflowSetResponse {
  id: string;
  title: string;
  description: string;
  workflows: WorkflowSchema[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  source: "orchestrator" | "agent";
  agent_name?: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
}

export interface OutputItem {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  type: "text" | "code" | "data";
}

export interface RunResponse {
  run_id: string;
  status: "pending" | "running" | "done" | "failed";
  iteration: number;
  logs: LogEntry[];
  outputs: OutputItem[];
  workflow_statuses: Record<string, string>;
  started_at?: string;
  completed_at?: string;
}

export interface ExecuteResponse {
  run_id: string;
  status: string;
}

/**
 * Generate plan options from user goal
 */
export async function createPlan(
  goal: string,
  context?: string
): Promise<PlanResponse> {
  const response = await fetch(`${API_BASE_URL}/api/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ goal, context }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create plan: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Select a plan option and create workflows
 */
export async function selectOption(
  optionId: string
): Promise<WorkflowSetResponse> {
  const response = await fetch(`${API_BASE_URL}/api/select`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ option_id: optionId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to select option: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get the current workflow set
 */
export async function getWorkflows(): Promise<WorkflowSetResponse> {
  const response = await fetch(`${API_BASE_URL}/api/workflows`);

  if (!response.ok) {
    throw new Error(`Failed to get workflows: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get a specific workflow by name
 */
export async function getWorkflow(name: string): Promise<WorkflowSchema> {
  const response = await fetch(`${API_BASE_URL}/api/workflow/${name}`);

  if (!response.ok) {
    throw new Error(`Failed to get workflow: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Start an execution run
 */
export async function executeRun(
  goal: string,
  context?: string
): Promise<ExecuteResponse> {
  const response = await fetch(`${API_BASE_URL}/api/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ goal, context }),
  });

  if (!response.ok) {
    throw new Error(`Failed to start execution: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get run status and results
 */
export async function getRun(runId: string): Promise<RunResponse> {
  const response = await fetch(`${API_BASE_URL}/api/run/${runId}`);

  if (!response.ok) {
    throw new Error(`Failed to get run: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Subscribe to run updates via SSE
 */
export function subscribeToRun(
  runId: string,
  callbacks: {
    onLog?: (log: LogEntry) => void;
    onOutput?: (output: OutputItem) => void;
    onComplete?: (status: string) => void;
    onError?: (error: Error) => void;
  }
): () => void {
  const eventSource = new EventSource(`${API_BASE_URL}/api/run/${runId}/stream`);

  eventSource.addEventListener("log", (event) => {
    try {
      const log = JSON.parse(event.data) as LogEntry;
      callbacks.onLog?.(log);
    } catch (e) {
      console.error("Failed to parse log event:", e);
    }
  });

  eventSource.addEventListener("output", (event) => {
    try {
      const output = JSON.parse(event.data) as OutputItem;
      callbacks.onOutput?.(output);
    } catch (e) {
      console.error("Failed to parse output event:", e);
    }
  });

  eventSource.addEventListener("complete", (event) => {
    try {
      const data = JSON.parse(event.data);
      callbacks.onComplete?.(data.status);
      eventSource.close();
    } catch (e) {
      console.error("Failed to parse complete event:", e);
    }
  });

  eventSource.onerror = (error) => {
    console.error("SSE error:", error);
    callbacks.onError?.(new Error("Connection lost"));
    eventSource.close();
  };

  // Return cleanup function
  return () => eventSource.close();
}
