"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Play,
  Pause,
  CheckCircle2,
  Clock,
  Loader2,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  Zap,
  Megaphone,
  Code,
  TrendingUp,
  Briefcase,
  Target,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export type DepartmentStatus = "idle" | "ready" | "running" | "completed" | "error";

export interface DepartmentAgent {
  id: string;
  name: string;
  status: "idle" | "running" | "completed" | "error";
  progress?: number;
  currentTask?: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  status: DepartmentStatus;
  progress: number;
  agents: DepartmentAgent[];
  requiredContext?: string[];
  hasContext?: boolean;
}

interface DepartmentPanelProps {
  departments: Department[];
  onRunDepartment: (departmentId: string) => void;
  onPauseDepartment?: (departmentId: string) => void;
  onExpandDepartment?: (departmentId: string) => void;
  className?: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  target: Target,
  code: Code,
  megaphone: Megaphone,
  "trending-up": TrendingUp,
  briefcase: Briefcase,
};

export function DepartmentPanel({
  departments,
  onRunDepartment,
  onPauseDepartment,
  onExpandDepartment,
  className,
}: DepartmentPanelProps) {
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());

  const toggleExpand = (deptId: string) => {
    setExpandedDepts((prev) => {
      const next = new Set(prev);
      if (next.has(deptId)) {
        next.delete(deptId);
      } else {
        next.add(deptId);
      }
      return next;
    });
  };

  const completedCount = departments.filter((d) => d.status === "completed").length;
  const runningCount = departments.filter((d) => d.status === "running").length;
  const overallProgress = departments.length > 0
    ? Math.round(
        departments.reduce((acc, d) => acc + d.progress, 0) / departments.length
      )
    : 0;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="border-b px-4 py-3 bg-background shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            AI Departments
          </h3>
          <Badge variant="secondary" className="text-xs">
            {completedCount}/{departments.length}
          </Badge>
        </div>
        {runningCount > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-1.5" />
          </div>
        )}
      </div>

      {/* Department List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          <TooltipProvider delayDuration={300}>
            {departments.map((dept) => (
              <DepartmentCard
                key={dept.id}
                department={dept}
                isExpanded={expandedDepts.has(dept.id)}
                onToggleExpand={() => toggleExpand(dept.id)}
                onRun={() => onRunDepartment(dept.id)}
                onPause={() => onPauseDepartment?.(dept.id)}
                onExpand={() => onExpandDepartment?.(dept.id)}
              />
            ))}
          </TooltipProvider>
        </div>
      </ScrollArea>
    </div>
  );
}

interface DepartmentCardProps {
  department: Department;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRun: () => void;
  onPause?: () => void;
  onExpand?: () => void;
}

function DepartmentCard({
  department,
  isExpanded,
  onToggleExpand,
  onRun,
  onPause,
  onExpand,
}: DepartmentCardProps) {
  const Icon = department.icon;
  const isReady = department.status === "ready" || department.hasContext;
  const isRunning = department.status === "running";
  const isCompleted = department.status === "completed";
  const isError = department.status === "error";
  const isIdle = department.status === "idle" && !department.hasContext;

  const completedAgents = department.agents.filter((a) => a.status === "completed").length;
  const runningAgent = department.agents.find((a) => a.status === "running");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          "overflow-hidden transition-all duration-200",
          isRunning && "ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/10",
          isCompleted && "ring-2 ring-green-500/30",
          isReady && !isRunning && !isCompleted && "ring-2 ring-yellow-500/30"
        )}
      >
        {/* Main Card Content */}
        <div
          className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={onToggleExpand}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div
              className={cn(
                "p-2.5 rounded-xl transition-all",
                isRunning && "animate-pulse"
              )}
              style={{
                backgroundColor: `${department.color}15`,
                boxShadow: isRunning ? `0 0 20px ${department.color}30` : undefined,
              }}
            >
              <Icon
                className="h-5 w-5"
                style={{ color: department.color }}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-medium text-sm truncate">{department.name}</h4>
                <div className="flex items-center gap-1 shrink-0">
                  <StatusIndicator status={department.status} hasContext={department.hasContext} />
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {department.description}
              </p>

              {/* Progress Bar */}
              {(isRunning || isCompleted) && (
                <div className="mt-2">
                  <Progress
                    value={department.progress}
                    className="h-1"
                  />
                  <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                    <span>
                      {completedAgents}/{department.agents.length} agents
                    </span>
                    <span>{department.progress}%</span>
                  </div>
                </div>
              )}

              {/* Running Agent Indicator */}
              {runningAgent && (
                <div className="flex items-center gap-1.5 mt-2 text-xs">
                  <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                  <span className="text-blue-600 font-medium truncate">
                    {runningAgent.name}
                  </span>
                  {runningAgent.currentTask && (
                    <span className="text-muted-foreground truncate">
                      — {runningAgent.currentTask}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1">
              {department.agents.slice(0, 4).map((agent) => (
                <Tooltip key={agent.id}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        agent.status === "completed" && "bg-green-500",
                        agent.status === "running" && "bg-blue-500 animate-pulse",
                        agent.status === "error" && "bg-red-500",
                        agent.status === "idle" && "bg-gray-300"
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    {agent.name}: {agent.status}
                  </TooltipContent>
                </Tooltip>
              ))}
              {department.agents.length > 4 && (
                <span className="text-xs text-muted-foreground ml-1">
                  +{department.agents.length - 4}
                </span>
              )}
            </div>

            {isRunning ? (
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onPause?.();
                }}
              >
                <Pause className="h-3 w-3" />
                Pause
              </Button>
            ) : isCompleted ? (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1 text-green-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onExpand?.();
                }}
              >
                <CheckCircle2 className="h-3 w-3" />
                View
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant={isReady ? "default" : "outline"}
                    className={cn(
                      "h-7 gap-1",
                      isReady && "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    )}
                    disabled={isIdle}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRun();
                    }}
                  >
                    <Play className="h-3 w-3" />
                    {isReady ? "Run" : "Waiting..."}
                  </Button>
                </TooltipTrigger>
                {isIdle && (
                  <TooltipContent side="left" className="max-w-xs">
                    <p className="text-xs">
                      Chat with openpreneurship to provide context for this department
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            )}
          </div>
        </div>

        {/* Expanded Agent List */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t bg-muted/30"
            >
              <div className="p-3 space-y-2">
                {department.agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <AgentStatusIcon status={agent.status} />
                    <span className={cn(
                      agent.status === "running" && "text-blue-600 font-medium",
                      agent.status === "completed" && "text-green-600",
                      agent.status === "error" && "text-red-600"
                    )}>
                      {agent.name}
                    </span>
                    {agent.status === "running" && agent.progress !== undefined && (
                      <span className="text-xs text-muted-foreground ml-auto">
                        {agent.progress}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

function StatusIndicator({ status, hasContext }: { status: DepartmentStatus; hasContext?: boolean }) {
  if (status === "running") {
    return (
      <Badge variant="secondary" className="h-5 px-1.5 gap-1 bg-blue-100 text-blue-700">
        <Loader2 className="h-3 w-3 animate-spin" />
        Running
      </Badge>
    );
  }
  if (status === "completed") {
    return (
      <Badge variant="secondary" className="h-5 px-1.5 gap-1 bg-green-100 text-green-700">
        <CheckCircle2 className="h-3 w-3" />
        Done
      </Badge>
    );
  }
  if (status === "error") {
    return (
      <Badge variant="secondary" className="h-5 px-1.5 gap-1 bg-red-100 text-red-700">
        <AlertCircle className="h-3 w-3" />
        Error
      </Badge>
    );
  }
  if (status === "ready" || hasContext) {
    return (
      <Badge variant="secondary" className="h-5 px-1.5 gap-1 bg-yellow-100 text-yellow-700">
        <Zap className="h-3 w-3" />
        Ready
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="h-5 px-1.5 gap-1">
      <Clock className="h-3 w-3" />
      Waiting
    </Badge>
  );
}

function AgentStatusIcon({ status }: { status: string }) {
  switch (status) {
    case "running":
      return <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />;
    case "completed":
      return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />;
    case "error":
      return <AlertCircle className="h-3.5 w-3.5 text-red-500" />;
    default:
      return <Clock className="h-3.5 w-3.5 text-gray-400" />;
  }
}

// Default departments configuration
export const DEFAULT_DEPARTMENTS: Department[] = [
  {
    id: "dept_business",
    name: "Business Strategy",
    description: "Define business model, market positioning, and financial projections",
    icon: Target,
    color: "#3B82F6",
    status: "idle",
    progress: 0,
    agents: [
      { id: "agent_strategist", name: "Strategist", status: "idle" },
      { id: "agent_analyst", name: "Market Analyst", status: "idle" },
    ],
  },
  {
    id: "dept_engineering",
    name: "Software Engineering",
    description: "Build technical architecture and core product",
    icon: Code,
    color: "#8B5CF6",
    status: "idle",
    progress: 0,
    agents: [
      { id: "agent_architect", name: "Architect", status: "idle" },
      { id: "agent_developer", name: "Developer", status: "idle" },
    ],
  },
  {
    id: "dept_marketing",
    name: "Marketing & Brand",
    description: "Create brand identity, visual design, content, and social media strategy",
    icon: Megaphone,
    color: "#EC4899",
    status: "idle",
    progress: 0,
    agents: [
      { id: "agent_brand_strategist", name: "Brand Strategist", status: "idle" },
      { id: "agent_designer", name: "Designer", status: "idle" },
      { id: "agent_content_writer", name: "Content Writer", status: "idle" },
      { id: "agent_social_media", name: "Social Media", status: "idle" },
    ],
  },
  {
    id: "dept_sales",
    name: "Sales & Growth",
    description: "Develop sales strategy and growth playbook",
    icon: TrendingUp,
    color: "#10B981",
    status: "idle",
    progress: 0,
    agents: [
      { id: "agent_sales", name: "Sales Strategist", status: "idle" },
      { id: "agent_growth", name: "Growth Hacker", status: "idle" },
    ],
  },
  {
    id: "dept_operations",
    name: "Operations & Finance",
    description: "Set up operational processes and financial systems",
    icon: Briefcase,
    color: "#F59E0B",
    status: "idle",
    progress: 0,
    agents: [
      { id: "agent_ops", name: "Ops Manager", status: "idle" },
      { id: "agent_finance", name: "Finance Manager", status: "idle" },
    ],
  },
];
