'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { KnowledgeGraphPanel } from './knowledge-graph-panel';
import { LessonOverlay } from './lesson-overlay';
import { Chat } from './chat';
import { AgentCommand } from '@/hooks/useAgentDataChannel';
import { GraphNode, GraphData } from '@/lib/types';
import { preloadCache } from '@/lib/preload-cache';

type Mode = 'GRAPH' | 'VIZ';

interface LearningPanelProps {
  lastCommand?: AgentCommand | null;
  sendCommand?: ((action: string, payload?: any) => void) | null;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export function LearningPanel({ lastCommand, sendCommand }: LearningPanelProps) {
  const [mode, setMode] = useState<Mode>('GRAPH');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [graph, setGraph] = useState<GraphData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMaterialsButton, setShowMaterialsButton] = useState(false);

  // Use refs to avoid stale closures in callbacks and effects
  const graphRef = useRef<GraphData | null>(null);
  const processedCommandRef = useRef<AgentCommand | null>(null);

  // Keep graphRef in sync with graph state
  useEffect(() => {
    graphRef.current = graph;
  }, [graph]);

  // Check if materials exist for this session
  useEffect(() => {
    if (!sessionId) return;

    fetch(`${BACKEND_URL}/session/${sessionId}/opennote`)
      .then(res => {
        if (res.ok) {
          setShowMaterialsButton(true);
        }
      })
      .catch(() => {
        setShowMaterialsButton(false);
      });
  }, [sessionId]);

  const handleOpenMaterials = () => {
    if (sessionId) {
      window.location.href = `/breakout?session=${sessionId}`;
    }
  };

  // Preload visualizations when graph updates
  useEffect(() => {
    if (!graph || !sessionId) return;

    // Preload all nodes in the current graph
    // Prioritize nodes connected to the center
    const centerNode = graph.nodes.find(n => n.id === graph.centerId);
    const adjacentNodeIds = graph.links
      .filter(link => link.source === graph.centerId || link.target === graph.centerId)
      .map(link => link.source === graph.centerId ? link.target : link.source);

    console.log('[LearningPanel] Starting preload for graph with', graph.nodes.length, 'nodes');
    preloadCache.preloadNodes(graph.nodes, sessionId, adjacentNodeIds);

    // Log cache stats after a short delay
    setTimeout(() => {
      const stats = preloadCache.getStats();
      console.log('[LearningPanel] Preload cache stats:', stats);
    }, 2000);
  }, [graph, sessionId]);

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

