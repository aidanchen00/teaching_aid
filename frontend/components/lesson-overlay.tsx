'use client';

import { useEffect, useState } from 'react';
import { selectLesson, pollVizJob, VizJobResponse } from '@/lib/api';
import { GraphNode, VizType } from '@/lib/types';
import { preloadCache } from '@/lib/preload-cache';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

// Labels and styles for vizType
const VIZ_TYPE_CONFIG: Record<VizType, { label: string; techName: string; color: string }> = {
  three: { label: '3D Visualization', techName: 'Three.js', color: 'bg-indigo-500' },
  video: { label: 'Animated Explanation', techName: 'Manim', color: 'bg-emerald-500' },
  image: { label: 'Educational Diagram', techName: 'Nano Banana Pro', color: 'bg-amber-500' },
};

interface LessonOverlayProps {
  node: GraphNode;
  sessionId: string;
  onBackToGraph: () => void;
}

export function LessonOverlay({ node, sessionId, onBackToGraph }: LessonOverlayProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [vizContentType, setVizContentType] = useState<'svg' | 'video'>('svg');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);
  const [vizStage, setVizStage] = useState<string>('Initializing...');

  const vizType = node.vizType || 'image';
  const config = VIZ_TYPE_CONFIG[vizType];

  // Load visualization
  useEffect(() => {
    setLoading(true);
    setError(null);
    setSvgContent(null);
    setVideoUrl(null);
    setVizContentType('svg');
    setIsCached(false);

    const loadVisualization = async () => {
      try {
        console.log('[LessonOverlay] Selecting lesson for node:', node.id, 'label:', node.label, 'vizType:', vizType);

        // CHECK PRELOAD CACHE FIRST for instant loading
        const cached = preloadCache.get(node.id);
        if (cached && cached.status === 'ready') {
          console.log('[LessonOverlay] ⚡ INSTANT LOAD from preload cache!', cached.contentType);
          setIsCached(true);
          setLoading(false);

          if (cached.contentType === 'video' && cached.videoUrl) {
            setVizContentType('video');
            setVideoUrl(`${BACKEND_URL}${cached.videoUrl}`);
          } else if (cached.svgContent) {
            setVizContentType('svg');
            setSvgContent(cached.svgContent);
          } else {
            setError('No visualization content in cache');
          }
          return;
        }

        // FALLBACK: Normal loading flow if not cached
        console.log('[LessonOverlay] Not in cache, loading normally');

        // Call lesson select endpoint (with fallback to direct endpoint if session not found)
        const response = await selectLesson(sessionId, node.id, node.label, vizType);

        console.log('[LessonOverlay] Lesson selected, vizJobId:', response.vizJobId);

        // Poll for visualization
        const vizResult = await pollVizJob(
          response.vizJobId,
          (stage) => {
            console.log('[LessonOverlay] Viz stage:', stage);
            setVizStage(stage);
          }
        );

        if (vizResult.status === 'done' && vizResult.viz) {
          console.log('[LessonOverlay] Visualization ready, type:', vizResult.viz.type, 'cached:', vizResult.viz.cached);
          setIsCached(vizResult.viz.cached || false);

          if (vizResult.viz.type === 'video' && vizResult.viz.videoUrl) {
            // Video content
            setVizContentType('video');
            setVideoUrl(`${BACKEND_URL}${vizResult.viz.videoUrl}`);
          } else if (vizResult.viz.svgContent) {
            // SVG content
            setVizContentType('svg');
            setSvgContent(vizResult.viz.svgContent);
          } else {
            setError('No visualization content received');
          }
        } else if (vizResult.status === 'error') {
          console.error('[LessonOverlay] Visualization error:', vizResult.message);
          setError(vizResult.message || 'Failed to generate visualization');
        }
      } catch (err: any) {
        console.error('[LessonOverlay] Error loading lesson:', err);
        setError(err.message || 'Failed to load lesson');
      } finally {
        setLoading(false);
      }
    };

    loadVisualization();
  }, [node.id, node.label, vizType, sessionId]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setSvgContent(null);
    setVideoUrl(null);

    const loadVisualization = async () => {
      try {
        const response = await selectLesson(sessionId, node.id, node.label, vizType);
        const vizResult = await pollVizJob(
          response.vizJobId,
          (stage) => setVizStage(stage)
        );

        if (vizResult.status === 'done' && vizResult.viz) {
          setIsCached(vizResult.viz.cached || false);
          if (vizResult.viz.type === 'video' && vizResult.viz.videoUrl) {
            setVizContentType('video');
            setVideoUrl(`${BACKEND_URL}${vizResult.viz.videoUrl}`);
          } else if (vizResult.viz.svgContent) {
            setVizContentType('svg');
            setSvgContent(vizResult.viz.svgContent);
          } else {
            setError('Failed to generate visualization');
          }
        } else {
          setError('Failed to generate visualization');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load lesson');
      } finally {
        setLoading(false);
      }
    };

    loadVisualization();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-slate-950 to-transparent">
        <div>
          <h1 className="text-2xl font-bold text-white">{node.label}</h1>
          <p className="text-slate-400 text-sm flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${config.color} text-white`}>
              {config.techName}
            </span>
            {config.label}
          </p>
        </div>
        <button
          onClick={onBackToGraph}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Graph
        </button>
      </div>

      {/* Visualization */}
      <div className="w-full h-full flex items-center justify-center pt-20">
        {loading && (
          <div className="flex flex-col items-center gap-4">
            <div className={`w-16 h-16 border-4 rounded-full animate-spin ${
              vizType === 'three' ? 'border-indigo-500/30 border-t-indigo-500' :
              vizType === 'video' ? 'border-emerald-500/30 border-t-emerald-500' :
              'border-amber-500/30 border-t-amber-500'
            }`} />
            <p className="text-slate-400">{vizStage}</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-400">{error}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg"
            >
              Retry
            </button>
          </div>
        )}

        {/* SVG Content */}
        {vizContentType === 'svg' && svgContent && !loading && (
          <div
            className="max-w-5xl max-h-[85vh] p-4"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}

        {/* Video Content */}
        {vizContentType === 'video' && videoUrl && !loading && (
          <div className="max-w-5xl max-h-[85vh] p-4">
            <video
              src={videoUrl}
              controls
              autoPlay
              loop
              className="w-full h-auto rounded-lg shadow-2xl"
              style={{ maxHeight: '80vh' }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}
      </div>

      {/* Type indicator */}
      <div className="absolute bottom-4 right-4 px-3 py-2 bg-slate-900/80 backdrop-blur rounded-lg flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${config.color}`} />
          <span className="text-white text-sm font-medium">{config.techName}</span>
        </div>
        <span className="text-slate-500">|</span>
        <span className="text-slate-400 text-xs uppercase tracking-wide">
          {isCached ? 'Pre-loaded' : 'Generated'}
        </span>
      </div>
    </div>
  );
}
