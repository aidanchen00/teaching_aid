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

        {/* Calculus scenes */}
        {sceneType === 'derivative_graph' && <DerivativeGraph params={params} />}
        {sceneType === 'integral_area' && <IntegralArea params={params} />}
        {sceneType === 'limit_approach' && <LimitApproach params={params} />}
        {sceneType === 'chain_rule_composition' && <ChainRuleComposition params={params} />}
        {sceneType === 'product_rule_split' && <ProductRuleSplit params={params} />}
        {sceneType === 'coordinate_system' && <CoordinateSystem params={params} />}

        {/* Neural Networks scenes */}
        {sceneType === 'neural_network_diagram' && <NeuralNetworkDiagram params={params} />}
        {sceneType === 'activation_function_graph' && <ActivationFunctionGraph params={params} />}
        {sceneType === 'gradient_descent_surface' && <GradientDescentSurface params={params} />}

        {/* Linear Algebra scenes */}
        {sceneType === 'vector_visualization' && <VectorVisualization params={params} />}
        {sceneType === 'matrix_transformation' && <MatrixTransformation params={params} />}
        {sceneType === 'eigenspace_visualization' && <EigenspaceVisualization params={params} />}

        {/* Physics scenes */}
        {sceneType === 'projectile_motion' && <ProjectileMotion params={params} />}
        {sceneType === 'force_diagram' && <ForceDiagram params={params} />}
        {sceneType === 'wave_visualization' && <WaveVisualization params={params} />}
        {sceneType === 'pendulum_motion' && <PendulumMotion params={params} />}

        {/* Statistics scenes */}
        {sceneType === 'distribution_curve' && <DistributionCurve params={params} />}
        {sceneType === 'scatter_plot' && <ScatterPlot params={params} />}
        {sceneType === 'probability_tree' && <ProbabilityTree params={params} />}

        {/* Discrete Math scenes */}
        {sceneType === 'graph_visualization' && <GraphVisualization params={params} />}
        {sceneType === 'tree_visualization' && <TreeVisualization params={params} />}
        {sceneType === 'set_diagram' && <SetDiagram params={params} />}

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
        {params.description && (
          <p className="text-xs text-slate-300">{params.description}</p>
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

// =============================================================================
// NEURAL NETWORKS SCENES
// =============================================================================

function NeuralNetworkDiagram({ params }: { params: any }) {
  const { layers } = params;
  const layerSpacing = 2;

  return (
    <>
      {layers.map((neuronCount: number, layerIdx: number) => {
        const neurons = [];
        const yOffset = (neuronCount - 1) / 2;

        for (let i = 0; i < neuronCount; i++) {
          const x = (layerIdx - (layers.length - 1) / 2) * layerSpacing;
          const y = (i - yOffset) * 0.8;

          // Draw neuron
          neurons.push(
            <mesh key={`n-${layerIdx}-${i}`} position={[x, y, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial color={layerIdx === 0 ? '#3b82f6' : layerIdx === layers.length - 1 ? '#ef4444' : '#10b981'} />
            </mesh>
          );

          // Draw connections to next layer
          if (layerIdx < layers.length - 1) {
            const nextCount = layers[layerIdx + 1];
            const nextYOffset = (nextCount - 1) / 2;
            for (let j = 0; j < nextCount; j++) {
              const nextX = (layerIdx + 1 - (layers.length - 1) / 2) * layerSpacing;
              const nextY = (j - nextYOffset) * 0.8;
              neurons.push(
                <Line
                  key={`c-${layerIdx}-${i}-${j}`}
                  points={[new THREE.Vector3(x + 0.2, y, 0), new THREE.Vector3(nextX - 0.2, nextY, 0)]}
                  color="#4b5563"
                  lineWidth={0.5}
                />
              );
            }
          }
        }
        return neurons;
      })}

      {/* Axes */}
      <Line points={[new THREE.Vector3(-5, 0, 0), new THREE.Vector3(5, 0, 0)]} color="#666" />
    </>
  );
}

function ActivationFunctionGraph({ params }: { params: any }) {
  const { range } = params;
  const [min, max] = range;

  // Generate ReLU curve
  const reluPoints: THREE.Vector3[] = [];
  for (let i = 0; i <= 100; i++) {
    const x = min + (max - min) * (i / 100);
    const y = Math.max(0, x);
    reluPoints.push(new THREE.Vector3(x, y, 0));
  }

  return (
    <>
      <Line points={reluPoints} color="#fbbf24" lineWidth={3} />

      {/* Axes */}
      <Line points={[new THREE.Vector3(min, 0, 0), new THREE.Vector3(max, 0, 0)]} color="#666" />
      <Line points={[new THREE.Vector3(0, min, 0), new THREE.Vector3(0, max, 0)]} color="#666" />

      {/* Origin point */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
    </>
  );
}

function GradientDescentSurface({ params }: { params: any }) {
  const { range, startPoint } = params;
  const [min, max] = [range[0], range[1]];

  // Generate path points for gradient descent
  const pathPoints: THREE.Vector3[] = [];
  let x = startPoint.x;
  let y = startPoint.y;
  const lr = 0.2;

  for (let i = 0; i < 15; i++) {
    const z = x * x + y * y;
    pathPoints.push(new THREE.Vector3(x, z, y));
    // Gradient of x^2 + y^2
    x -= lr * 2 * x;
    y -= lr * 2 * y;
  }

  return (
    <>
      {/* Descent path */}
      <Line points={pathPoints} color="#ef4444" lineWidth={3} />

      {/* Start point */}
      <mesh position={[startPoint.x, startPoint.x ** 2 + startPoint.y ** 2, startPoint.y]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>

      {/* End point (minimum) */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#10b981" />
      </mesh>

      {/* Axes */}
      <Line points={[new THREE.Vector3(min, 0, 0), new THREE.Vector3(max, 0, 0)]} color="#666" />
      <Line points={[new THREE.Vector3(0, 0, min), new THREE.Vector3(0, 0, max)]} color="#666" />
      <Line points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 5, 0)]} color="#666" />
    </>
  );
}

// =============================================================================
// LINEAR ALGEBRA SCENES
// =============================================================================

function VectorVisualization({ params }: { params: any }) {
  const { vectors } = params;

  return (
    <>
      {vectors.map((vec: any, i: number) => (
        <group key={i}>
          <Line
            points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(vec.x, vec.y, vec.z)]}
            color={vec.color}
            lineWidth={3}
          />
          <mesh position={[vec.x, vec.y, vec.z]}>
            <coneGeometry args={[0.1, 0.3, 8]} />
            <meshStandardMaterial color={vec.color} />
          </mesh>
          <Text
            position={[vec.x + 0.3, vec.y + 0.3, vec.z]}
            fontSize={0.3}
            color="white"
          >
            {vec.label}
          </Text>
        </group>
      ))}

      {/* Axes */}
      <Line points={[new THREE.Vector3(-4, 0, 0), new THREE.Vector3(4, 0, 0)]} color="#666" />
      <Line points={[new THREE.Vector3(0, -4, 0), new THREE.Vector3(0, 4, 0)]} color="#666" />
      <Line points={[new THREE.Vector3(0, 0, -4), new THREE.Vector3(0, 0, 4)]} color="#666" />
    </>
  );
}

function MatrixTransformation({ params }: { params: any }) {
  // Show a grid being transformed
  const gridLines = [];
  const range = 3;

  for (let i = -range; i <= range; i++) {
    // Vertical lines
    gridLines.push(
      <Line
        key={`v-${i}`}
        points={[new THREE.Vector3(i, -range, 0), new THREE.Vector3(i, range, 0)]}
        color="#3b82f6"
        lineWidth={1}
      />
    );
    // Horizontal lines
    gridLines.push(
      <Line
        key={`h-${i}`}
        points={[new THREE.Vector3(-range, i, 0), new THREE.Vector3(range, i, 0)]}
        color="#3b82f6"
        lineWidth={1}
      />
    );
  }

  return (
    <>
      {gridLines}

      {/* Basis vectors */}
      <Line points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0)]} color="#ef4444" lineWidth={4} />
      <Line points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0)]} color="#10b981" lineWidth={4} />

      {/* Labels */}
      <Text position={[1.3, 0, 0]} fontSize={0.3} color="#ef4444">i</Text>
      <Text position={[0, 1.3, 0]} fontSize={0.3} color="#10b981">j</Text>
    </>
  );
}

