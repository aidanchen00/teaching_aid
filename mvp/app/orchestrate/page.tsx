"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Phase, ChatMessage, Plan, ExecutionOutput, WorkflowGraph, WorkflowNode } from "@/lib/types";
import { ThreadList } from "@/components/assistant-ui/thread-list";
import {
  AssistantRuntimeProvider,
  useAssistantRuntime,
  unstable_useRemoteThreadListRuntime as useRemoteThreadListRuntime,
  type unstable_RemoteThreadListAdapter as RemoteThreadListAdapter,
} from "@assistant-ui/react";
import { useChatRuntime, AssistantChatTransport } from "@assistant-ui/react-ai-sdk";
import { createAssistantStream } from "assistant-stream";
import { ChevronDown, ChevronUp, Settings, PanelLeftClose, PanelLeft } from "lucide-react";
import { ExecutionView } from "@/components/execution/execution-view";
import { PlanningView } from "@/components/planning/planning-view";
import { departmentAgentWorkflows } from "@/lib/agent-workflows";
import { CommandPalette, useCommandPalette } from "@/components/command-palette";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Thread } from "@/components/assistant-ui/thread";
import { mockPlan } from "@/lib/mock-orchestrator-data";
import { useAgentExecution } from "@/lib/ai/hooks/useAgentExecution";
import { useSoftwareExecution } from "@/lib/ai/hooks/useSoftwareExecution";
import { useFinanceExecution } from "@/lib/ai/hooks/useFinanceExecution";
import { useBusinessExecution } from "@/lib/ai/hooks/useBusinessExecution";
import type { SoftwareVariables } from "@/lib/ai/agents/software";
import type { FinanceVariables } from "@/lib/ai/agents/finance";
import type { BusinessVariables } from "@/lib/ai/agents/business";
import {
  Home,
  Play,
  Pause,
  Square,
  Download,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Helper functions for converting tool calls to outputs
function getOutputName(toolName: string, result?: Record<string, unknown>): string {
  const names: Record<string, string> = {
    defineBrandIdentity: "Brand Identity",
    createMessagingFramework: "Messaging Framework",
    generateColorPalette: "Color Palette",
    defineTypography: "Typography System",
    generateLogo: "Logo Concept",
    generateWebsiteCopy: "Website Copy",
    generateTaglines: "Taglines",
    createSocialMediaPlan: "Social Media Plan",
    generateSocialPosts: "Social Posts",
    saveBrandGuidelines: "Brand Guidelines",
  };
  const baseName = names[toolName] || toolName;
  const companyName = result?.companyName as string;
  return companyName ? `${companyName} - ${baseName}` : baseName;
}

function getOutputType(toolName: string): "file" | "link" | "code" | "text" {
  const types: Record<string, "file" | "link" | "code" | "text"> = {
    defineBrandIdentity: "file",
    createMessagingFramework: "file",
    generateColorPalette: "code",
    defineTypography: "code",
    generateLogo: "code",
    generateWebsiteCopy: "text",
    generateTaglines: "text",
    createSocialMediaPlan: "file",
    generateSocialPosts: "text",
    saveBrandGuidelines: "file",
  };
  return types[toolName] || "file";
}

function getAgentNameFromToolCall(toolName: string): string {
  const agentMap: Record<string, string> = {
    defineBrandIdentity: "Brand Strategist",
    createMessagingFramework: "Brand Strategist",
    generateColorPalette: "Designer",
    defineTypography: "Designer",
    generateLogo: "Designer",
    generateWebsiteCopy: "Content Writer",
    generateTaglines: "Content Writer",
    createSocialMediaPlan: "Social Media Manager",
    generateSocialPosts: "Social Media Manager",
    saveBrandGuidelines: "Brand Strategist",
  };
  return agentMap[toolName] || "Marketing";
}

function createFullWorkflowGraph(): WorkflowGraph {
  return {
    nodes: [
      {
        id: "dept_business",
        type: "department" as const,
        label: "Business Strategy",
        description: "Define business model, market positioning, and financial projections",
        status: "pending" as const,
        progress: 0,
        color: "#3B82F6",
        icon: "target",
        tools: ["Notion", "Sheets"],
        position: { x: 250, y: 0 },
      },
      {
        id: "dept_engineering",
        type: "department" as const,
        label: "Software Engineering",
        description: "Build technical architecture and core product",
        status: "pending" as const,
        progress: 0,
        color: "#8B5CF6",
        icon: "code",
        tools: ["GitHub", "Vercel"],
        position: { x: 0, y: 150 },
      },
      {
        id: "dept_marketing",
        type: "department" as const,
        label: "Marketing & Brand",
        description: "Create brand identity, visual design, content, and social media strategy",
        status: "pending" as const,
        progress: 0,
        color: "#EC4899",
        icon: "megaphone",
        tools: ["AI Brand Strategist", "AI Designer", "AI Content Writer", "AI Social Media"],
        position: { x: 250, y: 150 },
      },
      {
        id: "dept_finance",
        type: "department" as const,
        label: "Financial Analysis",
        description: "Generate financial projections, market analysis, and funding requirements",
        status: "pending" as const,
        progress: 0,
        color: "#10B981",
        icon: "dollar-sign",
        tools: ["Thesys C1", "AI Analyst"],
        position: { x: 500, y: 150 },
      },
      {
        id: "dept_operations",
        type: "department" as const,
        label: "Operations",
        description: "Set up operational processes and systems",
        status: "pending" as const,
        progress: 0,
        color: "#F59E0B",
        icon: "briefcase",
        tools: ["Stripe", "QuickBooks"],
        position: { x: 250, y: 300 },
      },
    ],
    edges: [
      {
        id: "edge_1",
        source: "dept_business",
        target: "dept_engineering",
        label: "Business requirements",
        type: "dependency" as const,
      },
      {
        id: "edge_2",
        source: "dept_business",
        target: "dept_marketing",
        label: "Brand strategy",
        type: "dependency" as const,
      },
      {
        id: "edge_3",
        source: "dept_business",
        target: "dept_finance",
        label: "Financial model",
        type: "dependency" as const,
      },
      {
        id: "edge_4",
        source: "dept_business",
        target: "dept_operations",
        label: "Operations plan",
        type: "dependency" as const,
      },
      {
        id: "edge_5",
        source: "dept_marketing",
        target: "dept_engineering",
        label: "Brand assets",
        type: "dependency" as const,
      },
    ],
  };
}

// Inner component that uses assistant-ui hooks
function OrchestrateContent() {
  const runtime = useAssistantRuntime();
  
  const [phase, setPhase] = useState<Phase>("input");
  const [currentPlan, setCurrentPlan] = useState<Plan | undefined>();
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [outputs, setOutputs] = useState<ExecutionOutput[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [threadListOpen, setThreadListOpen] = useState(false);
  const [executingDepartment, setExecutingDepartment] = useState<string | null>(null);

  // Marketing agent execution hook
  const marketingAgent = useAgentExecution("marketing");

  // Software engineering execution hook
  const softwareAgent = useSoftwareExecution();

  // Finance department execution hook (runs in parallel with marketing)
  const financeAgent = useFinanceExecution();

  // Business department execution hook (generates PPTX presentations)
  const businessAgent = useBusinessExecution();

  // Store marketing variables for software execution
  const [marketingVariables, setMarketingVariables] = useState<Record<string, string> | null>(null);
  const softwareTriggeredRef = useRef(false);

  const { open, setOpen } = useCommandPalette();

  // Handle department execution
  const handleExecuteDepartment = useCallback((variables: Record<string, string>) => {
    console.log("Executing Marketing + Finance departments in parallel:", variables);
    setExecutingDepartment("marketing");
    setMarketingVariables(variables); // Store for software execution
    softwareTriggeredRef.current = false; // Reset software trigger

    // Set up the plan with full workflow graph
    const fullPlan = {
      ...mockPlan,
      name: `${variables.companyName || "Brand"} - Full Stack`,
      workflow: createFullWorkflowGraph(),
    };
    setCurrentPlan(fullPlan);
    setPhase("executing");
    setIsExecuting(true);

    // Execute marketing agents
    marketingAgent.execute(variables);

    // Execute finance department in PARALLEL (doesn't feed into software)
    const financeVars: FinanceVariables = {
      companyName: variables.companyName || "Company",
      industry: variables.industry || "Technology",
      productDescription: variables.productDescription || "Product",
      targetAudience: variables.targetAudience,
      fundingStage: variables.fundingStage || "seed",
      revenueModel: variables.revenueModel || "SaaS subscription",
      initialInvestment: variables.initialInvestment,
    };
    financeAgent.execute(financeVars);

    // Execute business department in PARALLEL (generates PPTX presentations)
    const businessVars: BusinessVariables = {
      companyName: variables.companyName || "Company",
      industry: variables.industry || "Technology",
      productDescription: variables.productDescription || "Product",
      targetAudience: variables.targetAudience,
      fundingStage: variables.fundingStage || "seed",
      revenueModel: variables.revenueModel || "SaaS subscription",
      uniqueValue: variables.uniqueValue,
      competitors: variables.competitors,
    };
    console.log("[Orchestrate] Executing business department with:", businessVars);
    console.log("[Orchestrate] businessAgent.execute type:", typeof businessAgent.execute);
    const businessPromise = businessAgent.execute(businessVars);
    console.log("[Orchestrate] businessPromise:", businessPromise);
    businessPromise.catch(err => console.error("[Orchestrate] Business execution failed:", err));
  }, [marketingAgent, financeAgent, businessAgent]);

  // Track if we've already triggered execution to prevent duplicates
  const hasTriggeredRef = useRef(false);
  const hasShownPlanRef = useRef(false);

  // Show planning phase (workflow graph) after first user message
  useEffect(() => {
    const unsubscribe = runtime.thread.subscribe(() => {
      if (hasShownPlanRef.current || phase !== "input") return;
      
      const messages = runtime.thread.getState().messages;
      const userMessages = messages.filter(m => m.role === "user");
      
      // After first user message, show the planning view with workflow graph
      if (userMessages.length >= 1 && messages.length > lastMessageCount) {
        setLastMessageCount(messages.length);
        hasShownPlanRef.current = true;
        setPhase("planning");
        // Set up the initial plan with all departments
        setCurrentPlan({
          ...mockPlan,
          name: "New Company - All Departments",
          workflow: createFullWorkflowGraph(),
        });
      }
    });
    return unsubscribe;
  }, [runtime, phase, lastMessageCount]);

  // Parse execute action from text content (fallback for when tool calls aren't detected)
  const parseExecuteFromText = useCallback((text: string): Record<string, string> | null => {
    // Try JSON code block
    const jsonMatch = text.match(/```json\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.action === "execute_department" && parsed.department === "marketing" && parsed.variables) {
          return parsed.variables;
        }
      } catch {}
    }
    // Try inline JSON
    const inlineMatch = text.match(/\{"action"\s*:\s*"execute_department"[\s\S]*?"variables"\s*:\s*(\{[^}]+\})/);
    if (inlineMatch) {
      try {
        return JSON.parse(inlineMatch[1]);
      } catch {}
    }
    return null;
  }, []);

  // Listen for tool calls in the thread messages
  useEffect(() => {
    const unsubscribe = runtime.thread.subscribe(() => {
      if (hasTriggeredRef.current || isExecuting || phase === "executing") return;
      
      const messages = runtime.thread.getState().messages;
      
      // Look for tool call results with execute_marketing
      for (const msg of messages) {
        if (msg.role === "assistant" && msg.content) {
          for (const part of msg.content) {
            // Check for tool-call type (assistant-ui format)
            if (part.type === "tool-call" && (part as any).toolName === "execute_marketing") {
              const args = (part as any).args as Record<string, string>;
              console.log("Found execute_marketing tool call:", args);
              // IMPORTANT: Only trigger when args are actually populated (not empty object from streaming)
              if (args && Object.keys(args).length > 0 && args.companyName) {
                hasTriggeredRef.current = true;
                handleExecuteDepartment(args);
                return;
              }
            }
            // Also check for tool-result type which contains the executed result
            if ((part as any).type === "tool-result" && (part as any).toolName === "execute_marketing") {
              const result = (part as any).result as { variables?: Record<string, string> };
              console.log("Found execute_marketing tool result:", result);
              if (result?.variables) {
                hasTriggeredRef.current = true;
                handleExecuteDepartment(result.variables);
                return;
              }
            }
            // Fallback: check text content for JSON action
            if (part.type === "text" && (part as any).text) {
              const variables = parseExecuteFromText((part as any).text);
              if (variables) {
                console.log("Found execute action in text:", variables);
                hasTriggeredRef.current = true;
                handleExecuteDepartment(variables);
                return;
              }
            }
          }
        }
      }
    });
    
    return unsubscribe;
  }, [runtime, handleExecuteDepartment, isExecuting, phase, parseExecuteFromText]);

  // Update workflow graph and outputs based on real agent state
  useEffect(() => {
    if (executingDepartment !== "marketing") return;

    const agentStates = Object.values(marketingAgent.agents);
    const completedCount = agentStates.filter((a) => a.status === "completed").length;
    const totalAgents = 4;
    const progress = Math.round((completedCount / totalAgents) * 100);
    const isRunning = agentStates.some((a) => a.status === "running");
    const isComplete = completedCount === totalAgents && !marketingAgent.isRunning;

    const newStatus: WorkflowNode["status"] = isComplete ? "completed" : isRunning ? "running" : "pending";
    
    setCurrentPlan((prev) => {
      if (!prev) return prev;
      const nodes: WorkflowNode[] = prev.workflow.nodes.map((node) => {
        if (node.id === "dept_marketing") {
          return { ...node, status: newStatus, progress };
        }
        return node;
      });
      return { ...prev, workflow: { ...prev.workflow, nodes } };
    });

    // Update outputs from marketing agent tool calls
    if (marketingAgent.toolCalls) {
      const outputToolNames = [
        "defineBrandIdentity",
        "createMessagingFramework",
        "generateColorPalette",
        "defineTypography",
        "generateLogo",
        "generateWebsiteCopy",
        "generateTaglines",
        "createSocialMediaPlan",
        "generateSocialPosts",
        "saveBrandGuidelines",
      ];
      
      const realOutputs = marketingAgent.toolCalls
        .filter((tc) => tc.status === "completed" && outputToolNames.includes(tc.toolName))
        .map((tc) => {
          const result = tc.result as Record<string, unknown> | undefined;
          return {
            id: tc.id,
            name: getOutputName(tc.toolName, result),
            type: getOutputType(tc.toolName),
            createdBy: getAgentNameFromToolCall(tc.toolName),
            createdAt: tc.completedAt || new Date(),
            departmentId: "dept_marketing",
            url: result?.documentId ? `/api/agents/marketing?type=${tc.toolName}` : undefined,
            data: result,
          };
        });
      
      if (realOutputs.length > 0) {
        setOutputs(realOutputs);
      }
    }

  }, [marketingAgent.agents, marketingAgent.isRunning, marketingAgent.toolCalls, executingDepartment]);

  // Auto-trigger software execution when marketing completes (separate effect to avoid loops)
  const marketingCompleteRef = useRef(false);
  useEffect(() => {
    if (executingDepartment !== "marketing") return;

    const agentStates = Object.values(marketingAgent.agents);
    const completedCount = agentStates.filter((a) => a.status === "completed").length;
    const totalAgents = 4;
    const isComplete = completedCount === totalAgents && !marketingAgent.isRunning;

    if (isComplete && !softwareTriggeredRef.current && !marketingCompleteRef.current && marketingVariables) {
      marketingCompleteRef.current = true;
      softwareTriggeredRef.current = true;

      // Extract ALL marketing outputs from tool calls
      const brandIdentityCall = marketingAgent.toolCalls.find(
        (tc) => tc.toolName === "defineBrandIdentity" && tc.status === "completed"
      );
      const colorPaletteCall = marketingAgent.toolCalls.find(
        (tc) => tc.toolName === "generateColorPalette" && tc.status === "completed"
      );
      const websiteCopyCall = marketingAgent.toolCalls.find(
        (tc) => tc.toolName === "generateWebsiteCopy" && tc.status === "completed"
      );
      const taglinesCall = marketingAgent.toolCalls.find(
        (tc) => tc.toolName === "generateTaglines" && tc.status === "completed"
      );
      const logoCall = marketingAgent.toolCalls.find(
        (tc) => tc.toolName === "generateLogo" && tc.status === "completed"
      );

      // Build comprehensive software variables from marketing outputs
      const brandIdentityResult = brandIdentityCall?.result as { brandIdentity?: Record<string, unknown> } | undefined;
      const colorPaletteResult = colorPaletteCall?.result as { colorPalette?: Record<string, unknown> } | undefined;
      const websiteCopyResult = websiteCopyCall?.result as { websiteCopy?: Record<string, unknown> } | undefined;
      const taglinesResult = taglinesCall?.result as { taglines?: Record<string, unknown>; recommendedTagline?: string } | undefined;
      const logoResult = logoCall?.result as { logoConcept?: { svgCode?: string; concept?: string } } | undefined;

      const softwareVars: SoftwareVariables = {
        companyName: marketingVariables.companyName || "Company",
        productDescription: marketingVariables.productDescription || "Product",
        industry: marketingVariables.industry,
        targetAudience: marketingVariables.targetAudience,
        brandIdentity: brandIdentityResult?.brandIdentity as SoftwareVariables["brandIdentity"],
        colorPalette: colorPaletteResult?.colorPalette as SoftwareVariables["colorPalette"],
        websiteCopy: websiteCopyResult?.websiteCopy as SoftwareVariables["websiteCopy"],
        taglines: taglinesResult ? {
          recommendedTagline: taglinesResult.recommendedTagline,
          options: (taglinesResult as any).taglines,
        } : undefined,
        logo: logoResult?.logoConcept ? {
          svgCode: logoResult.logoConcept.svgCode,
          concept: logoResult.logoConcept.concept,
        } : undefined,
      };

      console.log("=== Marketing complete, passing to Software Engineering ===");
      console.log("Brand Identity:", softwareVars.brandIdentity);
      console.log("Color Palette:", softwareVars.colorPalette);
      console.log("Website Copy:", softwareVars.websiteCopy);
      console.log("Taglines:", softwareVars.taglines);
      console.log("Logo:", softwareVars.logo ? "SVG provided" : "No logo");
      console.log("============================================================");

      // Delay to avoid state update conflicts
      setTimeout(() => {
        setExecutingDepartment("engineering");
        softwareAgent.execute(softwareVars);
      }, 100);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketingAgent.agents, marketingAgent.isRunning, marketingVariables]);

  // Update workflow graph for software engineering status
  useEffect(() => {
    if (executingDepartment !== "engineering") return;

    const agentStates = Object.values(softwareAgent.agents);
    const isComplete = agentStates.some((a) => a.status === "completed") && !softwareAgent.isRunning;
    const isRunning = softwareAgent.isRunning;
    const progress = softwareAgent.isRunning ? 50 : isComplete ? 100 : 0;

    const newStatus: WorkflowNode["status"] = isComplete ? "completed" : isRunning ? "running" : "pending";

    setCurrentPlan((prev) => {
      if (!prev) return prev;
      const nodes: WorkflowNode[] = prev.workflow.nodes.map((node) => {
        if (node.id === "dept_engineering") {
          return { ...node, status: newStatus, progress };
        }
        return node;
      });
      return { ...prev, workflow: { ...prev.workflow, nodes } };
    });

    if (isComplete) {
      setIsExecuting(false);
      setPhase("completed");
    }
  }, [softwareAgent.agents, softwareAgent.isRunning, executingDepartment]);

  // Update workflow graph for finance department status (runs in parallel)
  useEffect(() => {
    const agentStates = Object.values(financeAgent.agents);
    const isComplete = agentStates.some((a) => a.status === "completed") ||
                       (financeAgent.artifacts.length > 0 && !financeAgent.isRunning);
    const isRunning = financeAgent.isRunning;
    const progress = financeAgent.artifacts.length * 25; // 4 reports = 100%

    const newStatus: WorkflowNode["status"] = isComplete ? "completed" : isRunning ? "running" : "pending";

    setCurrentPlan((prev) => {
      if (!prev) return prev;
      const nodes: WorkflowNode[] = prev.workflow.nodes.map((node) => {
        if (node.id === "dept_finance") {
          return { ...node, status: newStatus, progress };
        }
        return node;
      });
      return { ...prev, workflow: { ...prev.workflow, nodes } };
    });
  }, [financeAgent.agents, financeAgent.isRunning, financeAgent.artifacts]);

  // Update workflow graph for business department status (runs in parallel, generates PPTX)
  useEffect(() => {
    const agentStates = Object.values(businessAgent.agents);
    const isComplete = agentStates.some((a) => a.status === "completed") ||
                       (businessAgent.artifacts.length > 0 && !businessAgent.isRunning);
    const isRunning = businessAgent.isRunning;
    const progress = businessAgent.artifacts.length * 25; // 4 presentations = 100%

    const newStatus: WorkflowNode["status"] = isComplete ? "completed" : isRunning ? "running" : "pending";

    setCurrentPlan((prev) => {
      if (!prev) return prev;
      const nodes: WorkflowNode[] = prev.workflow.nodes.map((node) => {
        if (node.id === "dept_business") {
          return { ...node, status: newStatus, progress };
        }
        return node;
      });
      return { ...prev, workflow: { ...prev.workflow, nodes } };
    });
  }, [businessAgent.agents, businessAgent.isRunning, businessAgent.artifacts]);

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleStop = () => {
    setIsExecuting(false);
    setPhase("completed");
  };

  const commands = [
    {
      id: "home",
      label: "Go Home",
      icon: Home,
      shortcut: "⌘H",
      onSelect: () => (window.location.href = "/")
    },
    {
      id: "toggle_chat",
      label: chatOpen ? "Hide Chat" : "Show Chat",
      icon: MessageSquare,
      shortcut: "⌘B",
      onSelect: () => setChatOpen(!chatOpen)
    },
    ...(phase === "executing"
      ? [
          {
            id: "pause",
            label: isPaused ? "Resume Execution" : "Pause Execution",
            icon: isPaused ? Play : Pause,
            shortcut: "⌘P",
            onSelect: isPaused ? handleResume : handlePause
          },
          {
            id: "stop",
            label: "Stop Execution",
            icon: Square,
            shortcut: "⌘S",
            onSelect: handleStop
          }
        ]
      : []),
    {
      id: "download",
      label: "Download All Outputs",
      icon: Download,
      onSelect: () => console.log("Download all")
    },
    {
      id: "restart",
      label: "Start New Project",
      icon: RefreshCw,
      onSelect: () => window.location.reload()
    }
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "b") {
          e.preventDefault();
          setChatOpen(!chatOpen);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [chatOpen]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Nav */}
      <header className="border-b bg-card px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <span className="font-bold text-xl">Openpreneurship</span>
          </Link>
          <Badge variant={phase === "executing" ? "default" : "secondary"}>
            {phase.replace("_", " ").toUpperCase()}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setChatOpen(!chatOpen)}
          >
            {chatOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeft className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Sidebar with assistant-ui */}
        {chatOpen && (
          <div className="w-[420px] border-r flex flex-col bg-card">
            {/* Thread List Header - Collapsible */}
            <div className="border-b px-3 py-2 bg-secondary">
              <button
                onClick={() => setThreadListOpen(!threadListOpen)}
                className="w-full flex items-center justify-between text-sm hover:bg-muted rounded px-2 py-1.5 transition-colors"
              >
                <span className="font-medium text-muted-foreground">
                  {threadListOpen ? "Hide Chats" : "All Chats"}
                </span>
                {threadListOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>

            {/* Thread List - Expandable */}
            {threadListOpen && (
              <div className="border-b bg-muted/30 p-2 max-h-48 overflow-y-auto">
                <ThreadList />
              </div>
            )}

            {/* Chat Header */}
            <div className="border-b px-4 py-3 flex items-center justify-between bg-secondary">
              <h2 className="font-semibold">Chat</h2>
              <span className="text-xs text-muted-foreground">
                Press ⌘K for commands
              </span>
            </div>
            
            {/* assistant-ui Thread component */}
            <div className="flex-1 overflow-hidden">
              <Thread />
            </div>
          </div>
        )}

        {/* Main View */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {phase === "input" && (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="max-w-2xl w-full text-center">
                <div className="text-4xl font-bold mb-6 text-primary">Openpreneurship</div>
                <h1 className="text-4xl font-bold mb-4">
                  What do you want to build?
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Start chatting to orchestrate AI departments that will build
                  your company
                </p>
                <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground mb-8">
                  <div>
                    <div className="text-2xl font-bold text-foreground">5</div>
                    <div>AI Departments</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">12+</div>
                    <div>AI Agents</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">150+</div>
                    <div>Integrations</div>
                  </div>
                </div>
                {/* Quick start button for testing */}
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => handleExecuteDepartment({
                    companyName: "FitFlow",
                    industry: "Fitness Technology",
                    targetAudience: "Urban professionals aged 25-45 who want quick, effective workouts",
                    productDescription: "AI-powered fitness app with personalized 15-minute workout plans",
                    uniqueValue: "Adapts to your schedule and fitness level in real-time",
                    tone: "Energetic, motivating, and supportive",
                    competitors: "Peloton, Nike Training Club, Fitness+",
                  })}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Quick Demo: Execute Marketing for FitFlow
                </Button>
              </div>
            </div>
          )}

          {phase === "planning" && currentPlan && (
            <PlanningView
              plan={currentPlan}
              onApprove={() => {
                // For now, go directly to executing marketing
                handleExecuteDepartment({
                  companyName: "Your Company",
                  industry: "Technology",
                  targetAudience: "Your target audience",
                  productDescription: "Your product description",
                  uniqueValue: "What makes you unique",
                  tone: "Professional and friendly",
                  competitors: "Your competitors",
                });
              }}
              onModify={() => {}}
              onReject={() => {
                setPhase("input");
                setCurrentPlan(undefined);
                hasShownPlanRef.current = false;
              }}
              customAgentWorkflows={departmentAgentWorkflows}
            />
          )}

          {(phase === "executing" || phase === "completed") && currentPlan && (
            <ExecutionView
              plan={currentPlan}
              outputs={outputs}
              onPause={handlePause}
              onResume={handleResume}
              onStop={handleStop}
              isPaused={isPaused}
              marketingAgentState={{
                agents: marketingAgent.agents,
                steps: marketingAgent.steps,
                toolCalls: marketingAgent.toolCalls.map(tc => ({ ...tc, agentId: (tc as any).agentId || "unknown" })),
                isRunning: marketingAgent.isRunning,
              }}
              softwareAgentState={{
                isRunning: softwareAgent.isRunning,
                error: softwareAgent.error,
                agents: softwareAgent.agents,
                steps: softwareAgent.steps,
                files: softwareAgent.files,
                selectedFile: softwareAgent.selectedFile,
                sandbox: softwareAgent.sandbox,
                refreshKey: softwareAgent.refreshKey,
                setSelectedFile: softwareAgent.setSelectedFile,
                updateFile: softwareAgent.updateFile,
              }}
              financeAgentState={{
                isRunning: financeAgent.isRunning,
                error: financeAgent.error,
                agents: financeAgent.agents,
                steps: financeAgent.steps,
                artifacts: financeAgent.artifacts,
              }}
              businessAgentState={{
                isRunning: businessAgent.isRunning,
                error: businessAgent.error,
                agents: businessAgent.agents,
                steps: businessAgent.steps,
                artifacts: businessAgent.artifacts,
              }}
            />
          )}
        </div>
      </div>

      {/* Command Palette */}
      <CommandPalette open={open} onOpenChange={setOpen} commands={commands} />
    </div>
  );
}

// MongoDB-backed thread list adapter for multi-chat
const threadListAdapter: RemoteThreadListAdapter = {
  async list() {
    try {
      const response = await fetch("/api/threads");
      if (!response.ok) {
        console.error("Failed to fetch threads:", response.status, response.statusText);
        return { threads: [] };
      }
      const threads = await response.json();
      console.log("Fetched threads:", threads);
      
      // Handle error response
      if (threads.error) {
        console.error("Thread API error:", threads.error);
        return { threads: [] };
      }
      
      // Ensure threads is an array
      if (!Array.isArray(threads)) {
        console.error("Threads response is not an array:", threads);
        return { threads: [] };
      }
      
      const mapped = threads.map((t: any) => ({
        remoteId: t.id,
        externalId: t.external_id ?? undefined,
        status: t.is_archived ? "archived" as const : "regular" as const,
        title: t.title ?? undefined,
      }));
      console.log("Mapped threads for UI:", mapped);
      return { threads: mapped };
    } catch (error) {
      console.error("Error fetching threads:", error);
      return { threads: [] };
    }
  },
  async fetch(remoteId: string) {
    const response = await fetch(`/api/threads/${remoteId}`);
    if (!response.ok) {
      throw new Error(`Thread ${remoteId} not found`);
    }
    const thread = await response.json();
    return {
      remoteId: thread.id,
      externalId: thread.external_id ?? undefined,
      status: thread.is_archived ? "archived" as const : "regular" as const,
      title: thread.title ?? undefined,
    };
  },
  async initialize(localId: string) {
    const response = await fetch("/api/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ localId }),
    });
    const data = await response.json();
    return { remoteId: data.id, externalId: data.external_id };
  },
  async delete(remoteId: string) {
    await fetch(`/api/threads/${remoteId}`, { method: "DELETE" });
  },
  async rename(remoteId: string, title: string) {
    await fetch(`/api/threads/${remoteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
  },
  async archive(remoteId: string) {
    await fetch(`/api/threads/${remoteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "archived" }),
    });
  },
  async unarchive(remoteId: string) {
    await fetch(`/api/threads/${remoteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "regular" }),
    });
  },
  async generateTitle(remoteId: string, messages: any[]) {
    return createAssistantStream(async (controller) => {
      const response = await fetch(`/api/threads/${remoteId}/title`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      const { title } = await response.json();
      controller.appendText(title);
    });
  },
};

// Main page component with AssistantRuntimeProvider
export default function OrchestratePage() {
  const runtime = useRemoteThreadListRuntime({
    runtimeHook: () => useChatRuntime({
      transport: new AssistantChatTransport({
        api: "/api/orchestrate/chat",
      }),
    }),
    adapter: threadListAdapter,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <OrchestrateContent />
    </AssistantRuntimeProvider>
  );
}