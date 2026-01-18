'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { GraphData, VizType } from '@/lib/types';

// Dynamically import ForceGraph3D to avoid SSR issues
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), {
  ssr: false,
});

// Colors for vizType indicators
const VIZ_TYPE_COLORS: Record<VizType, string> = {
  three: '#6366f1',  // indigo - Interactive 3D
  video: '#10b981',  // emerald - Animation
  image: '#f59e0b',  // amber - Diagram
};

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
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [is3DReady, setIs3DReady] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Track container dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({ width: clientWidth, height: clientHeight });
      }
    };

    updateDimensions();
    
    // Use ResizeObserver for accurate container size tracking
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const recenterCamera = () => {
    if (fgRef.current) {
      try {
        console.log('[Graph] Recentering camera to origin');
        // Position camera very close to nodes
        fgRef.current.cameraPosition(
          { x: 0, y: 0, z: 80 },      // Even closer
          { x: 0, y: 0, z: 0 },       // Look at origin (center)
          1500                         // Duration
        );
      } catch (e) {
        console.error('Error recentering camera:', e);
      }
    }
  };

  // Get node color based on vizType or center status
  const getNodeColor = (node: any): string => {
    if (node.isCenter) {
      return '#6366f1'; // indigo for center
    }
    if (node.vizType && VIZ_TYPE_COLORS[node.vizType as VizType]) {
      return VIZ_TYPE_COLORS[node.vizType as VizType];
    }
    return '#64748b'; // slate for default
  };

  // Format data for react-force-graph-3d
  // Give initial positions spread out, but let them float freely
  const graphData = {
    nodes: graph.nodes.map((node, index) => {
      const isCenter = node.id === graph.centerId;
      // Start nodes spread out in a circle
      const radius = 50;
      const angle = (index / graph.nodes.length) * 2 * Math.PI;

      return {
        id: node.id,
        label: node.label,
        vizType: node.vizType,
        isCenter,
        // Initial positions (not fixed - nodes can move)
        x: isCenter ? 0 : Math.cos(angle) * radius,
        y: isCenter ? 0 : Math.sin(angle) * radius,
        z: 0,
      };
    }),
    links: graph.links.map(link => ({
      source: link.source,
      target: link.target,
    })),
  };

  // Initialize camera immediately when graph is ready
  useEffect(() => {
    if (fgRef.current && is3DReady) {
      console.log('[Graph] Initializing camera position');
      // Set initial camera very close to nodes
      try {
        fgRef.current.cameraPosition(
          { x: 0, y: 0, z: 80 },      // Very close
          { x: 0, y: 0, z: 0 },       // Look at origin
          0                            // Instant
        );
        
        // Also zoom to fit
        setTimeout(() => {
          if (fgRef.current) {
            fgRef.current.zoomToFit(1000, 50);
          }
        }, 500);
      } catch (e) {
        console.error('[Graph] Error setting initial camera:', e);
      }
      
      // Recenter after physics settle
      const timer = setTimeout(() => {
        console.log('[Graph] Recentering after stabilization');
        recenterCamera();
      }, 2500);
      
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
    <div className={`h-full w-full ${isBlurred ? 'blur-sm opacity-50' : ''}`}>
      <div ref={containerRef} className="h-full w-full bg-slate-950 relative">
        {is3DReady && dimensions.width > 0 && dimensions.height > 0 && (
          <ForceGraph3D
            ref={fgRef}
            graphData={graphData}
            width={dimensions.width}
            height={dimensions.height}
            nodeLabel="label"
            nodeAutoColorBy={undefined}
            nodeVal={(node: any) => node.isCenter ? 15 : 8}
            nodeColor={getNodeColor}
            nodeOpacity={1.0}
            nodeRelSize={6}
            linkColor={() => '#475569'}
            linkWidth={2}
            linkOpacity={0.6}
            linkDirectionalParticles={0}
            // Spread unconnected nodes apart using strong repulsion
            d3Force={(d3ForceInstance: any) => {
              // Link distance for when there ARE links
              d3ForceInstance('link')?.distance(150).strength(1);
              // STRONG repulsion to push unconnected nodes apart
              d3ForceInstance('charge')?.strength(-2000).distanceMin(50);
              // Weak center
              d3ForceInstance('center')?.strength(0.01);
            }}
            onNodeClick={(node: any, event: any) => {
              try {
                console.log('[Graph] Node clicked:', node?.id, 'node object:', node);
                if (node?.id) {
                  onNodeClick(node.id);
                } else {
                  console.error('[Graph] Node click but no node ID!', node);
                }
              } catch (err) {
                console.error('[Graph] Error in onNodeClick handler:', err);
              }
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
            enableNodeDrag={true}
            enableNavigationControls={true}
            warmupTicks={200}
            cooldownTicks={50}
            d3AlphaDecay={0.01}
            d3VelocityDecay={0.2}
            onEngineStop={() => {
              // Recenter camera when physics simulation stops
              console.log('[Graph] Physics engine stopped, recentering camera');
              setTimeout(() => {
                recenterCamera();
              }, 200);
            }}
            controlType="orbit"
          />
        )}
        
        {/* Overlay instructions and controls */}
        <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-lg px-4 py-2">
          <p className="text-xs text-slate-300 mb-2">
            Click a node to learn • Drag to rotate • Scroll to zoom
          </p>
          {/* vizType legend */}
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span className="text-slate-400">3D</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-slate-400">Animation</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="text-slate-400">Diagram</span>
            </span>
          </div>
        </div>
        
        {/* Recenter button */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={recenterCamera}
            className="bg-slate-900/80 hover:bg-slate-800 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 hover:text-white transition-colors"
            title="Recenter view"
          >
            ⊙ Recenter
          </button>
        </div>
      </div>
    </div>
  );
}

