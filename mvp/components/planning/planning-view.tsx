"use client";

import { useState } from "react";
import { Plan } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WorkflowGraph } from "@/components/workflow/workflow-graph";
import { DepartmentDrillDown } from "@/components/workflow/department-drill-down";
import { departmentAgentWorkflows } from "@/lib/agent-workflows";
import { WorkflowGraph as WorkflowGraphType } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Edit3,
  Clock,
  Users,
  Zap,
  X
} from "lucide-react";

interface PlanningViewProps {
  plan: Plan;
  onApprove: () => void;
  onModify: () => void;
  onReject: () => void;
  customAgentWorkflows?: Record<string, WorkflowGraphType>;
}

interface OpenDepartment {
  id: string;
  node: any;
}

export function PlanningView({
  plan,
  onApprove,
  onModify,
  onReject,
  customAgentWorkflows
}: PlanningViewProps) {
  const [openDepartments, setOpenDepartments] = useState<OpenDepartment[]>([]);
  const [activeDepartmentId, setActiveDepartmentId] = useState<string | null>(null);

  // Use custom workflows if provided, otherwise fall back to defaults
  const agentWorkflows = customAgentWorkflows || departmentAgentWorkflows;

  const totalAgents = plan.workflow.nodes.filter(n => n.type === 'agent').length;
  const requiredIntegrations = plan.integrations.filter(i => i.required).length;

  const activeDepartment = activeDepartmentId
    ? openDepartments.find(d => d.id === activeDepartmentId)
    : null;

  const handleNodeClick = (nodeId: string) => {
    const node = plan.workflow.nodes.find(n => n.id === nodeId);
    if (node && node.type === "department") {
      const alreadyOpen = openDepartments.find(d => d.id === nodeId);
      if (!alreadyOpen) {
        setOpenDepartments(prev => [...prev, { id: nodeId, node }]);
      }
      setActiveDepartmentId(nodeId);
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
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header - Scrollable */}
      <div className="flex-1 overflow-y-auto flex flex-col pt-4">
        <div className="border-b bg-card p-6 flex-shrink-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
              <p className="text-muted-foreground">{plan.description}</p>
            </div>
            <Badge variant="secondary" className="text-sm">
              Draft Plan
            </Badge>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{plan.workflow.nodes.length}</span>
              <span className="text-muted-foreground">departments</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{totalAgents}</span>
              <span className="text-muted-foreground">agents</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{plan.estimatedTime}</span>
              <span className="text-muted-foreground">estimated</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{requiredIntegrations}</span>
              <span className="text-muted-foreground">integrations needed</span>
            </div>
          </div>
        </div>

        {/* Workflow Visualization */}
        <div className="flex-1 relative min-h-[600px]">
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
        <div className="absolute bottom-0 left-0 right-0 bg-card border-t shadow-lg z-40">
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
      {activeDepartment && agentWorkflows[activeDepartment.id] && (
        <DepartmentDrillDown
          department={activeDepartment.node}
          agentWorkflow={agentWorkflows[activeDepartment.id]}
          onClose={() => closeDepartment(activeDepartment.id)}
        />
      )}

      {/* Action Buttons */}
      <div className="border-t bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Review the plan above. You can approve it to proceed, or modify the structure.
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onReject}>
              Start Over
            </Button>
            <Button variant="outline" onClick={onModify}>
              <Edit3 className="mr-2 h-4 w-4" />
              Modify Plan
            </Button>
            <Button onClick={onApprove}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve & Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
