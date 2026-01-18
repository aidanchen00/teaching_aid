"use client";

import { useState } from "react";
import type { AgentExecutionState, AgentStep } from "@/lib/ai/types";
import type { BusinessArtifact, SimpleSlide } from "@/lib/ai/agents/business";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  X,
  FileText,
  Loader2,
  AlertCircle,
  Download,
  Presentation,
  Target,
  TrendingUp,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Briefcase,
} from "lucide-react";

interface BusinessOutputsViewProps {
  isRunning: boolean;
  error: string | null;
  agents: Record<string, AgentExecutionState>;
  steps: AgentStep[];
  artifacts: BusinessArtifact[];
  onClose: () => void;
}

const artifactIcons: Record<string, React.ElementType> = {
  pitch_deck: Presentation,
  business_plan: FileText,
  competitive_analysis: Target,
  go_to_market: TrendingUp,
};

const artifactColors: Record<string, string> = {
  pitch_deck: "#3B82F6",
  business_plan: "#8B5CF6",
  competitive_analysis: "#F59E0B",
  go_to_market: "#10B981",
};

// Simple slide preview component
function SlidePreview({ slide, index, primaryColor }: {
  slide: SimpleSlide;
  index: number;
  primaryColor: string;
}) {
  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden aspect-[16/9] relative">
      {/* Header bar */}
      <div
        className="h-6 w-full flex items-center px-2"
        style={{ backgroundColor: primaryColor }}
      >
        <span className="text-white text-[10px] font-medium truncate">{slide.title}</span>
      </div>

      {/* Slide content */}
      <div className="p-2 h-[calc(100%-1.5rem)] overflow-hidden">
        {slide.subtitle && (
          <p className="text-[9px] text-gray-500 italic mb-1 truncate">{slide.subtitle}</p>
        )}

        {slide.bullets && slide.bullets.length > 0 && (
          <ul className="space-y-0.5 text-[8px] text-gray-600">
            {slide.bullets.slice(0, 4).map((bullet, i) => (
              <li key={i} className="flex items-start gap-1">
                <span style={{ color: primaryColor }}>*</span>
                <span className="line-clamp-1">{bullet}</span>
              </li>
            ))}
            {slide.bullets.length > 4 && (
              <li className="text-gray-400">+{slide.bullets.length - 4} more...</li>
            )}
          </ul>
        )}
      </div>

      {/* Slide number */}
      <div className="absolute bottom-1 right-2 text-[8px] text-gray-400">
        {index + 1}
      </div>
    </div>
  );
}

