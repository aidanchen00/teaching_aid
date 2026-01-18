"use client"

import { useState, useMemo, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Play, ArrowLeft } from "lucide-react"
import { WorkflowNavigator } from "../workflow/workflow-navigator"
import { WorkflowCanvas } from "../workflow/workflow-canvas"
import { ContextPanel } from "../workflow/context-panel"
import { RunSetup, type RunConfig } from "./run-setup"
import type { WorkflowSet } from "../openpreneurship-orchestrator"
import type { WorkflowSetResponse } from "@/lib/api"

interface WorkflowInspectionProps {
  workflowSet: WorkflowSet
  workflowDetails?: WorkflowSetResponse | null
  onRunSetup: (config: RunConfig) => void
  onBack: () => void
  initialIntent?: string
}

export type WorkflowStatus = "draft" | "ready" | "running"

export interface Workflow {
  id: string
  name: string
  status: WorkflowStatus
  steps: WorkflowStep[]
  n8n_workflow_id?: string
  n8n_json?: Record<string, unknown>
}

export interface WorkflowStep {
  id: string
  name: string
  purpose: string
  inputs: string[]
  outputs: string[]
}

export function WorkflowInspection({ workflowSet, workflowDetails, onRunSetup, onBack, initialIntent = "" }: WorkflowInspectionProps) {
  const [showRunSetup, setShowRunSetup] = useState(false)

  // Use workflow details from API if available, otherwise create from workflowSet
  const workflows = useMemo<Workflow[]>(() => {
    if (workflowDetails?.workflows) {
      return workflowDetails.workflows.map((wf) => ({
        id: wf.id,
        name: wf.name,
        status: wf.status as WorkflowStatus,
        steps: wf.steps.map((step) => ({
          id: step.id,
          name: step.name,
          purpose: step.purpose,
          inputs: step.inputs,
          outputs: step.outputs,
        })),
        n8n_workflow_id: wf.n8n_workflow_id,
        n8n_json: wf.n8n_json,
      }))
    }

    // Fallback to creating from workflowSet names
    return workflowSet.workflows.map((name, index) => ({
      id: `workflow-${index}`,
      name,
      status: "ready" as WorkflowStatus,
      steps: [
        {
          id: `step-1`,
          name: "Analyze Context",
          purpose: "Review current state and requirements",
          inputs: ["User intent", "System state"],
          outputs: ["Analysis report"],
        },
        {
          id: `step-2`,
          name: "Generate Plan",
          purpose: "Create actionable execution plan",
          inputs: ["Analysis report"],
          outputs: ["Execution plan"],
        },
        {
          id: `step-3`,
          name: "Execute Actions",
          purpose: "Perform required operations",
          inputs: ["Execution plan"],
          outputs: ["Results"],
        },
        {
          id: `step-4`,
          name: "Validate Output",
          purpose: "Ensure quality and completeness",
          inputs: ["Results"],
          outputs: ["Validated output"],
        },
      ],
    }))
  }, [workflowDetails, workflowSet])

  const [activeWorkflowId, setActiveWorkflowId] = useState<string>("")
  const [activeTab, setActiveTab] = useState<"overview" | "inputs" | "outputs" | "logic" | "json">("overview")
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([])

  // Set initial active workflow when workflows change
  useEffect(() => {
    if (workflows.length > 0 && !activeWorkflowId) {
      setActiveWorkflowId(workflows[0].id)
    }
  }, [workflows, activeWorkflowId])

  const activeWorkflow = workflows.find((w) => w.id === activeWorkflowId) || workflows[0]

  // Don't render until we have an active workflow
  if (!activeWorkflow) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground hover:text-foreground hover:bg-muted/50">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h2 className="font-semibold text-lg text-foreground">Workflow Design</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {workflowSet.title} • {workflows.length} workflows
              </p>
            </div>
          </div>
          <Button onClick={() => setShowRunSetup(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
            <Play className="h-4 w-4 mr-2" />
            Run Setup
          </Button>
        </div>
      </div>

      {/* Main Content - Three Panel Layout */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Left: Workflow Navigator */}
        <WorkflowNavigator
          workflows={workflows}
          activeWorkflowId={activeWorkflowId}
          onSelectWorkflow={setActiveWorkflowId}
        />

        {/* Center: Workflow Canvas */}
        <WorkflowCanvas workflow={activeWorkflow} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Right: Context/Chat Panel */}
        <ContextPanel
          workflow={activeWorkflow}
          messages={messages}
          onSendMessage={(content) => {
            setMessages([...messages, { role: "user", content }])
            // Simulate response
            setTimeout(() => {
              setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Workflow updated based on your feedback." },
              ])
            }, 500)
          }}
        />
      </div>

      {/* Run Setup Modal (3B) */}
      <RunSetup
        isOpen={showRunSetup}
        onClose={() => setShowRunSetup(false)}
        onExecute={(config) => {
          setShowRunSetup(false)
          onRunSetup(config)
        }}
        initialIntent={initialIntent}
      />
    </motion.div>
  )
}