function EigenspaceVisualization({ params }: { params: any }) {
  const { eigenvectors } = params;

  return (
    <>
      {eigenvectors.map((ev: any, i: number) => {
        const len = 2;
        const endX = ev.x * len;
        const endY = ev.y * len;

        return (
          <group key={i}>
            {/* Eigenvector */}
            <Line
              points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(endX, endY, 0)]}
              color={i === 0 ? '#3b82f6' : '#ef4444'}
              lineWidth={3}
            />
            {/* Scaled eigenvector */}
            <Line
              points={[new THREE.Vector3(0, 0, 0.5), new THREE.Vector3(endX * ev.lambda / 2, endY * ev.lambda / 2, 0.5)]}
              color={i === 0 ? '#3b82f6' : '#ef4444'}
              lineWidth={2}
              dashed
            />
            <Text
              position={[endX + 0.3, endY + 0.3, 0]}
              fontSize={0.25}
              color="white"
            >
              {`λ=${ev.lambda}`}
            </Text>
          </group>
        );
      })}

      {/* Axes */}
      <Line points={[new THREE.Vector3(-4, 0, 0), new THREE.Vector3(4, 0, 0)]} color="#666" />
      <Line points={[new THREE.Vector3(0, -4, 0), new THREE.Vector3(0, 4, 0)]} color="#666" />
    </>
  );
}

