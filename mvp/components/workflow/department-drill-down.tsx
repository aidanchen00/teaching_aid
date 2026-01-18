"use client";

import { WorkflowGraph, WorkflowNode } from "@/lib/types";
import { WorkflowGraph as WorkflowGraphComponent } from "./workflow-graph";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, ChevronLeft, Maximize2, Minimize2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface DepartmentDrillDownProps {
  department: WorkflowNode;
  agentWorkflow: WorkflowGraph;
  onClose: () => void;
}

export function DepartmentDrillDown({
  department,
  agentWorkflow,
  onClose
}: DepartmentDrillDownProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const selectedAgent = selectedAgentId
    ? agentWorkflow.nodes.find(n => n.id === selectedAgentId)
    : null;

  const completedAgents = agentWorkflow.nodes.filter(n => n.status === "completed").length;
  const runningAgents = agentWorkflow.nodes.filter(n => n.status === "running").length;

  return (
    <div
      className={cn(
        "fixed bg-white shadow-2xl z-50 flex flex-col overflow-hidden",
        isFullscreen
          ? "inset-0"
          : "inset-4 md:inset-8 lg:inset-16 rounded-xl border"
      )}
    >
      {/* Header - Compact */}
      <div className="border-b bg-white px-4 py-3 flex items-center justify-between flex-shrink-0">
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
              <h2 className="text-lg font-bold">{department.label}</h2>
              <Badge variant={
                department.status === "completed" ? "default" :
                department.status === "running" ? "secondary" :
                "outline"
              } className="text-xs">
                {department.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground">
            {completedAgents}/{agentWorkflow.nodes.length} agents
            {runningAgents > 0 && ` • ${runningAgents} running`}
          </div>
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

      {/* Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Workflow Graph */}
        <div className="flex-1 relative">
          <WorkflowGraphComponent
            workflow={agentWorkflow}
            onNodeClick={setSelectedAgentId}
            interactive={true}
            showMinimap={true}
            useAgentNodes={true}
          />
        </div>

        {/* Agent Details Sidebar */}
        {selectedAgent && (
          <div className="w-80 border-l bg-gray-50 flex flex-col overflow-y-auto">
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{selectedAgent.label}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedAgentId(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Badge variant={
                selectedAgent.status === "completed" ? "default" :
                selectedAgent.status === "running" ? "secondary" :
                selectedAgent.status === "needs_auth" ? "destructive" :
                "outline"
              }>
                {selectedAgent.status}
              </Badge>
            </div>

            <div className="p-4 space-y-4">
              {/* Description */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Role</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedAgent.description}
                </p>
              </div>

              {/* Progress */}
              {selectedAgent.progress !== undefined && selectedAgent.progress > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Progress</h4>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {selectedAgent.status === "completed" ? "Completed" : "Working..."}
                      </span>
                      <span className="font-medium">{selectedAgent.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${selectedAgent.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tools */}
              {selectedAgent.tools && selectedAgent.tools.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Tools Used</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.tools.map(tool => (
                      <Badge key={tool} variant="secondary">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Inputs/Outputs */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Inputs</h4>
                <div className="space-y-1">
                  {agentWorkflow.edges
                    .filter(e => e.target === selectedAgent.id)
                    .map(edge => {
                      const sourceNode = agentWorkflow.nodes.find(n => n.id === edge.source);
                      return (
                        <div key={edge.id} className="text-sm p-2 bg-white rounded border">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <span className="font-medium">{sourceNode?.label}</span>
                          </div>
                          <div className="text-xs text-muted-foreground ml-4">
                            {edge.label}
                          </div>
                        </div>
                      );
                    })}
                  {agentWorkflow.edges.filter(e => e.target === selectedAgent.id).length === 0 && (
                    <p className="text-sm text-muted-foreground">No inputs (starting node)</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Outputs</h4>
                <div className="space-y-1">
                  {agentWorkflow.edges
                    .filter(e => e.source === selectedAgent.id)
                    .map(edge => {
                      const targetNode = agentWorkflow.nodes.find(n => n.id === edge.target);
                      return (
                        <div key={edge.id} className="text-sm p-2 bg-white rounded border">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                            <span className="font-medium">{targetNode?.label}</span>
                          </div>
                          <div className="text-xs text-muted-foreground ml-4">
                            {edge.label}
                          </div>
                        </div>
                      );
                    })}
                  {agentWorkflow.edges.filter(e => e.source === selectedAgent.id).length === 0 && (
                    <p className="text-sm text-muted-foreground">No outputs (ending node)</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold mb-2">Actions</h4>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    View Logs
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    View Outputs
                  </Button>
                  {selectedAgent.status === "running" && (
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Pause Agent
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="border-t bg-gray-50 px-4 py-2 flex items-center justify-between text-xs flex-shrink-0">
        <div className="text-muted-foreground">
          {agentWorkflow.nodes.length} agents • {agentWorkflow.edges.length} dependencies
        </div>
        <div className="text-muted-foreground">
          {selectedAgent ? "Click X to close details" : "Click agent for details • Drag to rearrange"}
        </div>
      </div>
    </div>
  );
}
