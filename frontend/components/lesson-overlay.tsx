'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { selectLesson, pollVizJob, VizJobResponse } from '@/lib/api';
import { VizProgress } from './viz/viz-progress';
import { ThreeRenderer } from './viz/three-renderer';

interface GraphNode {
  id: string;
  label: string;
}

interface LessonOverlayProps {
  node: GraphNode;
  sessionId: string;
  onBackToGraph: () => void;
}

type VizState = 'loading' | 'ready' | 'error';

export function LessonOverlay({ node, sessionId, onBackToGraph }: LessonOverlayProps) {
  const [lessonData, setLessonData] = useState<{
    title: string;
    summary: string;
    lessonId: string;
  } | null>(null);
  const [vizState, setVizState] = useState<VizState>('loading');
  const [vizData, setVizData] = useState<VizJobResponse['viz'] | null>(null);
  const [vizStage, setVizStage] = useState<string>('Initializing...');
  const [vizError, setVizError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Load lesson and start visualization generation
  useEffect(() => {
    const loadLesson = async () => {
      try {
        console.log('[LessonOverlay] Selecting lesson for node:', node.id);
        
        // Call lesson select endpoint
        const response = await selectLesson(sessionId, node.id);
        
        setLessonData({
          title: response.title,
          summary: response.summary,
          lessonId: response.lessonId,
        });

        console.log('[LessonOverlay] Lesson selected, vizJobId:', response.vizJobId);
        
        // Start polling for visualization
        setVizState('loading');
        
        const vizResult = await pollVizJob(
          response.vizJobId,
          (stage) => {
            console.log('[LessonOverlay] Viz stage:', stage);
            setVizStage(stage);
          }
        );

        if (vizResult.status === 'done' && vizResult.viz) {
          console.log('[LessonOverlay] Visualization ready:', vizResult.viz.type);
          setVizData(vizResult.viz);
          setVizState('ready');
        } else if (vizResult.status === 'error') {
          console.error('[LessonOverlay] Visualization error:', vizResult.message);
          setVizError(vizResult.message || 'Failed to generate visualization');
          setVizState('error');
        }
      } catch (error: any) {
        console.error('[LessonOverlay] Error loading lesson:', error);
        setVizError(error.message || 'Failed to load lesson');
        setVizState('error');
      }
    };

    loadLesson();
  }, [node.id, sessionId, retryCount]);

  const handleRetry = () => {
    if (retryCount < 1) {
      setRetryCount(retryCount + 1);
      setVizState('loading');
      setVizError(null);
    }
  };

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center p-8">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <CardHeader className="border-b">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl font-bold">
                {lessonData?.title || node.label}
              </CardTitle>
              <CardDescription className="mt-2">
                {lessonData?.summary || 'Loading lesson...'}
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={onBackToGraph}
              className="ml-4"
            >
              Back to Graph
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          {/* Visualization Section */}
          <div>
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <span className="text-2xl">🎨</span>
              Interactive Visualization
            </h3>
            
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
              {vizState === 'loading' && (
                <VizProgress stage={vizStage} />
              )}
              
              {vizState === 'ready' && vizData && (
                <>
                  {vizData.type === 'three_spec' && vizData.spec && (
                    <ThreeRenderer spec={vizData.spec} />
                  )}
                  
                  {vizData.type === 'manim_mp4' && vizData.url && (
                    <div className="w-full h-[500px] bg-black flex items-center justify-center">
                      <video
                        src={`${BACKEND_URL}${vizData.url}`}
                        controls
                        autoPlay
                        loop
                        className="max-w-full max-h-full"
                      >
                        Your browser does not support video playback.
                      </video>
                    </div>
                  )}
                  
                  {vizData.type === 'image' && vizData.url && (
                    <div className="w-full h-[500px] flex items-center justify-center bg-slate-100">
                      <img
                        src={`${BACKEND_URL}${vizData.url}`}
                        alt={lessonData?.title || 'Visualization'}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  )}
                </>
              )}
              
              {vizState === 'error' && (
                <div className="h-[400px] flex flex-col items-center justify-center p-8">
                  <div className="text-6xl mb-4">⚠️</div>
                  <p className="text-lg font-semibold text-slate-700 mb-2">
                    Visualization Generation Failed
                  </p>
                  <p className="text-sm text-slate-500 mb-4 text-center max-w-md">
                    {vizError}
                  </p>
                  {retryCount < 1 && (
                    <Button onClick={handleRetry} variant="outline">
                      Retry Generation
                    </Button>
                  )}
                  {retryCount >= 1 && (
                    <p className="text-xs text-slate-400">
                      Maximum retry attempts reached
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Key Concepts Section */}
          {lessonData && (
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                About This Topic
              </h3>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-slate-700">
                  {lessonData.summary}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" className="flex-1" onClick={onBackToGraph}>
              Explore More Topics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
