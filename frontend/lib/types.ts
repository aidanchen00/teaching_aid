/**
 * Shared TypeScript types for the learning app.
 */

export type VizType = 'three' | 'video' | 'image';

export interface GraphNode {
  id: string;
  label: string;
  vizType?: VizType;
  description?: string;  // For OpenNote - detailed topic description
  summary?: string;      // For agent - brief teaching context
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphData {
  centerId: string;
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  message: string;
  nodes: GraphNode[];
  links: GraphLink[];
  centerId: string;
}
