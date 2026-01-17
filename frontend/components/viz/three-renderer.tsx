'use client';

/**
 * ThreeRenderer - Template-based Three.js scene renderer for calculus visualizations
 * Renders different scene types based on the spec from backend
 */

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Text, Grid } from '@react-three/drei';
import * as THREE from 'three';

interface ThreeRendererProps {
  spec: {
    sceneType: string;
    params: any;
  };
}

export function ThreeRenderer({ spec }: ThreeRendererProps) {
  const { sceneType, params } = spec;

  return (
    <div className="w-full h-full min-h-[500px] bg-slate-900">
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        {/* Render appropriate scene based on type */}
        {sceneType === 'derivative_graph' && <DerivativeGraph params={params} />}
        {sceneType === 'integral_area' && <IntegralArea params={params} />}
        {sceneType === 'limit_approach' && <LimitApproach params={params} />}
        {sceneType === 'chain_rule_composition' && <ChainRuleComposition params={params} />}
        {sceneType === 'product_rule_split' && <ProductRuleSplit params={params} />}
        {sceneType === 'coordinate_system' && <CoordinateSystem params={params} />}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
        <Grid args={[20, 20]} cellColor="#444" sectionColor="#666" />
      </Canvas>
      
      {/* Legend/Labels */}
      <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-lg px-4 py-3 max-w-md">
        <h3 className="text-sm font-semibold text-white mb-2">{params.fnLabel || 'Function'}</h3>
        {params.derivativeLabel && (
          <p className="text-xs text-slate-300">{params.derivativeLabel}</p>
        )}
        {params.areaLabel && (
          <p className="text-xs text-slate-300">{params.areaLabel}</p>
        )}
        {params.limitLabel && (
          <p className="text-xs text-slate-300">{params.limitLabel}</p>
        )}
      </div>
    </div>
  );
}

// Helper to evaluate simple math expressions safely
function evaluateFunction(fnStr: string, x: number): number {
  try {
    // Replace common math notation
    let expr = fnStr
      .replace(/\^/g, '**')
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/exp/g, 'Math.exp')
      .replace(/abs/g, 'Math.abs')
      .replace(/x/g, `(${x})`);
    
    // Evaluate safely (in production, use a proper math parser)
    return eval(expr);
  } catch {
    return 0;
  }
}

// Generate curve points for a function
function generateCurve(fn: string, range: [number, number], samples: number = 100): THREE.Vector3[] {
  const [min, max] = range;
  const points: THREE.Vector3[] = [];
  
  for (let i = 0; i <= samples; i++) {
    const x = min + (max - min) * (i / samples);
    const y = evaluateFunction(fn, x);
    if (isFinite(y)) {
      points.push(new THREE.Vector3(x, y, 0));
    }
  }
  
  return points;
}

