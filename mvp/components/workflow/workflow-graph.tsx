"use client";

import { useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MiniMap,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { WorkflowGraph as WorkflowGraphType } from '@/lib/types';
import { WorkflowNode } from './workflow-node';
import { AgentNode } from './agent-node';

interface WorkflowGraphProps {
  workflow: WorkflowGraphType;
  onNodeClick?: (nodeId: string) => void;
  interactive?: boolean;
  showMinimap?: boolean;
  useAgentNodes?: boolean;
}

const nodeTypes = {
  custom: WorkflowNode,
  agent: AgentNode,
};

// Helper to convert workflow nodes to ReactFlow nodes
function convertNodes(workflow: WorkflowGraphType, useAgentNodes: boolean): Node[] {
  return workflow.nodes.map((node) => ({
    id: node.id,
    type: useAgentNodes ? 'agent' : 'custom',
    position: node.position || { x: 0, y: 0 },
    data: {
      label: node.label,
      description: node.description,
      status: node.status,
      progress: node.progress,
      color: node.color,
      icon: node.icon,
      tools: node.tools,
    },
  }));
}

// Helper to convert workflow edges to ReactFlow edges
function convertEdges(workflow: WorkflowGraphType, useAgentNodes: boolean): Edge[] {
  return workflow.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    type: 'smoothstep',
    animated: edge.type === 'dependency',
    style: {
      stroke: useAgentNodes ? '#3B82F6' : '#94a3b8',
      strokeWidth: 2
    },
    markerEnd: {
      type: 'arrowclosed',
      color: useAgentNodes ? '#3B82F6' : '#94a3b8',
    },
  }));
}

export function WorkflowGraph({
  workflow,
  onNodeClick,
  interactive = false,
  showMinimap = true,
  useAgentNodes = false
}: WorkflowGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(convertNodes(workflow, useAgentNodes));
  const [edges, setEdges, onEdgesChange] = useEdgesState(convertEdges(workflow, useAgentNodes));

  // Track previous workflow to detect changes
  const prevWorkflowRef = useRef<string>("");

  // Update nodes/edges when workflow changes (for execution progress)
  useEffect(() => {
    // Create a simple hash of the workflow state to detect changes
    const workflowHash = JSON.stringify(
      workflow.nodes.map(n => ({ id: n.id, status: n.status, progress: n.progress }))
    );

    if (workflowHash !== prevWorkflowRef.current) {
      prevWorkflowRef.current = workflowHash;
      setNodes(convertNodes(workflow, useAgentNodes));
      setEdges(convertEdges(workflow, useAgentNodes));
    }
  }, [workflow, useAgentNodes]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (onNodeClick) {
        onNodeClick(node.id);
      }
    },
    [onNodeClick]
  );

  return (
    <div className="h-full w-full bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={interactive ? onNodesChange : undefined}
        onEdgesChange={interactive ? onEdgesChange : undefined}
        onConnect={interactive ? onConnect : undefined}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
        nodesDraggable={interactive}
        nodesConnectable={interactive}
        elementsSelectable={interactive}
      >
        <Background color="hsl(217 33% 22%)" />
        <Controls className="bg-card border-border" />
        {showMinimap && (
          <MiniMap
            nodeStrokeWidth={3}
            zoomable
            pannable
            className="bg-card border border-border rounded-lg"
          />
        )}
        <Panel position="top-left" className="bg-card p-2 rounded-lg shadow-sm border border-border">
          <div className="text-xs font-medium text-muted-foreground">
            {workflow.nodes.length} departments • {workflow.edges.length} dependencies
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