// =============================================================================
// PHYSICS SCENES
// =============================================================================

function ProjectileMotion({ params }: { params: any }) {
  const { initialVelocity, gravity } = params;
  const vx = initialVelocity.x;
  const vy = initialVelocity.y;
  const g = gravity;

  // Generate trajectory
  const points: THREE.Vector3[] = [];
  const tMax = (2 * vy) / g;

  for (let i = 0; i <= 50; i++) {
    const t = (i / 50) * tMax;
    const x = vx * t;
    const y = vy * t - 0.5 * g * t * t;
    if (y >= 0) {
      points.push(new THREE.Vector3(x / 5, y / 5, 0));
    }
  }

  return (
    <>
      {/* Trajectory */}
      <Line points={points} color="#fbbf24" lineWidth={3} />

      {/* Start point */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>

      {/* Initial velocity vector */}
      <Line
        points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(vx / 10, vy / 10, 0)]}
        color="#ef4444"
        lineWidth={2}
      />

      {/* Ground */}
      <Line points={[new THREE.Vector3(-1, 0, 0), new THREE.Vector3(8, 0, 0)]} color="#666" lineWidth={2} />
    </>
  );
}

function ForceDiagram({ params }: { params: any }) {
  const { forces } = params;

  return (
    <>
      {/* Central object */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>

      {/* Force vectors */}
      {forces.map((f: any, i: number) => (
        <group key={i}>
          <Line
            points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(f.x / 2, f.y / 2, 0)]}
            color={f.color}
            lineWidth={3}
          />
          <mesh position={[f.x / 2, f.y / 2, 0]}>
            <coneGeometry args={[0.1, 0.25, 8]} />
            <meshStandardMaterial color={f.color} />
          </mesh>
          <Text
            position={[f.x / 2 + 0.3, f.y / 2 + 0.3, 0]}
            fontSize={0.25}
            color="white"
          >
            {f.label}
          </Text>
        </group>
      ))}
    </>
  );
}

function WaveVisualization({ params }: { params: any }) {
  const { amplitude, wavelength, range } = params;
  const [min, max] = range;

  // Generate wave points
  const points: THREE.Vector3[] = [];
  const k = (2 * Math.PI) / wavelength;

  for (let i = 0; i <= 100; i++) {
    const x = min + (max - min) * (i / 100);
    const y = amplitude * Math.sin(k * x);
    points.push(new THREE.Vector3(x, y, 0));
  }

  return (
    <>
      <Line points={points} color="#3b82f6" lineWidth={3} />

      {/* Axes */}
      <Line points={[new THREE.Vector3(min, 0, 0), new THREE.Vector3(max, 0, 0)]} color="#666" />
      <Line points={[new THREE.Vector3(0, -amplitude - 0.5, 0), new THREE.Vector3(0, amplitude + 0.5, 0)]} color="#666" />

      {/* Amplitude marker */}
      <Line points={[new THREE.Vector3(wavelength / 4, 0, 0), new THREE.Vector3(wavelength / 4, amplitude, 0)]} color="#ef4444" lineWidth={2} />
    </>
  );
}