function DerivativeGraph({ params }: { params: any }) {
  const { fn, point, range } = params;
  const curvePoints = generateCurve(fn, range);
  
  // Calculate tangent line
  const slope = evaluateFunction(fn.replace(/x/g, `(${point})`), point + 0.001) - 
                evaluateFunction(fn, point);
  const yAtPoint = evaluateFunction(fn, point);
  
  const tangentPoints = [
    new THREE.Vector3(point - 1, yAtPoint - slope, 0),
    new THREE.Vector3(point + 1, yAtPoint + slope, 0),
  ];

  return (
    <>
      {/* Function curve */}
      <Line points={curvePoints} color="#fbbf24" lineWidth={3} />
      
      {/* Tangent line */}
      <Line points={tangentPoints} color="#10b981" lineWidth={2} />
      
      {/* Point on curve */}
      <mesh position={[point, yAtPoint, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      
      {/* Axes */}
      <Line points={[new THREE.Vector3(range[0], 0, 0), new THREE.Vector3(range[1], 0, 0)]} color="#666" />
      <Line points={[new THREE.Vector3(0, -5, 0), new THREE.Vector3(0, 5, 0)]} color="#666" />
    </>
  );
}

function IntegralArea({ params }: { params: any }) {
  const { fn, a, b, range } = params;
  const curvePoints = generateCurve(fn, range);
  
  // Generate area rectangles (Riemann sum visualization)
  const rectangles: React.ReactElement[] = [];
  const numRects = 20;
  const dx = (b - a) / numRects;
  
  for (let i = 0; i < numRects; i++) {
    const x = a + i * dx;
    const height = evaluateFunction(fn, x);
    if (isFinite(height) && height > 0) {
      rectangles.push(
        <mesh key={i} position={[x + dx / 2, height / 2, -0.1]}>
          <boxGeometry args={[dx, height, 0.1]} />
          <meshStandardMaterial color="#10b981" opacity={0.6} transparent />
        </mesh>
      );
    }
  }

  return (
    <>
      {/* Function curve */}
      <Line points={curvePoints} color="#fbbf24" lineWidth={3} />
      
      {/* Area rectangles */}
      {rectangles}
      
      {/* Axes */}
      <Line points={[new THREE.Vector3(range[0], 0, 0), new THREE.Vector3(range[1], 0, 0)]} color="#666" />
      <Line points={[new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 5, 0)]} color="#666" />
      
      {/* Bounds markers */}
      <Line points={[new THREE.Vector3(a, 0, 0), new THREE.Vector3(a, evaluateFunction(fn, a), 0)]} color="#ef4444" lineWidth={2} />
      <Line points={[new THREE.Vector3(b, 0, 0), new THREE.Vector3(b, evaluateFunction(fn, b), 0)]} color="#ef4444" lineWidth={2} />
    </>
  );
}

function LimitApproach({ params }: { params: any }) {
  const { fn, limitPoint, limitValue, range } = params;
  const curvePoints = generateCurve(fn, range);

  return (
    <>
      {/* Function curve */}
      <Line points={curvePoints} color="#fbbf24" lineWidth={3} />
      
      {/* Limit point (open circle) */}
      <mesh position={[limitPoint, limitValue, 0]}>
        <ringGeometry args={[0.08, 0.12, 32]} />
        <meshStandardMaterial color="#ef4444" side={THREE.DoubleSide} />
      </mesh>
      
      {/* Approaching arrows */}
      <mesh position={[limitPoint - 0.5, limitValue, 0]}>
        <coneGeometry args={[0.1, 0.2, 8]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      <mesh position={[limitPoint + 0.5, limitValue, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.1, 0.2, 8]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      
      {/* Axes */}
      <Line points={[new THREE.Vector3(range[0], 0, 0), new THREE.Vector3(range[1], 0, 0)]} color="#666" />
      <Line points={[new THREE.Vector3(0, -3, 0), new THREE.Vector3(0, 5, 0)]} color="#666" />
    </>
  );
}

function ChainRuleComposition({ params }: { params: any }) {
  const { outer, inner, composed, range } = params;
  
  const innerPoints = generateCurve(inner, range);
  const composedPoints = generateCurve(composed, range);

  return (
    <>
      {/* Inner function */}
      <Line points={innerPoints} color="#3b82f6" lineWidth={2} />
      
      {/* Composed function */}
      <Line points={composedPoints} color="#fbbf24" lineWidth={3} />
      
      {/* Axes */}
      <Line points={[new THREE.Vector3(range[0], 0, 0), new THREE.Vector3(range[1], 0, 0)]} color="#666" />
      <Line points={[new THREE.Vector3(0, -3, 0), new THREE.Vector3(0, 3, 0)]} color="#666" />
    </>
  );
}

function ProductRuleSplit({ params }: { params: any }) {
  const { fn1, fn2, product, range } = params;
  
  const fn1Points = generateCurve(fn1, range);
  const fn2Points = generateCurve(fn2, range);
  const productPoints = generateCurve(product, range);

  return (
    <>
      {/* First function */}
      <Line points={fn1Points} color="#3b82f6" lineWidth={2} />
      
      {/* Second function */}
      <Line points={fn2Points} color="#10b981" lineWidth={2} />
      
      {/* Product */}
      <Line points={productPoints} color="#fbbf24" lineWidth={3} />
      
      {/* Axes */}
      <Line points={[new THREE.Vector3(range[0], 0, 0), new THREE.Vector3(range[1], 0, 0)]} color="#666" />
      <Line points={[new THREE.Vector3(0, -3, 0), new THREE.Vector3(0, 3, 0)]} color="#666" />
    </>
  );
}

function CoordinateSystem({ params }: { params: any }) {
  const { points, showGrid, range } = params;

  return (
    <>
      {/* Axes */}
      <Line points={[new THREE.Vector3(range[0], 0, 0), new THREE.Vector3(range[1], 0, 0)]} color="#ef4444" lineWidth={2} />
      <Line points={[new THREE.Vector3(0, range[0], 0), new THREE.Vector3(0, range[1], 0)]} color="#10b981" lineWidth={2} />
      <Line points={[new THREE.Vector3(0, 0, range[0]), new THREE.Vector3(0, 0, range[1])]} color="#3b82f6" lineWidth={2} />
      
      {/* Points */}
      {points.map((point: any, i: number) => (
        <group key={i} position={[point.x, point.y, point.z]}>
          <mesh>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="#fbbf24" />
          </mesh>
          <Text
            position={[0, 0.3, 0]}
            fontSize={0.2}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {point.label}
          </Text>
        </group>
      ))}
    </>
  );
}

