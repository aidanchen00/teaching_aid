'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface GraphNode {
  id: string;
  label: string;
}

interface LessonOverlayProps {
  node: GraphNode;
  onBackToGraph: () => void;
}

export function LessonOverlay({ node, onBackToGraph }: LessonOverlayProps) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center p-8">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl">
        <CardHeader className="border-b">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl font-bold">{node.label}</CardTitle>
              <CardDescription className="mt-2">
                Interactive Micro-Lesson
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
          {/* Lesson Summary Section */}
          <div>
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <span className="text-2xl">📚</span>
              Lesson Overview
            </h3>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-slate-700">
                This micro-lesson will guide you through the fundamentals of <strong>{node.label}</strong>.
                The lesson is structured to build your understanding progressively with examples and practice.
              </p>
            </div>
          </div>

          {/* Key Concepts Section */}
          <div>
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <span className="text-2xl">💡</span>
              Key Concepts
            </h3>
            <div className="space-y-2">
              <div className="border border-slate-200 rounded-lg p-3 bg-white">
                <p className="text-sm font-medium text-slate-900">Concept 1</p>
                <p className="text-sm text-slate-600 mt-1">
                  Introduction to the fundamental principles
                </p>
              </div>
              <div className="border border-slate-200 rounded-lg p-3 bg-white">
                <p className="text-sm font-medium text-slate-900">Concept 2</p>
                <p className="text-sm text-slate-600 mt-1">
                  Advanced applications and techniques
                </p>
              </div>
              <div className="border border-slate-200 rounded-lg p-3 bg-white">
                <p className="text-sm font-medium text-slate-900">Concept 3</p>
                <p className="text-sm text-slate-600 mt-1">
                  Real-world examples and problem-solving
                </p>
              </div>
            </div>
          </div>

          {/* Visualization Placeholder */}
          <div>
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <span className="text-2xl">🎨</span>
              Interactive Visualization
            </h3>
            <div className="border-2 border-dashed border-slate-300 rounded-lg h-64 flex items-center justify-center bg-slate-50">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-slate-500 font-medium">Visualization Coming Soon</p>
                <p className="text-sm text-slate-400 mt-1">
                  Step 5: Dynamic visualization will appear here
                </p>
              </div>
            </div>
          </div>

          {/* Practice Section */}
          <div>
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <span className="text-2xl">✏️</span>
              Practice Problems
            </h3>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <p className="text-sm text-indigo-900">
                <strong>Coming soon:</strong> Interactive practice problems will help reinforce your understanding of {node.label}.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button className="flex-1" disabled>
              Start Lesson
            </Button>
            <Button variant="outline" className="flex-1" onClick={onBackToGraph}>
              Explore More Topics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

