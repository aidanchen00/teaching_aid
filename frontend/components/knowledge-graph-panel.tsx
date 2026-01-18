'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { GraphData, VizType } from '@/lib/types';
import * as THREE from 'three';

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
        console.log('[Graph] Recentering camera and fitting to view');
        // Zoom to fit all nodes with some padding
        fgRef.current.zoomToFit(1000, 80);
      } catch (e) {
        console.error('Error recentering camera:', e);
      }
    }
  };

  const zoomIn = () => {
    if (fgRef.current) {
      const camera = fgRef.current.camera();
      const currentZ = camera.position.z;
      fgRef.current.cameraPosition(
        { x: camera.position.x, y: camera.position.y, z: currentZ * 0.7 },
        { x: 0, y: 0, z: 0 },
        300
      );
    }
  };

  const zoomOut = () => {
    if (fgRef.current) {
      const camera = fgRef.current.camera();
      const currentZ = camera.position.z;
      fgRef.current.cameraPosition(
        { x: camera.position.x, y: camera.position.y, z: currentZ * 1.3 },
        { x: 0, y: 0, z: 0 },
        300
      );
    }
  };

  // Get node color based on vizType or center status
  const getNodeColor = useCallback((node: any): string => {
    if (node.isCenter) {
      return '#6366f1'; // indigo for center
    }
    if (node.vizType && VIZ_TYPE_COLORS[node.vizType as VizType]) {
      return VIZ_TYPE_COLORS[node.vizType as VizType];
    }
    return '#64748b'; // slate for default
  }, []);

  // Create custom node with label - memoized to prevent recreation
  const createNodeWithLabel = useCallback((node: any) => {
    const group = new THREE.Group();
    const color = getNodeColor(node);

    // Create sphere for the node
    const sphereGeometry = new THREE.SphereGeometry(node.isCenter ? 10 : 6, 32, 32);
    const sphereMaterial = new THREE.MeshLambertMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.3,
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    group.add(sphere);

    // Create text sprite for the label
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      // Adjust canvas size based on text length
      const fontSize = node.isCenter ? 64 : 48;
      canvas.width = Math.max(256, node.label.length * fontSize * 0.6);
      canvas.height = fontSize * 1.5;

      // Draw text
      context.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
      context.fillStyle = 'white';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(node.label, canvas.width / 2, canvas.height / 2);

      // Create sprite from canvas
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 1.0,
      });
      const sprite = new THREE.Sprite(spriteMaterial);

      // Scale sprite and position it above the node
      const scale = node.isCenter ? 30 : 20;
      sprite.scale.set(scale, scale * (canvas.height / canvas.width), 1);
      sprite.position.set(0, node.isCenter ? 15 : 10, 0);
      group.add(sprite);
    }

    return group;
  }, [getNodeColor]);

  // Memoize graph data to prevent unnecessary re-renders and flickering
  const graphData = useMemo(() => ({
    nodes: graph.nodes.map((node, index) => {
      const isCenter = node.id === graph.centerId;
      const radius = 50;
      const angle = (index / graph.nodes.length) * 2 * Math.PI;

      return {
        id: node.id,
        label: node.label,
        vizType: node.vizType,
        isCenter,
        // Only set initial positions for new nodes, let physics handle the rest
        x: isCenter ? 0 : Math.cos(angle) * radius,
        y: isCenter ? 0 : Math.sin(angle) * radius,
        z: 0,
      };
    }),
    links: graph.links.map(link => ({
      source: link.source,
      target: link.target,
    })),
  }), [graph.nodes, graph.links, graph.centerId]);

  // Track if we've done initial camera setup
  const hasInitializedCamera = useRef(false);
  const prevNodeCount = useRef(graph.nodes.length);

  // Initialize camera once when 3D is ready
  useEffect(() => {
    if (fgRef.current && is3DReady && !hasInitializedCamera.current) {
      hasInitializedCamera.current = true;
      console.log('[Graph] Initializing camera position');

      // Set initial camera position
      try {
        fgRef.current.cameraPosition(
          { x: 0, y: 0, z: 150 },
          { x: 0, y: 0, z: 0 },
          0
        );
      } catch (e) {
        console.error('[Graph] Error setting initial camera:', e);
      }

      // Single recenter after physics settle
      const timer = setTimeout(() => {
        if (fgRef.current) {
          fgRef.current.zoomToFit(800, 60);
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [is3DReady]);

  // Only recenter when NEW nodes are added (not on every render)
  useEffect(() => {
    if (fgRef.current && is3DReady && graph.nodes.length > prevNodeCount.current) {
      prevNodeCount.current = graph.nodes.length;

      // Delay to let physics settle first
      const timer = setTimeout(() => {
        if (fgRef.current) {
          fgRef.current.zoomToFit(800, 60);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
    prevNodeCount.current = graph.nodes.length;
  }, [graph.nodes.length, is3DReady]);

  useEffect(() => {
    console.log('[Graph] Component mounted');
    setIs3DReady(true);
  }, []);

  return (
    <div className={`h-full w-full ${isBlurred ? 'blur-sm opacity-50' : ''}`}>
      <div ref={containerRef} className="h-full w-full bg-slate-950 relative">
        {is3DReady && dimensions.width > 0 && dimensions.height > 0 && (
          <ForceGraph3D
            key={graphKey}
            ref={fgRef}
            graphData={graphData}
            width={dimensions.width}
            height={dimensions.height}
            nodeThreeObject={createNodeWithLabel}
            nodeThreeObjectExtend={false}
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
                  // Auto-recenter after click to show expanded graph
                  setTimeout(() => {
                    recenterCamera();
                  }, 500);
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
            Click a node to learn • Drag to rotate • Use zoom buttons or scroll
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
        
        {/* Camera controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <button
            onClick={recenterCamera}
            className="bg-slate-900/80 hover:bg-slate-800 backdrop-blur-sm border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors flex items-center gap-2"
            title="Recenter and fit to view"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            Fit View
          </button>

          <div className="flex gap-2">
            <button
              onClick={zoomIn}
              className="flex-1 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors"
              title="Zoom in"
            >
              <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </button>

            <button
              onClick={zoomOut}
              className="flex-1 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors"
              title="Zoom out"
            >
              <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

