'use client';

import { useEffect, useState, useCallback } from 'react';
import { KnowledgeGraphPanel } from './knowledge-graph-panel';
import { LessonOverlay } from './lesson-overlay';
import { Chat } from './chat';
import { AgentCommand } from '@/hooks/useAgentDataChannel';
import { GraphNode, GraphData } from '@/lib/types';

type Mode = 'GRAPH' | 'VIZ';

interface LearningPanelProps {
  lastCommand?: AgentCommand | null;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export function LearningPanel({ lastCommand }: LearningPanelProps) {
  const [mode, setMode] = useState<Mode>('GRAPH');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [graph, setGraph] = useState<GraphData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        // Check localStorage for existing session
        const storedSessionId = localStorage.getItem('learning_session_id');
        
        let sessionIdToUse: string;
        
        if (storedSessionId) {
          // Try to fetch existing session
          try {
            const response = await fetch(`${BACKEND_URL}/session/${storedSessionId}/graph`);
            if (response.ok) {
              sessionIdToUse = storedSessionId;
              console.log('[LearningPanel] Using existing session:', sessionIdToUse);
            } else {
              throw new Error('Session not found');
            }
          } catch (e) {
            console.log('[LearningPanel] Existing session invalid, creating new one');
            sessionIdToUse = await createNewSession();
          }
        } else {
          sessionIdToUse = await createNewSession();
        }
        
        setSessionId(sessionIdToUse);
        await fetchGraph(sessionIdToUse);
      } catch (err) {
        console.error('[LearningPanel] Init error:', err);
        setError('Failed to initialize learning session');
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, []);

  const createNewSession = async (): Promise<string> => {
    const response = await fetch(`${BACKEND_URL}/session/create`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to create session');
    }
    
    const data = await response.json();
    localStorage.setItem('learning_session_id', data.sessionId);
    console.log('[LearningPanel] Created new session:', data.sessionId);
    return data.sessionId;
  };

  const fetchGraph = async (sid: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/session/${sid}/graph`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch graph');
      }
      
      const data = await response.json();
      setGraph(data);
      console.log('[LearningPanel] Fetched graph:', data);
    } catch (err) {
      console.error('[LearningPanel] Fetch graph error:', err);
      setError('Failed to load knowledge graph');
    }
  };

  const handleNodeClick = async (nodeId: string) => {
    if (!sessionId) return;
    
    try {
      console.log('[LearningPanel] Node clicked:', nodeId);
      
      // Call backend to update center
      const response = await fetch(`${BACKEND_URL}/session/${sessionId}/select_node`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nodeId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to select node');
      }
      
      const updatedGraph = await response.json();
      setGraph(updatedGraph);
      
      // Find the selected node
      const node = updatedGraph.nodes.find((n: GraphNode) => n.id === nodeId);
      if (node) {
        setSelectedNode(node);
        setMode('VIZ');
      }
    } catch (err) {
      console.error('[LearningPanel] Select node error:', err);
      setError('Failed to select node');
    }
  };

  const handleBackToGraph = () => {
    console.log('[LearningPanel] Back to graph');
    setMode('GRAPH');
  };

  // Handle graph updates from Chat component
  const handleGraphUpdate = useCallback((newGraph: GraphData) => {
    console.log('[LearningPanel] Graph updated from chat:', newGraph);
    setGraph(newGraph);
    // Reset selected node when graph changes
    setSelectedNode(null);
    setMode('GRAPH');
  }, []);

  // Handle agent commands
  useEffect(() => {
    if (!lastCommand || !sessionId || !graph) return;

    const { action, label } = lastCommand.payload;
    console.log('[LearningPanel] Handling agent command:', action, label);

    switch (action) {
      case 'select_node_by_label':
        if (label) {
          // Find node by label (case-insensitive)
          const node = graph.nodes.find(
            n => n.label.toLowerCase() === label.toLowerCase()
          );
          
          if (node) {
            handleNodeClick(node.id);
          } else {
            console.warn('[LearningPanel] Node not found for label:', label);
            setError(`Topic "${label}" not found in current graph`);
            setTimeout(() => setError(null), 3000);
          }
        }
        break;
        
      case 'back_to_graph':
        handleBackToGraph();
        break;
        
      case 'start_lesson':
        if (selectedNode) {
          setMode('VIZ');
        } else {
          console.warn('[LearningPanel] No node selected for start_lesson');
        }
        break;
        
      case 'end_lesson':
        handleBackToGraph();
        break;
        
      default:
        console.log('[LearningPanel] Unhandled command:', action);
    }
  }, [lastCommand, sessionId, graph, selectedNode]);

  if (isLoading) {
    return (
      <div className="w-full h-full bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading knowledge graph...</p>
        </div>
      </div>
    );
  }

  if (error && !graph) {
    return (
      <div className="w-full h-full bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Error toast */}
      {error && (
        <div className="absolute top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {error}
        </div>
      )}

      {/* Knowledge Graph */}
      {graph && (
        <KnowledgeGraphPanel
          graph={graph}
          onNodeClick={handleNodeClick}
          isBlurred={mode === 'VIZ'}
        />
      )}

      {/* Chat Component */}
      {mode === 'GRAPH' && (
        <Chat
          onGraphUpdate={handleGraphUpdate}
          currentGraph={graph}
          sessionId={sessionId}
        />
      )}

      {/* Lesson Overlay */}
      {mode === 'VIZ' && selectedNode && sessionId && (
        <LessonOverlay
          node={selectedNode}
          sessionId={sessionId}
          onBackToGraph={handleBackToGraph}
        />
      )}
    </div>
  );
}