function PendulumMotion({ params }: { params: any }) {
  const { length, initialAngle } = params;
  const angle = (initialAngle * Math.PI) / 180;

  const bobX = length * Math.sin(angle);
  const bobY = -length * Math.cos(angle);

  return (
    <>
      {/* Pivot */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#666" />
      </mesh>

      {/* Rod */}
      <Line
        points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(bobX, bobY, 0)]}
        color="#fbbf24"
        lineWidth={2}
      />

      {/* Bob */}
      <mesh position={[bobX, bobY, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>

      {/* Arc showing swing */}
      <Line
        points={[
          new THREE.Vector3(0, -length, 0),
          new THREE.Vector3(length * Math.sin(angle / 2), -length * Math.cos(angle / 2), 0),
          new THREE.Vector3(bobX, bobY, 0),
        ]}
        color="#10b981"
        lineWidth={1}
      />
    </>
  );
}

// =============================================================================
// STATISTICS SCENES
// =============================================================================

function DistributionCurve({ params }: { params: any }) {
  const { mean, stdDev, range } = params;
  const [min, max] = range;

  // Generate normal distribution curve
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= 100; i++) {
    const x = min + (max - min) * (i / 100);
    const exponent = -0.5 * Math.pow((x - mean) / stdDev, 2);
    const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
    points.push(new THREE.Vector3(x, y * 5, 0)); // Scale y for visibility
  }

  return (
    <>
      <Line points={points} color="#3b82f6" lineWidth={3} />

      {/* Mean line */}
      <Line
        points={[new THREE.Vector3(mean, 0, 0), new THREE.Vector3(mean, 2.5, 0)]}
        color="#ef4444"
        lineWidth={2}
      />
      <Text position={[mean, 2.7, 0]} fontSize={0.2} color="#ef4444">μ</Text>

      {/* Axes */}
      <Line points={[new THREE.Vector3(min, 0, 0), new THREE.Vector3(max, 0, 0)]} color="#666" />
      <Line points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 3, 0)]} color="#666" />
    </>
  );
}

function ScatterPlot({ params }: { params: any }) {
  const { points, regressionLine } = params;

  // Regression line points
  const linePoints = [
    new THREE.Vector3(0, regressionLine.intercept, 0),
    new THREE.Vector3(7, regressionLine.slope * 7 + regressionLine.intercept, 0),
  ];

  return (
    <>
      {/* Data points */}
      {points.map((p: any, i: number) => (
        <mesh key={i} position={[p.x, p.y, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
      ))}

      {/* Regression line */}
      <Line points={linePoints} color="#ef4444" lineWidth={2} />

      {/* Axes */}
      <Line points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(7, 0, 0)]} color="#666" />
      <Line points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 15, 0)]} color="#666" />
    </>
  );
}

