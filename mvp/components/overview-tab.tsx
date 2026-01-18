"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/status-badge";
import type { Project } from "@/lib/mock-data";
import { Target, Code, Megaphone, TrendingUp, Briefcase, ArrowDown } from "lucide-react";

interface OverviewTabProps {
  project: Project;
}

const iconMap: Record<string, any> = {
  target: Target,
  code: Code,
  megaphone: Megaphone,
  "trending-up": TrendingUp,
  briefcase: Briefcase
};

export function OverviewTab({ project }: OverviewTabProps) {
  const completedDepts = project.departments.filter(d => d.status === "completed").length;
  const runningDepts = project.departments.filter(d => d.status === "running").length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="text-2xl font-bold">{project.totalAgents}</div>
          <div className="text-sm text-muted-foreground">Total Agents</div>
          <div className="text-xs text-green-600 mt-1">
            {project.departments.flatMap(d => d.agents).filter(a => a.status === "completed").length} completed
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-2xl font-bold">{project.totalOutputs}</div>
          <div className="text-sm text-muted-foreground">Outputs Generated</div>
          <div className="text-xs text-blue-600 mt-1">
            {project.departments.flatMap(d => d.outputs).filter(o => o.status === "in_progress").length} in progress
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-2xl font-bold">{project.toolsConnected}</div>
          <div className="text-sm text-muted-foreground">Tools Connected</div>
          <div className="text-xs text-gray-600 mt-1">
            {project.departments.flatMap(d => d.tools).filter(t => t.status === "disconnected").length} disconnected
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-2xl font-bold">{project.timeElapsed}</div>
          <div className="text-sm text-muted-foreground">Time Elapsed</div>
          <div className="text-xs text-gray-600 mt-1">
            ~{Math.max(...project.departments.map(d => parseInt(d.estimatedTimeRemaining || "0")))}m remaining
          </div>
        </Card>
      </div>

      {/* Department Status Overview */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Department Status</h3>
        <div className="space-y-4">
          {project.departments.map((dept) => {
            const Icon = iconMap[dept.icon] || Target;
            return (
              <div key={dept.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${dept.color}15` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: dept.color }} />
                    </div>
                    <div>
                      <div className="font-medium">{dept.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {dept.agents.filter(a => a.status === "completed").length}/
                        {dept.agents.length} agents • {dept.outputs.filter(o => o.status === "ready").length} outputs
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={dept.status} size="sm" />
                    <span className="text-sm font-medium w-12 text-right">
                      {dept.progress}%
                    </span>
                  </div>
                </div>
                <Progress value={dept.progress} className="h-2" />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Timeline View */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-6">Execution Timeline</h3>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

          <div className="space-y-6">
            {project.departments.map((dept, index) => {
              const Icon = iconMap[dept.icon] || Target;
              const isActive = dept.status === "running";
              const isCompleted = dept.status === "completed";
              const isWaiting = dept.status === "waiting";

              return (
                <div key={dept.id} className="relative pl-12">
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-0 w-8 h-8 rounded-full border-4 flex items-center justify-center ${
                      isCompleted
                        ? "bg-green-500 border-green-200"
                        : isActive
                        ? "bg-blue-500 border-blue-200 animate-pulse"
                        : "bg-gray-300 border-gray-200"
                    }`}
                    style={{ borderColor: isActive || isCompleted ? dept.color : undefined }}
                  >
                    <Icon
                      className="h-4 w-4 text-white"
                    />
                  </div>

                  {/* Arrow between items */}
                  {index < project.departments.length - 1 && (
                    <div className="absolute left-3 top-8 text-gray-400">
                      <ArrowDown className="h-4 w-4" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold">{dept.name}</h4>
                      <StatusBadge status={dept.status} size="sm" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {dept.currentActivity}
                    </p>
                    {dept.timeElapsed && (
                      <p className="text-xs text-gray-500">
                        Time: {dept.timeElapsed}
                      </p>
                    )}
                    {dept.waitingFor && (
                      <p className="text-xs text-yellow-600 mt-1">
                        Waiting for: {dept.waitingFor}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}
