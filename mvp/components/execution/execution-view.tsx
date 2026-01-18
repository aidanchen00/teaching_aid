"use client";

import { useState } from "react";
import { Plan, ExecutionOutput, WorkflowNode as WorkflowNodeType } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WorkflowGraph } from "@/components/workflow/workflow-graph";
import { DepartmentDrillDown } from "@/components/workflow/department-drill-down";
import { SoftwareEngineeringView } from "@/components/software";
import { FinanceChartModal } from "@/components/finance/finance-chart-modal";
import { BusinessOutputsView } from "@/components/business";
import { FinalDashboard } from "@/components/dashboard";
import type { AgentExecutionState, AgentStep, ToolCallEvent } from "@/lib/ai/types";
import type { SandboxState } from "@/lib/e2b";
import type { FinanceArtifact } from "@/lib/ai/agents/finance";
import type { BusinessArtifact } from "@/lib/ai/agents/business";
import { OutputPreviewModal } from "./output-preview-modal";
import { departmentAgentWorkflowsExecution } from "@/lib/agent-workflows";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Pause,
  Play,
  Square,
  Download,
  FileText,
  Code,
  Link as LinkIcon,
  ExternalLink,
  Eye,
  Activity,
  X,
  Palette,
  Monitor,
  DollarSign,
  TrendingUp,
  PieChart,
  BarChart3,
  Presentation,
  Briefcase,
  Target,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ToolCallWithAgent extends ToolCallEvent {
  agentId: string;
}

interface MarketingAgentState {
  agents: Record<string, AgentExecutionState>;
  steps: AgentStep[];
  toolCalls: ToolCallWithAgent[];
  isRunning: boolean;
}

interface SoftwareAgentState {
  isRunning: boolean;
  error: string | null;
  agents: Record<string, AgentExecutionState>;
  steps: AgentStep[];
  files: Record<string, string>;
  selectedFile: string | null;
  sandbox: SandboxState;
  refreshKey: number;
  setSelectedFile: (path: string | null) => void;
  updateFile: (path: string, content: string) => void;
}

interface FinanceAgentState {
  isRunning: boolean;
  error: string | null;
  agents: Record<string, AgentExecutionState>;
  steps: AgentStep[];
  artifacts: FinanceArtifact[];
}

interface BusinessAgentState {
  isRunning: boolean;
  error: string | null;
  agents: Record<string, AgentExecutionState>;
  steps: AgentStep[];
  artifacts: BusinessArtifact[];
}

interface ExecutionViewProps {
  plan: Plan;
  outputs: ExecutionOutput[];
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  isPaused: boolean;
  marketingAgentState?: MarketingAgentState;
  softwareAgentState?: SoftwareAgentState;
  financeAgentState?: FinanceAgentState;
  businessAgentState?: BusinessAgentState;
}

interface OpenDepartment {
  id: string;
  node: WorkflowNodeType;
}