function ProbabilityTree({ params }: { params: any }) {
  const { nodes } = params;

  // Simple probability tree layout
  return (
    <>
      {/* Root */}
      <mesh position={[0, 2, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>

      {/* First level branches */}
      <Line points={[new THREE.Vector3(0, 2, 0), new THREE.Vector3(-2, 0, 0)]} color="#3b82f6" lineWidth={2} />
      <Line points={[new THREE.Vector3(0, 2, 0), new THREE.Vector3(2, 0, 0)]} color="#ef4444" lineWidth={2} />

      {/* First level nodes */}
      <mesh position={[-2, 0, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      <mesh position={[2, 0, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>

      {/* Labels */}
      <Text position={[-1.2, 1.2, 0]} fontSize={0.2} color="#3b82f6">P(A)</Text>
      <Text position={[1.2, 1.2, 0]} fontSize={0.2} color="#ef4444">P(A')</Text>
    </>
  );
}

// =============================================================================
// DISCRETE MATH SCENES
// =============================================================================

function GraphVisualization({ params }: { params: any }) {
  const { nodes, edges } = params;

  const nodePositions: Record<string, THREE.Vector3> = {};
  nodes.forEach((n: any) => {
    nodePositions[n.id] = new THREE.Vector3(n.x, n.y, 0);
  });

  return (
    <>
      {/* Edges */}
      {edges.map((e: any, i: number) => (
        <Line
          key={i}
          points={[nodePositions[e.source], nodePositions[e.target]]}
          color="#4b5563"
          lineWidth={2}
        />
      ))}

      {/* Nodes */}
      {nodes.map((n: any) => (
        <group key={n.id}>
          <mesh position={[n.x, n.y, 0]}>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial color="#3b82f6" />
          </mesh>
          <Text
            position={[n.x, n.y + 0.5, 0]}
            fontSize={0.25}
            color="white"
          >
            {n.id}
          </Text>
        </group>
      ))}
    </>
  );
}

function TreeVisualization({ params }: { params: any }) {
  const { root, nodes } = params;

  // Simple binary tree layout
  const levels: Record<string, { x: number; y: number }> = {
    [root.id]: { x: 0, y: 2 },
  };

  nodes.forEach((n: any, i: number) => {
    const parentPos = levels[n.parent] || { x: 0, y: 2 };
    const offset = i % 2 === 0 ? -1 : 1;
    levels[n.id] = {
      x: parentPos.x + offset * (2 - Math.floor(i / 2) * 0.5),
      y: parentPos.y - 1.5,
    };
  });

  return (
    <>
      {/* Edges */}
      {nodes.map((n: any) => {
        const parentPos = levels[n.parent];
        const nodePos = levels[n.id];
        if (parentPos && nodePos) {
          return (
            <Line
              key={n.id}
              points={[
                new THREE.Vector3(parentPos.x, parentPos.y, 0),
                new THREE.Vector3(nodePos.x, nodePos.y, 0),
              ]}
              color="#4b5563"
              lineWidth={2}
            />
          );
        }
        return null;
      })}

      {/* Root */}
      <mesh position={[levels[root.id].x, levels[root.id].y, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <Text position={[levels[root.id].x, levels[root.id].y + 0.5, 0]} fontSize={0.25} color="white">
        {root.value}
      </Text>

      {/* Nodes */}
      {nodes.map((n: any) => {
        const pos = levels[n.id];
        if (!pos) return null;
        return (
          <group key={n.id}>
            <mesh position={[pos.x, pos.y, 0]}>
              <sphereGeometry args={[0.25, 16, 16]} />
              <meshStandardMaterial color="#3b82f6" />
            </mesh>
            <Text position={[pos.x, pos.y + 0.4, 0]} fontSize={0.2} color="white">
              {n.value}
            </Text>
          </group>
        );
      })}
    </>
  );
}

function SetDiagram({ params }: { params: any }) {
  const { sets } = params;

  return (
    <>
      {/* Set A circle */}
      <mesh position={[-0.8, 0, 0]}>
        <ringGeometry args={[1.3, 1.5, 32]} />
        <meshStandardMaterial color="#3b82f6" side={THREE.DoubleSide} transparent opacity={0.3} />
      </mesh>
      <Text position={[-1.5, 1.8, 0]} fontSize={0.4} color="#3b82f6">A</Text>

      {/* Set B circle */}
      <mesh position={[0.8, 0, 0]}>
        <ringGeometry args={[1.3, 1.5, 32]} />
        <meshStandardMaterial color="#ef4444" side={THREE.DoubleSide} transparent opacity={0.3} />
      </mesh>
      <Text position={[1.5, 1.8, 0]} fontSize={0.4} color="#ef4444">B</Text>

      {/* Intersection highlight */}
      <mesh position={[0, 0, -0.1]}>
        <circleGeometry args={[0.5, 32]} />
        <meshStandardMaterial color="#10b981" transparent opacity={0.5} />
      </mesh>
      <Text position={[0, -0.3, 0]} fontSize={0.2} color="#10b981">A ∩ B</Text>
    </>
  );
}