// Full presentation viewer
function PresentationViewer({ artifact }: { artifact: BusinessArtifact }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const presentation = artifact.data.presentation;
  const primaryColor = artifactColors[artifact.type] || "#3B82F6";

  if (!presentation || !presentation.slides) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p>No presentation data available</p>
          {artifact.data.summary && (
            <p className="text-sm mt-2 text-red-500">{artifact.data.summary}</p>
          )}
        </div>
      </div>
    );
  }

  const slides = presentation.slides;

  const downloadPPTX = () => {
    if (!artifact.data.pptxBase64) {
      alert("PPTX file not available.");
      return;
    }

    const byteCharacters = atob(artifact.data.pptxBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {
      type: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${artifact.title.replace(/\s+/g, "_")}.pptx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="space-y-4">
      {/* Main slide preview - larger view */}
      <div className="bg-gray-100 rounded-lg p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div
            className="h-12 w-full flex items-center px-6"
            style={{ backgroundColor: primaryColor }}
          >
            <span className="text-white font-medium">{currentSlideData.title}</span>
          </div>

          {/* Content */}
          <div className="p-6 min-h-[300px]">
            {currentSlideData.subtitle && (
              <p className="text-gray-500 italic mb-4">{currentSlideData.subtitle}</p>
            )}

            {currentSlideData.bullets && currentSlideData.bullets.length > 0 && (
              <ul className="space-y-3">
                {currentSlideData.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="mt-1 w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <span className="text-gray-700">{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
          disabled={currentSlide === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Slide {currentSlide + 1} of {slides.length}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
          disabled={currentSlide === slides.length - 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Slide thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {slides.map((slide, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`flex-shrink-0 w-32 rounded border-2 transition-colors ${
              currentSlide === i ? "border-blue-500" : "border-transparent hover:border-gray-300"
            }`}
          >
            <SlidePreview slide={slide} index={i} primaryColor={primaryColor} />
          </button>
        ))}
      </div>

      {/* Download buttons */}
      <div className="flex gap-2">
        <Button onClick={downloadPPTX} className="flex-1" disabled={!artifact.data.pptxBase64}>
          <Download className="h-4 w-4 mr-2" />
          Download PowerPoint
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            const json = JSON.stringify(presentation, null, 2);
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${artifact.title.replace(/\s+/g, "_")}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
        >
          Export JSON
        </Button>
      </div>

      {/* Insights */}
      {artifact.data.insights && artifact.data.insights.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold mb-2 text-sm">Insights</h4>
          <ul className="space-y-1">
            {artifact.data.insights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-blue-500">*</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function BusinessOutputsView({
  isRunning,
  error,
  steps,
  artifacts,
  onClose,
}: BusinessOutputsViewProps) {
  const [selectedArtifact, setSelectedArtifact] = useState<string | null>(
    artifacts.length > 0 ? artifacts[0].id : null
  );

  const currentArtifact = artifacts.find((a) => a.id === selectedArtifact);
  const progress = artifacts.length * 25;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <div
            className="h-10 w-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#3B82F620" }}
          >
            <Briefcase className="h-5 w-5" style={{ color: "#3B82F6" }} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Business Strategy</h2>
            <p className="text-sm text-muted-foreground">
              {isRunning
                ? "Generating business presentations..."
                : error
                ? "Error occurred"
                : `${artifacts.length} presentations generated`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isRunning && (
            <Badge variant="secondary" className="gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Processing
            </Badge>
          )}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      {isRunning && (
        <div className="px-6 py-3 border-b bg-gray-50">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Generating presentations</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="px-6 py-4 bg-red-50 border-b border-red-100">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Artifacts List */}
        <div className="w-72 border-r bg-gray-50 overflow-y-auto p-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Presentations
          </h3>
          <div className="space-y-2">
            {artifacts.length === 0 && !isRunning ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No presentations generated yet
              </p>
            ) : (
              artifacts.map((artifact) => {
                const Icon = artifactIcons[artifact.type] || FileText;
                const color = artifactColors[artifact.type] || "#3B82F6";
                return (
                  <button
                    key={artifact.id}
                    onClick={() => setSelectedArtifact(artifact.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedArtifact === artifact.id
                        ? "bg-white shadow-sm border border-gray-200"
                        : "hover:bg-white/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-8 w-8 rounded flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <Icon className="h-4 w-4" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {artifact.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {artifact.data.slideCount || 0} slides
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
            {isRunning && (
              <div className="flex items-center gap-3 p-3 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Generating...</span>
              </div>
            )}
          </div>

          {/* Activity Log */}
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 mt-6">
            Activity
          </h3>
          <div className="space-y-2">
            {steps.slice(-5).map((step) => (
              <div
                key={step.id}
                className="text-xs text-muted-foreground py-1 border-l-2 border-gray-200 pl-3"
              >
                {step.content}
              </div>
            ))}
          </div>
        </div>

        {/* Presentation Preview */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {currentArtifact ? (
            <>
              <div className="border-b px-6 py-3 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = artifactIcons[currentArtifact.type] || FileText;
                    const color = artifactColors[currentArtifact.type] || "#3B82F6";
                    return <Icon className="h-5 w-5" style={{ color }} />;
                  })()}
                  <span className="font-semibold">{currentArtifact.title}</span>
                  <Badge variant="secondary">
                    {currentArtifact.data.slideCount || 0} slides
                  </Badge>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-6 bg-gray-50">
                <PresentationViewer artifact={currentArtifact} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select a presentation to preview</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
