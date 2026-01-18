"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/status-badge";
import {
  ChevronDown,
  ChevronUp,
  Target,
  Code,
  Megaphone,
  TrendingUp,
  Briefcase,
  ExternalLink,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  Loader2,
  AlertTriangle,
  Link as LinkIcon
} from "lucide-react";
import type { Department } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

interface DepartmentCardProps {
  department: Department;
}

const iconMap: Record<string, any> = {
  target: Target,
  code: Code,
  megaphone: Megaphone,
  "trending-up": TrendingUp,
  briefcase: Briefcase
};

const statusColors: Record<string, string> = {
  waiting: "text-gray-500",
  running: "text-blue-500",
  completed: "text-green-500",
  error: "text-red-500",
  needs_auth: "text-yellow-500"
};

export function DepartmentCard({ department }: DepartmentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = iconMap[department.icon] || Target;

  const completedAgents = department.agents.filter(a => a.status === "completed").length;
  const activeAgent = department.agents.find(a => a.status === "working");

  return (
    <Card
      className="overflow-hidden transition-all duration-300 hover:shadow-lg"
      style={{ borderLeft: `4px solid ${department.color}` }}
    >
      {/* Collapsed View */}
      <div
        className="p-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${department.color}15` }}
            >
              <Icon className="h-6 w-6" style={{ color: department.color }} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{department.name}</h3>
              <StatusBadge status={department.status} size="sm" />
            </div>
          </div>
          <Button variant="ghost" size="icon">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{department.progress}%</span>
            </div>
            <Progress value={department.progress} className="h-2" />
          </div>

          {department.timeElapsed && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{department.timeElapsed} elapsed</span>
            </div>
          )}

          {activeAgent && (
            <div className="text-sm">
              <div className="flex items-center gap-2 mb-1">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span className="font-medium">{activeAgent.name}</span>
              </div>
              <p className="text-muted-foreground ml-6">
                {activeAgent.currentTask}
              </p>
            </div>
          )}

          {department.status === "completed" && (
            <p className="text-sm text-green-600 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {department.currentActivity}
            </p>
          )}

          {department.status === "waiting" && department.waitingFor && (
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {department.currentActivity}
            </p>
          )}

          {department.status === "needs_auth" && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                {department.currentActivity}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-sm pt-2 border-t">
            <span className="text-muted-foreground">
              {completedAgents}/{department.agents.length} agents •{" "}
              {department.outputs.filter(o => o.status === "ready").length} outputs
            </span>
            <span className="text-xs text-blue-600 hover:underline">
              {isExpanded ? "Collapse" : "Expand"} ↓
            </span>
          </div>
        </div>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="border-t bg-gray-50/50 p-6 space-y-6 animate-in slide-in-from-top-2 duration-300">
          {/* Progress Section */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              📊 PROGRESS: {department.progress}% Complete
            </h4>
            <div className="space-y-2">
              <Progress value={department.progress} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {department.timeElapsed} elapsed
                {department.estimatedTimeRemaining &&
                  ` • ${department.estimatedTimeRemaining} remaining`}
              </p>
            </div>
            {department.currentActivity && (
              <div className="mt-3 p-3 bg-white rounded-lg border">
                <p className="text-sm">
                  <strong>Current Activity:</strong> {department.currentActivity}
                </p>
              </div>
            )}
          </div>

          {/* Agent Status Section */}
          <div>
            <h4 className="font-semibold mb-3">🤖 AGENT STATUS</h4>
            <div className="space-y-3">
              {department.agents.map((agent) => (
                <div
                  key={agent.id}
                  className="p-4 bg-white rounded-lg border space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={agent.status} size="sm" />
                        <span className="font-medium">{agent.name}</span>
                        {agent.completedAt && (
                          <span className="text-xs text-muted-foreground">
                            (Complete - {agent.completedAt})
                          </span>
                        )}
                        {agent.duration && (
                          <span className="text-xs text-muted-foreground">
                            {agent.duration}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {agent.description}
                      </p>
                      {agent.currentTask && (
                        <p className="text-sm text-blue-600">
                          Currently: {agent.currentTask}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tools Section */}
          <div>
            <h4 className="font-semibold mb-3">🔧 TOOLS & INTEGRATIONS</h4>
            <div className="space-y-3">
              {department.tools.map((tool) => (
                <div
                  key={tool.id}
                  className="p-4 bg-white rounded-lg border space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-8 w-8 rounded flex items-center justify-center ${
                          tool.status === "connected" || tool.status === "in_use"
                            ? "bg-green-100"
                            : "bg-gray-100"
                        }`}
                      >
                        <LinkIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{tool.name}</p>
                        {tool.connectedAs && (
                          <p className="text-xs text-muted-foreground">
                            Connected as {tool.connectedAs}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={
                        tool.status === "connected" || tool.status === "in_use"
                          ? "success"
                          : "secondary"
                      }
                    >
                      {tool.status === "in_use"
                        ? "In Use"
                        : tool.status === "connected"
                        ? "Connected"
                        : "Not Connected"}
                    </Badge>
                  </div>
                  {tool.lastUsed && (
                    <p className="text-xs text-muted-foreground">
                      Last used: {tool.lastUsed}
                    </p>
                  )}
                  {tool.reason && (
                    <p className="text-sm text-yellow-800 bg-yellow-50 p-2 rounded">
                      Why: {tool.reason}
                    </p>
                  )}
                  {tool.status === "disconnected" && (
                    <Button size="sm" className="w-full" variant="outline">
                      Connect Now
                    </Button>
                  )}
                  {tool.url && tool.status !== "disconnected" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full"
                      asChild
                    >
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View in {tool.name} <ExternalLink className="ml-2 h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Outputs Section */}
          {department.outputs.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">
                📄 OUTPUTS ({department.outputs.filter(o => o.status === "ready").length}{" "}
                ready)
              </h4>
              <div className="space-y-3">
                {department.outputs.map((output) => (
                  <div
                    key={output.id}
                    className="p-4 bg-white rounded-lg border space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {output.status === "ready" ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : output.status === "in_progress" ? (
                            <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                          ) : (
                            <Clock className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="font-medium">{output.name}</span>
                        </div>
                        {output.size && (
                          <p className="text-xs text-muted-foreground mb-1">
                            {output.type.toUpperCase()} • {output.size}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Created: {output.createdAt} by {output.createdBy}
                        </p>
                        {output.storedIn && (
                          <p className="text-xs text-muted-foreground">
                            Stored in: {output.storedIn}
                          </p>
                        )}
                      </div>
                    </div>
                    {output.status === "in_progress" && output.progress && (
                      <div>
                        <Progress value={output.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {output.progress}% complete
                        </p>
                      </div>
                    )}
                    {output.status === "ready" && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Download className="mr-2 h-3 w-3" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="mr-2 h-3 w-3" />
                          Preview
                        </Button>
                        {output.url && (
                          <Button size="sm" variant="ghost" asChild>
                            <a
                              href={output.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    )}
                    {output.status === "pending" && (
                      <p className="text-sm text-gray-500">
                        Waiting to start...
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            {department.status === "running" && (
              <Button size="sm" variant="outline">
                ⏸️ Pause
              </Button>
            )}
            {department.status === "error" && (
              <Button size="sm" variant="outline">
                🔄 Retry
              </Button>
            )}
            <Button size="sm" variant="ghost">
              ⚙️ Configure
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
