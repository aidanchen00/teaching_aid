"use client"

import { useState, useEffect, useCallback } from "react"
import { IntentInput } from "./phases/intent-input"
import { WorkflowSetProposal } from "./phases/workflow-set-proposal"
import { WorkflowInspection } from "./phases/workflow-inspection"
import { TerminalLogs } from "./terminal-logs"
import { OutputDisplay } from "./output-display"
import {
  createPlan,
  selectOption,
  executeRun,
  subscribeToRun,
  type WorkflowSetOption,
  type LogEntry as ApiLogEntry,
  type OutputItem as ApiOutputItem,
  type WorkflowSetResponse,
} from "@/lib/api"

export type LogEntry = {
  id: string
  timestamp: string
  source: "orchestrator" | "agent"
  agentName?: string
  message: string
  type: "info" | "success" | "warning" | "error"
}

export type OutputItem = {
  id: string
  title: string
  content: string
  timestamp: string
  type: "text" | "code" | "data"
}

export interface WorkflowSet {
  id: string
  title: string
  description: string
  workflows: string[]
  rationale?: string
}

type Phase = "intent" | "org-structure" | "workflow-design" | "execution"

export interface RunConfig {
  goal: string
  files: File[]
  context?: string
  parameters?: Record<string, unknown>
}

export function M0Orchestrator() {
  const [phase, setPhase] = useState<Phase>("intent")
  const [intent, setIntent] = useState("")
  const [planOptions, setPlanOptions] = useState<WorkflowSetOption[]>([])
  const [selectedSet, setSelectedSet] = useState<WorkflowSet | null>(null)
  const [workflowDetails, setWorkflowDetails] = useState<WorkflowSetResponse | null>(null)
  const [runConfig, setRunConfig] = useState<RunConfig | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [outputs, setOutputs] = useState<OutputItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Convert API log to component log format
  const convertLog = useCallback((apiLog: ApiLogEntry): LogEntry => ({
    id: apiLog.id,
    timestamp: apiLog.timestamp,
    source: apiLog.source,
    agentName: apiLog.agent_name,
    message: apiLog.message,
    type: apiLog.type,
  }), [])

  // Convert API output to component output format
  const convertOutput = useCallback((apiOutput: ApiOutputItem): OutputItem => ({
    id: apiOutput.id,
    title: apiOutput.title,
    content: apiOutput.content,
    timestamp: apiOutput.timestamp,
    type: apiOutput.type,
  }), [])

  const handleIntentSubmit = async (value: string) => {
    setIntent(value)
    setIsLoading(true)
    setError(null)

    try {
      const response = await createPlan(value)
      setPlanOptions(response.options)

      // Convert to WorkflowSet format for the component
      const workflowSets: WorkflowSet[] = response.options.map((opt) => ({
        id: opt.id,
        title: opt.title,
        description: opt.description,
        workflows: opt.workflows,
      }))

      // Store for use in the next phase
      setPlanOptions(response.options)
      setPhase("org-structure")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create plan")
      console.error("Failed to create plan:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetSelect = async (set: WorkflowSet) => {
    setSelectedSet(set)
    setIsLoading(true)
    setError(null)

    try {
      const response = await selectOption(set.id)
      setWorkflowDetails(response)
      setPhase("workflow-design")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to select option")
      console.error("Failed to select option:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRunSetupComplete = async (config: RunConfig) => {
    setRunConfig(config)
    setLogs([])
    setOutputs([])
    setPhase("execution")

    try {
      const response = await executeRun(config.goal, config.context)
      const runId = response.run_id

      // Subscribe to real-time updates
      const unsubscribe = subscribeToRun(runId, {
        onLog: (log) => {
          setLogs((prev) => [...prev, convertLog(log)])
        },
        onOutput: (output) => {
          setOutputs((prev) => [...prev, convertOutput(output)])
        },
        onComplete: (status) => {
          console.log("Run completed with status:", status)
        },
        onError: (err) => {
          console.error("Run error:", err)
          setError(err.message)
        },
      })

      // Cleanup on unmount
      return () => unsubscribe()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start execution")
      console.error("Failed to start execution:", err)
    }
  }

  const handleBackToOrgStructure = () => {
    setPhase("org-structure")
  }

  // Show loading overlay
  const LoadingOverlay = () =>
    isLoading ? (
      <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Processing...</p>
        </div>
      </div>
    ) : null

  // Show error toast
  const ErrorToast = () =>
    error ? (
      <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground p-4 rounded-md shadow-lg z-50 max-w-md">
        <p className="font-medium">Error</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={() => setError(null)}
          className="absolute top-2 right-2 text-destructive-foreground/70 hover:text-destructive-foreground"
        >
          ×
        </button>
      </div>
    ) : null

  if (phase === "intent") {
    return (
      <>
        <LoadingOverlay />
        <ErrorToast />
        <IntentInput onSubmit={handleIntentSubmit} />
      </>
    )
  }

  if (phase === "org-structure") {
    // Convert planOptions to WorkflowSet format for the component
    const workflowSets: WorkflowSet[] = planOptions.map((opt) => ({
      id: opt.id,
      title: opt.title,
      description: opt.description,
      workflows: opt.workflows,
      rationale: opt.rationale,
    }))

    return (
      <>
        <LoadingOverlay />
        <ErrorToast />
        <WorkflowSetProposal
          intent={intent}
          options={workflowSets}
          onSelect={handleSetSelect}
        />
      </>
    )
  }

  if (phase === "workflow-design" && selectedSet) {
    return (
      <>
        <LoadingOverlay />
        <ErrorToast />
        <WorkflowInspection
          workflowSet={selectedSet}
          workflowDetails={workflowDetails}
          onRunSetup={handleRunSetupComplete}
          onBack={handleBackToOrgStructure}
          initialIntent={intent}
        />
      </>
    )
  }

  // Phase 4: Execution + Output (ONE state)
  return (
    <>
      <ErrorToast />
      <div className="h-screen flex">
        <div className="w-1/2 border-r border-border">
          <TerminalLogs logs={logs} />
        </div>
        <div className="w-1/2">
          <OutputDisplay outputs={outputs} />
        </div>
      </div>
    </>
  )
}
