// Chat and orchestration types for openpreneurship

export type Phase = 'input' | 'planning' | 'integration_setup' | 'executing' | 'completed';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  metadata?: {
    planId?: string;
    departmentId?: string;
    agentId?: string;
    outputId?: string;
  };
}

export interface WorkflowNode {
  id: string;
  type: 'department' | 'agent';
  label: string;
  description?: string;
  status: 'pending' | 'running' | 'completed' | 'error' | 'needs_auth';
  progress?: number;
  color: string;
  icon?: string;
  tools?: string[];
  position?: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: 'default' | 'dependency';
}

export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'communication' | 'development' | 'design' | 'productivity' | 'sales' | 'finance';
  status: 'connected' | 'disconnected' | 'error';
  required: boolean;
  connectedAs?: string;
  scopes?: string[];
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  workflow: WorkflowGraph;
  integrations: Integration[];
  estimatedTime: string;
  approved: boolean;
}

export interface ExecutionOutput {
  id: string;
  name: string;
  type: 'file' | 'link' | 'text' | 'code';
  content?: string;
  url?: string;
  createdBy: string;
  createdAt: Date;
  departmentId: string;
  data?: Record<string, unknown>; // Raw data from tool call result
}

export interface OrchestratorState {
  phase: Phase;
  messages: ChatMessage[];
  currentPlan?: Plan;
  isExecuting: boolean;
  outputs: ExecutionOutput[];
  error?: string;
}
