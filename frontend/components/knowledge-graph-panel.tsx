'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';

// Dynamically import ForceGraph3D to avoid SSR issues
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), {
  ssr: false,
});

interface GraphNode {
  id: string;
  label: string;
}

interface GraphLink {
  source: string;
  target: string;
}

interface GraphData {
  centerId: string;
  nodes: GraphNode[];
  links: GraphLink[];
}

interface KnowledgeGraphPanelProps {
  graph: GraphData;
  onNodeClick: (nodeId: string) => void;
  isBlurred?: boolean;
}

export function KnowledgeGraphPanel({ 
  graph, 
  onNodeClick,
  isBlurred = false 
}: KnowledgeGraphPanelProps) {
  const fgRef = useRef<any>();
  const [is3DReady, setIs3DReady] = useState(false);

  const recenterCamera = () => {
    if (fgRef.current) {
      try {
        // Position camera slightly to the left and above for better view
        fgRef.current.cameraPosition(
          { x: -50, y: 50, z: 300 },  // Camera position
          { x: 0, y: 0, z: 0 },       // Look at origin
          1500                         // Duration
        );
      } catch (e) {
        console.error('Error recentering camera:', e);
      }
    }
  };

  // Format data for react-force-graph-3d
  const graphData = {
    nodes: graph.nodes.map(node => ({
      id: node.id,
      label: node.label,
      isCenter: node.id === graph.centerId,
      // Fix center node at origin
      fx: node.id === graph.centerId ? 0 : undefined,
      fy: node.id === graph.centerId ? 0 : undefined,
      fz: node.id === graph.centerId ? 0 : undefined,
    })),
    links: graph.links.map(link => ({
      source: link.source,
      target: link.target,
    })),
  };

  // Initialize camera immediately when graph is ready
  useEffect(() => {
    if (fgRef.current && is3DReady) {
      console.log('[Graph] Initializing camera position');
      // Set initial camera position immediately
      try {
        fgRef.current.cameraPosition(
          { x: -50, y: 50, z: 300 },
          { x: 0, y: 0, z: 0 },
          0 // No animation for initial setup
        );
      } catch (e) {
        console.error('[Graph] Error setting initial camera:', e);
      }
      
      // Recenter after stabilization
      const timer = setTimeout(() => {
        console.log('[Graph] Recentering after stabilization');
        recenterCamera();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [is3DReady]);

  // Recenter when graph changes
  useEffect(() => {
    if (fgRef.current && is3DReady && graph.centerId) {
      const timer = setTimeout(() => {
        recenterCamera();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [graph.centerId, is3DReady]);

  useEffect(() => {
    console.log('[Graph] Component mounted, graph data:', {
      nodeCount: graph.nodes.length,
      linkCount: graph.links.length,
      centerId: graph.centerId
    });
    setIs3DReady(true);
  }, []);

  return (
    <Card className={`h-full w-full overflow-hidden ${isBlurred ? 'blur-sm opacity-50' : ''}`}>
      <div className="h-full w-full bg-slate-950 relative">
        {is3DReady && (
          <ForceGraph3D
            ref={fgRef}
            graphData={graphData}
            width={undefined}
            height={undefined}
            nodeLabel="label"
            nodeAutoColorBy="isCenter"
            nodeVal={(node: any) => node.isCenter ? 15 : 8}
            nodeColor={(node: any) => node.isCenter ? '#6366f1' : '#64748b'}
            nodeOpacity={1.0}
            nodeRelSize={6}
            linkColor={() => '#475569'}
            linkWidth={2}
            linkOpacity={0.6}
            onNodeClick={(node: any) => {
              console.log('[Graph] Node clicked:', node.id);
              onNodeClick(node.id);
            }}
            onNodeHover={(node: any) => {
              if (node) {
                document.body.style.cursor = 'pointer';
              } else {
                document.body.style.cursor = 'default';
              }
            }}
            backgroundColor="#020617"
            showNavInfo={false}
            enableNodeDrag={false}
            enableNavigationControls={true}
            warmupTicks={100}
            cooldownTicks={0}
            d3AlphaDecay={0.05}
            d3VelocityDecay={0.4}
            onEngineStop={() => {
              // Recenter camera when physics simulation stops
              console.log('[Graph] Physics engine stopped, recentering camera');
              setTimeout(() => {
                recenterCamera();
              }, 200);
            }}
            controlType="orbit"
            nodeThreeObject={(node: any) => {
              // Use default rendering for simplicity
              return undefined;
            }}
            nodeThreeObjectExtend={true}
          />
        )}
        
        {/* Overlay instructions and controls */}
        <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-lg px-4 py-2">
          <p className="text-xs text-slate-300">
            Click a node to learn • Drag to rotate • Scroll to zoom
          </p>
        </div>
        
        {/* Recenter button */}
        <div className="absolute top-4 right-4">
          <button
            onClick={recenterCamera}
            className="bg-slate-900/80 hover:bg-slate-800 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 hover:text-white transition-colors"
            title="Recenter view"
          >
            ⊙ Recenter
          </button>
        </div>
      </div>
    </Card>
  );
}

