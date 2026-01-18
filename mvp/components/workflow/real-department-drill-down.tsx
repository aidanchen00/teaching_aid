"use client";

import { WorkflowNode } from "@/lib/types";
import type { AgentExecutionState, AgentStep, ToolCallEvent } from "@/lib/ai/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  X,
  ChevronLeft,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Wrench,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ToolCallWithAgent extends ToolCallEvent {
  agentId: string;
}

interface RealDepartmentDrillDownProps {
  department: WorkflowNode;
  agents: Record<string, AgentExecutionState>;
  steps: AgentStep[];
  toolCalls: ToolCallWithAgent[];
  isRunning: boolean;
  onClose: () => void;
}

export function RealDepartmentDrillDown({
  department,
  agents,
  steps,
  toolCalls,
  isRunning,
  onClose,
}: RealDepartmentDrillDownProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());
  const [expandedToolCalls, setExpandedToolCalls] = useState<Set<string>>(new Set());

  const toggleAgent = (agentId: string) => {
    setExpandedAgents((prev) => {
      const next = new Set(prev);
      if (next.has(agentId)) {
        next.delete(agentId);
      } else {
        next.add(agentId);
      }
      return next;
    });
  };

  const toggleToolCall = (toolCallId: string) => {
    setExpandedToolCalls((prev) => {
      const next = new Set(prev);
      if (next.has(toolCallId)) {
        next.delete(toolCallId);
      } else {
        next.add(toolCallId);
      }
      return next;
    });
  };

  const agentList = Object.values(agents);
  const completedCount = agentList.filter((a) => a.status === "completed").length;
  const runningCount = agentList.filter((a) => a.status === "running").length;
  const overallProgress = agentList.length > 0 
    ? Math.round((completedCount / agentList.length) * 100)
    : 0;

  const getAgentToolCalls = (agentId: string) =>
    toolCalls.filter((tc) => tc.agentId === agentId);

  const statusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "running":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div
      className={cn(
        "fixed bg-white shadow-2xl z-50 flex flex-col",
        isFullscreen
          ? "inset-0"
          : "inset-4 md:inset-8 lg:inset-16 rounded-xl border"
      )}
    >
      {/* Header */}
      <div className="border-b bg-white px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded"
                style={{ backgroundColor: department.color }}
              />
              <h2 className="text-lg font-bold">{department.label}</h2>
              <Badge
                variant={isRunning ? "secondary" : "default"}
                className="text-xs"
              >
                {isRunning ? "Running" : completedCount === agentList.length ? "Completed" : "Pending"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {completedCount}/{agentList.length} agents completed
              {runningCount > 0 && ` • ${runningCount} running`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? (
              <Minimize2 className="h-3 w-3" />
            ) : (
              <Maximize2 className="h-3 w-3" />
            )}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-2 border-b bg-muted/30">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-muted-foreground">Overall Progress</span>
          <span className="font-medium">{overallProgress}%</span>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-auto p-4 space-y-4">
          {agentList.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin" />
              <p>Waiting for agents to start...</p>
            </div>
          ) : (
            agentList.map((agent) => (
              <Card key={agent.agentId} className="overflow-hidden">
                {/* Agent Header */}
                <div
                  className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleAgent(agent.agentId)}
                >
                  <div className="flex items-center gap-3">
                    {statusIcon(agent.status)}
                    <div>
                      <p className="font-medium">{agent.agentName}</p>
                      <p className="text-xs text-muted-foreground">
                        {getAgentToolCalls(agent.agentId).length} tool calls
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {agent.status}
                    </Badge>
                    {expandedAgents.has(agent.agentId) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </div>

                {/* Agent Details */}
                <AnimatePresence>
                  {expandedAgents.has(agent.agentId) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t"
                    >
                      <div className="p-3 space-y-3 bg-muted/20">
                        {/* Tool Calls */}
                        {getAgentToolCalls(agent.agentId).map((tc) => (
                          <div
                            key={tc.id}
                            className="bg-white rounded-lg border overflow-hidden"
                          >
                            <div
                              className="p-2 flex items-center justify-between cursor-pointer hover:bg-muted/30"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleToolCall(tc.id);
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <Wrench className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm font-mono">{tc.toolName}</span>
                                {tc.status === "running" && (
                                  <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                                )}
                                {tc.status === "completed" && (
                                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                                )}
                                {tc.status === "error" && (
                                  <AlertCircle className="h-3 w-3 text-red-500" />
                                )}
                              </div>
                              {expandedToolCalls.has(tc.id) ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <ChevronRight className="h-3 w-3" />
                              )}
                            </div>

                            <AnimatePresence>
                              {expandedToolCalls.has(tc.id) && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="border-t"
                                >
                                  <div className="p-2 space-y-2">
                                    {tc.args && Object.keys(tc.args).length > 0 && (
                                      <div>
                                        <p className="text-xs font-medium text-muted-foreground mb-1">
                                          Input
                                        </p>
                                        <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-32">
                                          {JSON.stringify(tc.args, null, 2)}
                                        </pre>
                                      </div>
                                    )}
                                    {tc.result !== undefined && (
                                      <div>
                                        <p className="text-xs font-medium text-muted-foreground mb-1">
                                          Output
                                        </p>
                                        <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-32">
                                          {typeof tc.result === "string"
                                            ? tc.result
                                            : JSON.stringify(tc.result as object, null, 2)}
                                        </pre>
                                      </div>
                                    )}
                                    {tc.error && (
                                      <div>
                                        <p className="text-xs font-medium text-red-500 mb-1">
                                          Error
                                        </p>
                                        <pre className="text-xs bg-red-50 text-red-700 p-2 rounded">
                                          {String(tc.error)}
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}

                        {getAgentToolCalls(agent.agentId).length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-2">
                            No tool calls yet
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            ))
          )}
      </div>
    </div>
  );
}