  const handleNodeClick = useCallback(async (nodeId: string) => {
    // Use ref to always get the latest graph, avoiding stale closure issues
    const currentGraph = graphRef.current;
    console.log('[LearningPanel] Node clicked:', nodeId, 'graph:', currentGraph, 'sessionId:', sessionId);

    if (!currentGraph) {
      console.log('[LearningPanel] No graph, aborting');
      return;
    }

    // Find the selected node from current graph (works for both backend and agent-controlled graphs)
    const node = currentGraph.nodes.find((n: GraphNode) => n.id === nodeId);
    console.log('[LearningPanel] Found node:', node);

    if (node) {
      // Defer state updates to next tick to let Three.js click handling complete
      // This prevents the re-render from disrupting OrbitControls/DragControls
      setTimeout(() => {
        console.log('[LearningPanel] Setting selectedNode and mode to VIZ (deferred)');
        setSelectedNode(node);
        setMode('VIZ');

        // Update graph center locally
        setGraph(prevGraph => prevGraph ? {
          ...prevGraph,
          centerId: nodeId
        } : null);
      }, 0);

      // Notify agent about node selection for auto-teaching
      if (sendCommand) {
        console.log('[LearningPanel] Sending node_selected command to agent');
        sendCommand('node_selected', {
          nodeId: node.id,
          label: node.label,
          vizType: node.vizType,
          // @ts-ignore
          description: node.description || ''
        });
      }

      // EXPANSION LOGIC: Trigger expansion in background if node not expanded
      // Create clean node data (strip any React/Three.js references from force graph)
      const cleanNode = {
        id: node.id,
        label: node.label,
        vizType: node.vizType,
        // @ts-ignore - Node might have expansion fields from backend
        expanded: node.expanded || false,
        // @ts-ignore
        depth: node.depth || 0,
      };

      if (!cleanNode.expanded && cleanNode.depth < 3 && sessionId) {
        console.log('[LearningPanel] Triggering background expansion for', nodeId);
        try {
          // Call chat endpoint with expansion mode
          const response = await fetch(`${BACKEND_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: cleanNode.label,
              sessionId: sessionId,
              mode: 'expand',
              parentNodeId: nodeId,
            }),
          });

          if (response.ok) {
            console.log('[LearningPanel] Expansion triggered, fetching updated graph');
            // Fetch updated graph after expansion
            const updatedGraph = await fetch(`${BACKEND_URL}/session/${sessionId}/graph`);
            if (updatedGraph.ok) {
              const newGraph = await updatedGraph.json();
              console.log('[LearningPanel] Graph expanded, now has', newGraph.nodes.length, 'nodes');
              // Update graph state (user will see new nodes when they go back to graph view)
              setGraph(newGraph);
              graphRef.current = newGraph;
              // Preload new nodes
              preloadCache.preloadNodes(newGraph.nodes, sessionId);
            }
          }
        } catch (err) {
          console.error('[LearningPanel] Error triggering expansion:', err);
          // Continue showing visualization even if expansion fails
        }
      }
    } else {
      console.log('[LearningPanel] Node not found in graph.nodes:', currentGraph.nodes);
    }
  }, [sessionId, sendCommand]); // Remove graph from dependencies since we use graphRef

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
    if (!lastCommand) return;

    // Skip if we've already processed this exact command (prevents double-processing)
    if (processedCommandRef.current === lastCommand) {
      console.log('[LearningPanel] Skipping already-processed command');
      return;
    }

    const { action, label, graph: newGraph, sessionId: agentSessionId } = lastCommand.payload;
    console.log('[LearningPanel] Handling agent command:', action, 'sessionId:', agentSessionId);

    // Mark this command as processed
    processedCommandRef.current = lastCommand;

    switch (action) {
      case 'update_graph':
        // Agent generated a new graph
        if (newGraph) {
          console.log('[LearningPanel] Updating graph from agent:', newGraph);
          // Update ref immediately so handleNodeClick has the latest graph
          graphRef.current = newGraph;
          setGraph(newGraph);
          setSelectedNode(null);
          setMode('GRAPH');

          // Use agent's session ID so lesson selection works
          if (agentSessionId) {
            console.log('[LearningPanel] Switching to agent session:', agentSessionId);
            setSessionId(agentSessionId);
            localStorage.setItem('learning_session_id', agentSessionId);
          }
        }
        break;

      case 'select_node_by_label':
        // Use ref to get current graph, avoiding stale closure
        const currentGraph = graphRef.current;
        if (label && currentGraph) {
          // Find node by label (case-insensitive)
          const node = currentGraph.nodes.find(
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
        // Check current selected node from ref pattern
        setMode('VIZ');
        break;

      case 'end_lesson':
        handleBackToGraph();
        break;

      default:
        console.log('[LearningPanel] Unhandled command:', action);
    }
  }, [lastCommand, handleNodeClick]); // Only depend on lastCommand and handleNodeClick

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

  // Debug: log render state
  console.log('[LearningPanel] Render state:', { mode, selectedNode: selectedNode?.id, sessionId, graphNodes: graph?.nodes?.length });

  // Check why LessonOverlay might not render
  const shouldShowOverlay = mode === 'VIZ' && selectedNode && sessionId;
  console.log('[LearningPanel] Should show overlay:', shouldShowOverlay, { mode, hasSelectedNode: !!selectedNode, hasSessionId: !!sessionId });

  return (
    <div className="w-full h-full relative">
      {/* Error toast */}
      {error && (
        <div className="absolute top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {error}
        </div>
      )}

      {/* Knowledge Graph - key forces remount when session or graph structure changes */}
      {graph && (
        <KnowledgeGraphPanel
          key={`${sessionId}-${graph.centerId}`}
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
      {shouldShowOverlay && (
        <LessonOverlay
          node={selectedNode!}
          sessionId={sessionId!}
          onBackToGraph={handleBackToGraph}
        />
      )}

      {/* Study Materials Button */}
      {showMaterialsButton && mode === 'GRAPH' && (
        <button
          onClick={handleOpenMaterials}
          className="absolute bottom-4 right-4 px-4 py-3 bg-indigo-600 hover:bg-indigo-700
                     text-white rounded-lg shadow-lg flex items-center gap-2 z-50
                     transition-all hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Study Materials
        </button>
      )}
    </div>
  );
}