export function ExecutionView({
  plan,
  outputs,
  onPause,
  onResume,
  onStop,
  isPaused,
  marketingAgentState,
  softwareAgentState,
  financeAgentState,
  businessAgentState
}: ExecutionViewProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [openDepartments, setOpenDepartments] = useState<OpenDepartment[]>([]);
  const [activeDepartmentId, setActiveDepartmentId] = useState<string | null>(null);
  const [previewOutput, setPreviewOutput] = useState<ExecutionOutput | null>(null);
  const [outputDeptTab, setOutputDeptTab] = useState<string>("all");
  const [previewFinanceArtifact, setPreviewFinanceArtifact] = useState<FinanceArtifact | null>(null);
  const [showBusinessView, setShowBusinessView] = useState(false);
  const [showFinalDashboard, setShowFinalDashboard] = useState(false);

  // Extract company name from plan
  const companyName = plan.name.split(" - ")[0] || "Your Company";
  const [showCompletionBanner, setShowCompletionBanner] = useState(false);
  const [hasShownCompletion, setHasShownCompletion] = useState(false);

  const runningNodes = plan.workflow.nodes.filter(n => n.status === 'running');
  const completedNodes = plan.workflow.nodes.filter(n => n.status === 'completed');
  const overallProgress = Math.round(
    (completedNodes.length / plan.workflow.nodes.length) * 100
  );

  // Check if execution is complete (at least 3 departments done with outputs)
  const isExecutionComplete = completedNodes.length >= 3 &&
    (outputs.length > 0 ||
     (businessAgentState?.artifacts.length ?? 0) > 0 ||
     (financeAgentState?.artifacts.length ?? 0) > 0);

  // Auto-show completion banner when done
  if (isExecutionComplete && !hasShownCompletion && !showFinalDashboard) {
    setShowCompletionBanner(true);
    setHasShownCompletion(true);
  }

  const selectedNodeData = selectedNode
    ? plan.workflow.nodes.find(n => n.id === selectedNode)
    : null;

  const activeDepartment = activeDepartmentId
    ? openDepartments.find(d => d.id === activeDepartmentId)
    : null;

  const outputIcons = {
    file: FileText,
    code: Code,
    link: LinkIcon,
    text: FileText
  };

  const handleNodeClick = (nodeId: string) => {
    const node = plan.workflow.nodes.find(n => n.id === nodeId);
    if (node && node.type === "department") {
      // Open department drill-down
      const alreadyOpen = openDepartments.find(d => d.id === nodeId);
      if (!alreadyOpen) {
        setOpenDepartments(prev => [...prev, { id: nodeId, node }]);
      }
      setActiveDepartmentId(nodeId);
    } else {
      setSelectedNode(nodeId);
    }
  };

  const closeDepartment = (departmentId: string) => {
    setOpenDepartments(prev => prev.filter(d => d.id !== departmentId));
    if (activeDepartmentId === departmentId) {
      setActiveDepartmentId(openDepartments.length > 1
        ? openDepartments[openDepartments.length - 2].id
        : null
      );
    }
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Main Content - Workflow Graph */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="border-b bg-card p-4 pt-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold">{plan.name}</h2>
              <p className="text-sm text-muted-foreground">
                {runningNodes.length > 0
                  ? `${runningNodes[0].label} is working...`
                  : completedNodes.length === plan.workflow.nodes.length
                  ? "Execution complete!"
                  : "Preparing..."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Dashboard button - shows when there are outputs */}
              {(outputs.length > 0 ||
                (businessAgentState?.artifacts.length ?? 0) > 0 ||
                (financeAgentState?.artifacts.length ?? 0) > 0 ||
                Object.keys(softwareAgentState?.files ?? {}).length > 0) && (
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                  onClick={() => setShowFinalDashboard(true)}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  View Dashboard
                </Button>
              )}
              {isPaused ? (
                <Button size="sm" onClick={onResume}>
                  <Play className="mr-2 h-4 w-4" />
                  Resume
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={onPause}>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </Button>
              )}
              <Button size="sm" variant="destructive" onClick={onStop}>
                <Square className="mr-2 h-4 w-4" />
                Stop
              </Button>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{completedNodes.length}/{plan.workflow.nodes.length} departments completed</span>
              <span>•</span>
              <span>{outputs.length} outputs generated</span>
            </div>
          </div>
        </div>

        {/* Workflow Visualization */}
        <div className="flex-1 min-h-[600px]">
          <WorkflowGraph
            workflow={plan.workflow}
            onNodeClick={handleNodeClick}
            interactive={true}
            showMinimap={true}
          />
        </div>
      </div>

      {/* Department Tabs */}
      {openDepartments.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg z-40">
          <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto">
            {openDepartments.map(dept => (
              <div
                key={dept.id}
                role="button"
                tabIndex={0}
                onClick={() => setActiveDepartmentId(dept.id)}
                onKeyDown={(e) => e.key === 'Enter' && setActiveDepartmentId(dept.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg border border-b-0 transition-colors cursor-pointer ${
                  activeDepartmentId === dept.id
                    ? "bg-secondary border-border"
                    : "bg-muted border-border hover:bg-secondary"
                }`}
              >
                <div
                  className="h-3 w-3 rounded"
                  style={{ backgroundColor: dept.node.color }}
                />
                <span className="text-sm font-medium">{dept.node.label}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeDepartment(dept.id);
                  }}
                  className="ml-1 hover:bg-muted rounded p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Department Drill-Down */}
      {activeDepartment && activeDepartment.id === "dept_engineering" && softwareAgentState ? (
        <SoftwareEngineeringView
          isRunning={softwareAgentState.isRunning}
          error={softwareAgentState.error}
          agents={softwareAgentState.agents}
          steps={softwareAgentState.steps}
          files={softwareAgentState.files}
          selectedFile={softwareAgentState.selectedFile}
          sandbox={softwareAgentState.sandbox}
          refreshKey={softwareAgentState.refreshKey}
          setSelectedFile={softwareAgentState.setSelectedFile}
          updateFile={softwareAgentState.updateFile}
          onClose={() => closeDepartment(activeDepartment.id)}
        />
      ) : activeDepartment && departmentAgentWorkflowsExecution[activeDepartment.id] && (
        <DepartmentDrillDown
          department={activeDepartment.node}
          agentWorkflow={departmentAgentWorkflowsExecution[activeDepartment.id]}
          onClose={() => closeDepartment(activeDepartment.id)}
        />
      )}

      {/* Right Sidebar - Details & Outputs */}
      <div className="w-96 border-l bg-secondary flex flex-col overflow-hidden">
        <Tabs defaultValue="outputs" className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full grid grid-cols-2 rounded-none border-b shrink-0">
            <TabsTrigger value="outputs">
              Outputs ({outputs.length})
            </TabsTrigger>
            <TabsTrigger value="details">
              Details
            </TabsTrigger>
          </TabsList>

          {/* Outputs Tab */}
          <TabsContent value="outputs" className="flex-1 flex flex-col overflow-hidden mt-0 min-h-0">
            {/* Department Tabs */}
            <div className="flex gap-1 p-2 border-b bg-card overflow-x-auto shrink-0">
              <button
                onClick={() => setOutputDeptTab("all")}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  outputDeptTab === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-secondary"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setOutputDeptTab("marketing")}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors flex items-center gap-1.5 ${
                  outputDeptTab === "marketing"
                    ? "bg-pink-600 text-white"
                    : "bg-pink-50 text-pink-700 hover:bg-pink-100"
                }`}
              >
                <Palette className="h-3 w-3" />
                Marketing
              </button>
              <button
                onClick={() => setOutputDeptTab("engineering")}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors flex items-center gap-1.5 ${
                  outputDeptTab === "engineering"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
              >
                <Monitor className="h-3 w-3" />
                Engineering
              </button>
              <button
                onClick={() => setOutputDeptTab("finance")}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors flex items-center gap-1.5 ${
                  outputDeptTab === "finance"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                <DollarSign className="h-3 w-3" />
                Finance
              </button>
              <button
                onClick={() => setOutputDeptTab("business")}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors flex items-center gap-1.5 ${
                  outputDeptTab === "business"
                    ? "bg-indigo-600 text-white"
                    : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                }`}
              >
                <Presentation className="h-3 w-3" />
                Business
              </button>
            </div>

            {/* Department Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Marketing Outputs */}
              {(outputDeptTab === "all" || outputDeptTab === "marketing") && (
                <>
                  {outputDeptTab === "all" && outputs.length > 0 && (
                    <div className="text-xs font-semibold text-pink-600 uppercase tracking-wide mb-2">
                      Marketing & Brand
                    </div>
                  )}
                  {outputs.map((output) => {
                    const Icon = outputIcons[output.type];
                    return (
                      <Card key={output.id} className="p-3 hover:shadow-md transition-all">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded bg-pink-100 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-5 w-5 text-pink-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm mb-1">{output.name}</h4>
                            <p className="text-xs text-muted-foreground mb-2">
                              By {output.createdBy} • {new Date(output.createdAt).toLocaleTimeString()}
                            </p>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs flex-1"
                                onClick={() => setPreviewOutput(output)}
                              >
                                <Eye className="mr-1 h-3 w-3" />
                                Preview
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs flex-1"
                                onClick={() => {
                                  const data = output.data || {};
                                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement("a");
                                  a.href = url;
                                  a.download = `${output.name.replace(/\s+/g, "_").toLowerCase()}.json`;
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                                  URL.revokeObjectURL(url);
                                }}
                              >
                                <Download className="mr-1 h-3 w-3" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </>
              )}

              {/* Engineering Outputs */}
              {(outputDeptTab === "all" || outputDeptTab === "engineering") && softwareAgentState && (
                <>
                  {outputDeptTab === "all" && Object.keys(softwareAgentState.files).length > 0 && (
                    <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2 mt-4">
                      Software Engineering
                    </div>
                  )}
                  {Object.keys(softwareAgentState.files).length > 0 ? (
                    <Card className="p-3 hover:shadow-md transition-all">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Code className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm mb-1">Landing Page</h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            {Object.keys(softwareAgentState.files).length} files generated
                          </p>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs flex-1"
                              onClick={() => {
                                const node = plan.workflow.nodes.find(n => n.id === "dept_engineering");
                                if (node) {
                                  const alreadyOpen = openDepartments.find(d => d.id === "dept_engineering");
                                  if (!alreadyOpen) {
                                    setOpenDepartments(prev => [...prev, { id: "dept_engineering", node }]);
                                  }
                                  setActiveDepartmentId("dept_engineering");
                                }
                              }}
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              Preview
                            </Button>
                            {softwareAgentState.sandbox.previewUrl && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs flex-1"
                                onClick={() => window.open(softwareAgentState.sandbox.previewUrl!, "_blank")}
                              >
                                <ExternalLink className="mr-1 h-3 w-3" />
                                Open
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ) : outputDeptTab === "engineering" && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No engineering outputs yet
                    </div>
                  )}
                </>
              )}

              {/* Finance Outputs */}
              {(outputDeptTab === "all" || outputDeptTab === "finance") && financeAgentState && (
                <>
                  {outputDeptTab === "all" && financeAgentState.artifacts.length > 0 && (
                    <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2 mt-4">
                      Financial Analysis
                    </div>
                  )}
                  {financeAgentState.artifacts.length > 0 ? (
                    financeAgentState.artifacts.map((artifact) => {
                      const iconMap: Record<string, React.ElementType> = {
                        executive_summary: FileText,
                        revenue_projection: TrendingUp,
                        market_analysis: PieChart,
                        funding_requirements: DollarSign,
                        pl_statement: BarChart3,
                      };
                      const Icon = iconMap[artifact.type] || FileText;
                      return (
                        <Card key={artifact.id} className="p-3 hover:shadow-md transition-all">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded bg-emerald-100 flex items-center justify-center flex-shrink-0">
                              <Icon className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm mb-1">{artifact.title}</h4>
                              <p className="text-xs text-muted-foreground mb-2">
                                {new Date(artifact.createdAt).toLocaleTimeString()}
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs w-full"
                                onClick={() => setPreviewFinanceArtifact(artifact)}
                              >
                                <Eye className="mr-1 h-3 w-3" />
                                View Chart
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })
                  ) : outputDeptTab === "finance" && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No finance outputs yet
                    </div>
                  )}
                </>
              )}

              {/* Business Outputs */}
              {(outputDeptTab === "all" || outputDeptTab === "business") && businessAgentState && (
                <>
                  {outputDeptTab === "all" && businessAgentState.artifacts.length > 0 && (
                    <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2 mt-4">
                      Business Strategy
                    </div>
                  )}
                  {/* Show error if present */}
                  {businessAgentState.error && (
                    <Card className="p-3 border-red-200 bg-red-50">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded bg-red-100 flex items-center justify-center flex-shrink-0">
                          <Activity className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm mb-1 text-red-700">Error</h4>
                          <p className="text-xs text-red-600">{businessAgentState.error}</p>
                        </div>
                      </div>
                    </Card>
                  )}
                  {/* Show loading state */}
                  {businessAgentState.isRunning && businessAgentState.artifacts.length === 0 && (
                    <Card className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded bg-indigo-100 flex items-center justify-center flex-shrink-0 animate-pulse">
                          <Briefcase className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm mb-1">Generating presentations...</h4>
                          <p className="text-xs text-muted-foreground">
                            Creating pitch deck, business plan, and more
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}
                  {businessAgentState.artifacts.length > 0 ? (
                    businessAgentState.artifacts.map((artifact) => {
                      const iconMap: Record<string, React.ElementType> = {
                        pitch_deck: Presentation,
                        business_plan: FileText,
                        competitive_analysis: Target,
                        go_to_market: TrendingUp,
                      };
                      const Icon = iconMap[artifact.type] || Briefcase;
                      return (
                        <Card key={artifact.id} className="p-3 hover:shadow-md transition-all">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded bg-indigo-100 flex items-center justify-center flex-shrink-0">
                              <Icon className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm mb-1">{artifact.title}</h4>
                              <p className="text-xs text-muted-foreground mb-2">
                                {artifact.data.slideCount || 0} slides
                              </p>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs flex-1"
                                  onClick={() => setShowBusinessView(true)}
                                >
                                  <Eye className="mr-1 h-3 w-3" />
                                  Preview
                                </Button>
                                {artifact.data.pptxBase64 && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs flex-1"
                                    onClick={() => {
                                      const byteCharacters = atob(artifact.data.pptxBase64!);
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
                                    }}
                                  >
                                    <Download className="mr-1 h-3 w-3" />
                                    PPTX
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })
                  ) : outputDeptTab === "business" && !businessAgentState.isRunning && !businessAgentState.error && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No business outputs yet
                    </div>
                  )}
                </>
              )}

              {/* Empty State */}
              {outputs.length === 0 &&
               (!softwareAgentState || Object.keys(softwareAgentState.files).length === 0) &&
               (!financeAgentState || financeAgentState.artifacts.length === 0) &&
               (!businessAgentState || businessAgentState.artifacts.length === 0) && (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No outputs yet. They'll appear here as departments complete their work.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="flex-1 overflow-y-auto p-4 mt-0 min-h-0">
            {selectedNodeData ? (
              <div className="space-y-4">
                <div>
                  <div
                    className="inline-flex p-3 rounded-lg mb-3"
                    style={{ backgroundColor: `${selectedNodeData.color}20` }}
                  >
                    <div className="text-2xl">{selectedNodeData.icon || "🎯"}</div>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{selectedNodeData.label}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {selectedNodeData.description}
                  </p>
                  <Badge>
                    {selectedNodeData.status}
                  </Badge>
                </div>

                {selectedNodeData.progress !== undefined && (
                  <div>
                    <div className="text-sm font-medium mb-2">Progress</div>
                    <Progress value={selectedNodeData.progress} className="h-2" />
                    <div className="text-xs text-muted-foreground mt-1">
                      {selectedNodeData.progress}% complete
                    </div>
                  </div>
                )}

                {selectedNodeData.tools && selectedNodeData.tools.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Tools</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedNodeData.tools.map((tool) => (
                        <Badge key={tool} variant="secondary">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-sm font-medium mb-2">Actions</div>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      View Logs
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Configure
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Click on a department in the graph to see details
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview Modal */}
      {previewOutput && (
        <OutputPreviewModal
          output={previewOutput}
          onClose={() => setPreviewOutput(null)}
        />
      )}

      {/* Finance Chart Modal */}
      {previewFinanceArtifact && (
        <FinanceChartModal
          artifact={previewFinanceArtifact}
          onClose={() => setPreviewFinanceArtifact(null)}
        />
      )}

      {/* Business Outputs View */}
      {showBusinessView && businessAgentState && (
        <BusinessOutputsView
          isRunning={businessAgentState.isRunning}
          error={businessAgentState.error}
          agents={businessAgentState.agents}
          steps={businessAgentState.steps}
          artifacts={businessAgentState.artifacts}
          onClose={() => setShowBusinessView(false)}
        />
      )}

      {/* Final Dashboard */}
      {showFinalDashboard && (
        <FinalDashboard
          companyName={companyName}
          marketingOutputs={outputs}
          businessArtifacts={businessAgentState?.artifacts ?? []}
          financeArtifacts={financeAgentState?.artifacts ?? []}
          engineeringFiles={softwareAgentState?.files ?? {}}
          sandboxUrl={softwareAgentState?.sandbox.previewUrl ?? undefined}
          toolCalls={marketingAgentState?.toolCalls ?? []}
          onClose={() => setShowFinalDashboard(false)}
          onPreviewMarketing={(output) => {
            setShowFinalDashboard(false);
            setPreviewOutput(output);
          }}
          onPreviewFinance={(artifact) => {
            setShowFinalDashboard(false);
            setPreviewFinanceArtifact(artifact);
          }}
          onPreviewBusiness={() => {
            setShowFinalDashboard(false);
            setShowBusinessView(true);
          }}
        />
      )}

      {/* Completion Celebration Banner */}
      {showCompletionBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-lg mx-4 p-8 text-center relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-pink-500/10" />

            <div className="relative z-10">
              <div className="text-6xl mb-4">
                <Sparkles className="h-16 w-16 mx-auto text-violet-500 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {companyName} is Ready!
              </h2>
              <p className="text-muted-foreground mb-6">
                All departments have completed their work. Your brand, presentations, and financial analysis are ready to view.
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                  onClick={() => {
                    setShowCompletionBanner(false);
                    setShowFinalDashboard(true);
                  }}
                >
                  <LayoutDashboard className="mr-2 h-5 w-5" />
                  View Final Dashboard
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => setShowCompletionBanner(false)}
                >
                  Continue Working
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                {outputs.length + (businessAgentState?.artifacts.length ?? 0) + (financeAgentState?.artifacts.length ?? 0)} outputs generated • {completedNodes.length} departments completed
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
