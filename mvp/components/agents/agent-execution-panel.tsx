"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Wrench,
  MessageSquare,
  Clock,
} from "lucide-react";
import type { AgentExecutionState, AgentStep, ToolCallEvent } from "@/lib/ai/types";

interface AgentExecutionPanelProps {
  agents: Record<string, AgentExecutionState>;
  steps: AgentStep[];
  toolCalls: ToolCallEvent[];
  isRunning: boolean;
  onStart?: () => void;
  onPause?: () => void;
  onReset?: () => void;
}

export function AgentExecutionPanel({
  agents,
  steps,
  toolCalls,
  isRunning,
  onStart,
  onPause,
  onReset,
}: AgentExecutionPanelProps) {
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());

  const toggleAgent = (agentId: string) => {
    const newExpanded = new Set(expandedAgents);
    if (newExpanded.has(agentId)) {
      newExpanded.delete(agentId);
    } else {
      newExpanded.add(agentId);
    }
    setExpandedAgents(newExpanded);
  };

  const agentList = Object.values(agents);
  const completedAgents = agentList.filter((a) => a.status === "completed").length;
  const totalProgress =
    agentList.length > 0
      ? agentList.reduce((sum, a) => sum + a.progress, 0) / agentList.length
      : 0;

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Agent Execution</h3>
          <p className="text-sm text-muted-foreground">
            {completedAgents}/{agentList.length} agents completed
          </p>
        </div>
        <div className="flex gap-2">
          {!isRunning ? (
            <Button size="sm" onClick={onStart} disabled={isRunning}>
              <Play className="h-4 w-4 mr-1" />
              Start
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={onPause}>
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="px-4 py-3 border-b bg-muted/30">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Overall Progress</span>
          <span className="font-medium">{Math.round(totalProgress)}%</span>
        </div>
        <Progress value={totalProgress} className="h-2" />
      </div>

      {/* Agent List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          <AnimatePresence>
            {agentList.map((agent) => (
              <AgentCard
                key={agent.agentId}
                agent={agent}
                toolCalls={toolCalls.filter(
                  (tc) =>
                    steps.find(
                      (s) =>
                        s.toolCall?.id === tc.id &&
                        s.type === "tool_call"
                    ) !== undefined
                )}
                steps={steps}
                isExpanded={expandedAgents.has(agent.agentId)}
                onToggle={() => toggleAgent(agent.agentId)}
              />
            ))}
          </AnimatePresence>

          {agentList.length === 0 && !isRunning && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No agents running yet</p>
              <p className="text-sm">Click Start to begin execution</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}

interface AgentCardProps {
  agent: AgentExecutionState;
  toolCalls: ToolCallEvent[];
  steps: AgentStep[];
  isExpanded: boolean;
  onToggle: () => void;
}

function AgentCard({
  agent,
  toolCalls,
  steps,
  isExpanded,
  onToggle,
}: AgentCardProps) {
  const statusIcon = {
    idle: <Clock className="h-4 w-4 text-gray-400" />,
    running: <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />,
    completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    error: <AlertCircle className="h-4 w-4 text-red-500" />,
    waiting_approval: <Clock className="h-4 w-4 text-yellow-500" />,
  };

  const statusColor = {
    idle: "bg-gray-100 text-gray-700",
    running: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    error: "bg-red-100 text-red-700",
    waiting_approval: "bg-yellow-100 text-yellow-700",
  };

  // Filter tool calls for this agent
  const agentToolCalls = toolCalls.filter((tc) =>
    agent.steps?.some((s) => s.toolCall?.id === tc.id)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="border rounded-lg overflow-hidden"
    >
      {/* Agent Header */}
      <div
        className="p-3 flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        <button className="text-muted-foreground">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {statusIcon[agent.status]}

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{agent.agentName}</span>
            <Badge variant="secondary" className={statusColor[agent.status]}>
              {agent.status}
            </Badge>
          </div>
          {agent.currentStep && (
            <p className="text-sm text-muted-foreground truncate">
              {agent.currentStep}
            </p>
          )}
        </div>

        <div className="text-right">
          <span className="text-sm font-medium">{agent.progress}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-3 pb-2">
        <Progress value={agent.progress} className="h-1" />
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t bg-muted/20"
          >
            <div className="p-3 space-y-3">
              {/* Tool Calls */}
              {agentToolCalls.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    Tool Calls
                  </h4>
                  <div className="space-y-2">
                    {agentToolCalls.map((tc) => (
                      <ToolCallCard key={tc.id} toolCall={tc} />
                    ))}
                  </div>
                </div>
              )}

              {/* Text Output */}
              {agent.steps?.filter((s) => s.type === "text_output").length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Thinking
                  </h4>
                  <div className="bg-background p-3 rounded text-sm max-h-48 overflow-y-auto">
                    {agent.steps
                      ?.filter((s) => s.type === "text_output")
                      .map((s) => s.content)
                      .join("")}
                  </div>
                </div>
              )}

              {agentToolCalls.length === 0 &&
                !agent.steps?.some((s) => s.type === "text_output") && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No activity yet
                  </p>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface ToolCallCardProps {
  toolCall: ToolCallEvent;
}

function ToolCallCard({ toolCall }: ToolCallCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const statusIcon = {
    pending: <Clock className="h-3 w-3 text-gray-400" />,
    running: <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />,
    completed: <CheckCircle2 className="h-3 w-3 text-green-500" />,
    error: <AlertCircle className="h-3 w-3 text-red-500" />,
  };

  const duration = toolCall.completedAt
    ? Math.round(
        (new Date(toolCall.completedAt).getTime() -
          new Date(toolCall.startedAt).getTime()) /
          1000
      )
    : null;

  return (
    <div className="bg-background border rounded p-2">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        {statusIcon[toolCall.status]}
        <code className="text-xs font-mono flex-1">{toolCall.toolName}</code>
        {duration !== null && (
          <span className="text-xs text-muted-foreground">{duration}s</span>
        )}
        <ChevronDown
          className={`h-3 w-3 text-muted-foreground transition-transform ${
            showDetails ? "rotate-180" : ""
          }`}
        />
      </div>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-2 pt-2 border-t"
          >
            <div className="space-y-2">
              <div>
                <span className="text-xs text-muted-foreground">Input:</span>
                <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto max-h-24 overflow-y-auto">
                  {JSON.stringify(toolCall.args, null, 2)}
                </pre>
              </div>
              {toolCall.result !== undefined && (
                <div>
                  <span className="text-xs text-muted-foreground">Output:</span>
                  <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto max-h-24 overflow-y-auto">
                    {typeof toolCall.result === 'string' ? toolCall.result : JSON.stringify(toolCall.result, null, 2)}
                  </pre>
                </div>
              )}
              {toolCall.error && (
                <div>
                  <span className="text-xs text-red-500">Error:</span>
                  <pre className="text-xs bg-red-50 text-red-700 p-2 rounded mt-1">
                    {String(toolCall.error)}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
