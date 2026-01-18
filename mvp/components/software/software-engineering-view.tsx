"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SoftwarePreview } from "./software-preview";
import { SoftwareCodeEditor } from "./software-code-editor";
import { SoftwareFileExplorer } from "./software-file-explorer";
import type { SandboxState } from "@/lib/e2b";
import type { AgentExecutionState, AgentStep } from "@/lib/ai/types";
import {
  X,
  Code,
  Eye,
  Activity,
  Terminal,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SoftwareEngineeringViewProps {
  // State from useSoftwareExecution
  isRunning: boolean;
  error: string | null;
  agents: Record<string, AgentExecutionState>;
  steps: AgentStep[];
  files: Record<string, string>;
  selectedFile: string | null;
  sandbox: SandboxState;
  refreshKey: number;
  // Actions
  setSelectedFile: (path: string | null) => void;
  updateFile: (path: string, content: string) => void;
  onClose: () => void;
}

export function SoftwareEngineeringView({
  isRunning,
  error,
  agents,
  steps,
  files,
  selectedFile,
  sandbox,
  refreshKey,
  setSelectedFile,
  updateFile,
  onClose,
}: SoftwareEngineeringViewProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "code" | "logs">("preview");

  const agentState = agents["agent_software_engineer"];
  const progress = agentState?.progress || 0;
  const status = agentState?.status || "idle";

  const selectedContent = selectedFile ? files[selectedFile] || "" : "";
  const fileCount = Object.keys(files).length;

  // Filter steps to only show text content (not raw streaming)
  const logSteps = steps.filter(
    (step) =>
      step.type === "thinking" ||
      (step.type === "text_output" && step.content && step.content.length > 50)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Code className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Software Engineering
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                {isRunning ? (
                  <Badge variant="secondary" className="gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Generating
                  </Badge>
                ) : error ? (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Error
                  </Badge>
                ) : fileCount > 0 ? (
                  <Badge variant="default" className="gap-1 bg-green-500">
                    <CheckCircle2 className="h-3 w-3" />
                    Complete
                  </Badge>
                ) : (
                  <Badge variant="outline">Idle</Badge>
                )}
                <span className="text-sm text-muted-foreground">
                  {fileCount} files generated
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isRunning && (
              <div className="flex items-center gap-2 w-32">
                <Progress value={progress} className="h-2" />
                <span className="text-xs text-muted-foreground w-8">
                  {progress}%
                </span>
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as typeof activeTab)}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="border-b px-6">
            <TabsList className="h-12 bg-transparent gap-4">
              <TabsTrigger
                value="preview"
                className={cn(
                  "gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                  "border-b-2 border-transparent data-[state=active]:border-purple-500 rounded-none"
                )}
              >
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger
                value="code"
                className={cn(
                  "gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                  "border-b-2 border-transparent data-[state=active]:border-purple-500 rounded-none"
                )}
              >
                <Code className="h-4 w-4" />
                Code
                {fileCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {fileCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="logs"
                className={cn(
                  "gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                  "border-b-2 border-transparent data-[state=active]:border-purple-500 rounded-none"
                )}
              >
                <Terminal className="h-4 w-4" />
                Logs
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Preview Tab */}
          <TabsContent value="preview" className="flex-1 p-6 mt-0 min-h-0">
            <SoftwarePreview sandbox={sandbox} refreshKey={refreshKey} />
          </TabsContent>

          {/* Code Tab */}
          <TabsContent value="code" className="flex-1 p-6 mt-0 min-h-0">
            <div className="flex gap-4 h-full">
              {/* File Explorer */}
              <div className="w-56 flex-shrink-0">
                <SoftwareFileExplorer
                  files={files}
                  selectedFile={selectedFile}
                  onSelectFile={setSelectedFile}
                />
              </div>

              {/* Code Editor */}
              <div className="flex-1 min-w-0">
                <SoftwareCodeEditor
                  content={selectedContent}
                  fileName={selectedFile}
                  onChange={(content) => {
                    if (selectedFile) {
                      updateFile(selectedFile, content);
                    }
                  }}
                />
              </div>
            </div>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="flex-1 p-6 mt-0 min-h-0">
            <div className="h-full bg-gray-900 rounded-lg border overflow-hidden flex flex-col">
              <div className="px-4 py-2 border-b border-gray-700 bg-gray-800">
                <span className="text-sm font-medium text-gray-300">
                  Generation Logs
                </span>
              </div>
              <ScrollArea className="flex-1 p-4">
                {logSteps.length === 0 ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <Activity className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No logs yet</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 font-mono text-sm">
                    {logSteps.map((step, index) => (
                      <div
                        key={step.id || index}
                        className={cn(
                          "p-2 rounded",
                          step.type === "thinking"
                            ? "bg-blue-900/30 text-blue-300"
                            : "bg-gray-800 text-gray-300"
                        )}
                      >
                        <span className="text-gray-500 text-xs">
                          {new Date(step.timestamp).toLocaleTimeString()}
                        </span>
                        <pre className="whitespace-pre-wrap mt-1">
                          {step.content}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>

        {/* Error Display */}
        {error && (
          <div className="px-6 py-3 bg-red-50 border-t border-red-200">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Error:</span>
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
