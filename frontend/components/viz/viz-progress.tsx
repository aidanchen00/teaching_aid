'use client';

/**
 * VizProgress - Loading progress UI for visualization generation
 * Shows spinner and current stage label
 */

interface VizProgressProps {
  stage?: string;
}

export function VizProgress({ stage = 'Initializing...' }: VizProgressProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-slate-50">
      {/* Spinner */}
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
      </div>

      {/* Stage label */}
      <p className="text-lg font-medium text-slate-700 mb-2">Generating Visualization</p>
      <p className="text-sm text-slate-500">{stage}</p>

      {/* Progress dots */}
      <div className="flex gap-2 mt-6">
        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse delay-100"></div>
        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse delay-200"></div>
      </div>
    </div>
  );
}

