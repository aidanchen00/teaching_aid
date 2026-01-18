"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { ChevronDown, ChevronRight, ExternalLink, ArrowRight, ZoomIn, ZoomOut, Maximize2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { Workflow } from "../phases/workflow-inspection"

interface WorkflowCanvasProps {
  workflow: Workflow
  activeTab: "overview" | "inputs" | "outputs" | "logic" | "json"
  onTabChange: (tab: "overview" | "inputs" | "outputs" | "logic" | "json") => void
}

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "inputs", label: "Inputs" },
  { id: "outputs", label: "Outputs" },
  { id: "logic", label: "Logic" },
  { id: "json", label: "JSON" },
] as const

export function WorkflowCanvas({ workflow, activeTab, onTabChange }: WorkflowCanvasProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())
  const [zoom, setZoom] = useState(1)

  const toggleStep = (stepId: string) => {
    const newExpanded = new Set(expandedSteps)
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId)
    } else {
      newExpanded.add(stepId)
    }
    setExpandedSteps(newExpanded)
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 1.5))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5))
  const handleZoomReset = () => setZoom(1)

  return (
    <div className="flex-1 overflow-y-auto relative">
      {/* Tabs */}
      <div className="sticky top-0 z-30 bg-background border-b border-border">
        <div className="flex gap-1 px-6 pt-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === tab.id 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              } rounded-t-md`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  transition={{ duration: 0.2 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-foreground">{workflow.name}</h2>
              <p className="text-muted-foreground text-base">
                A structured workflow for {workflow.name.toLowerCase()} operations
              </p>
              {workflow.n8n_workflow_id && (
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs font-mono text-muted-foreground">n8n ID: {workflow.n8n_workflow_id}</span>
                  <a
                    href={`https://stevedusty.app.n8n.cloud/workflow/${workflow.n8n_workflow_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    View in n8n <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Data Flow Summary */}
            <Card className="p-4 bg-muted/30 border-muted">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-xs font-mono text-muted-foreground mb-2">WORKFLOW DATA FLOW</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-xs font-mono text-blue-600 dark:text-blue-400">
                        {workflow.steps[0]?.inputs.length || 0} inputs
                      </span>
                    </div>
                    <div className="text-muted-foreground">→</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span className="text-xs font-mono">
                        {workflow.steps.length} steps
                      </span>
                    </div>
                    <div className="text-muted-foreground">→</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-xs font-mono text-green-600 dark:text-green-400">
                        {workflow.steps[workflow.steps.length - 1]?.outputs.length || 0} outputs
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Zoom Controls */}
            <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2 bg-background border border-border rounded-lg shadow-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 1.5}
                className="h-9 w-9 p-0"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <div className="px-2 py-1 text-xs font-mono text-center text-muted-foreground border-y border-border">
                {Math.round(zoom * 100)}%
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                className="h-9 w-9 p-0"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomReset}
                className="h-9 w-9 p-0"
                title="Reset Zoom"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Horizontal Flow */}
            <div className="mt-6 overflow-x-auto pb-4">
              <div
                className="flex items-start gap-4 min-w-max px-2 transition-transform duration-200 origin-left"
                style={{ transform: `scale(${zoom})` }}
              >
                {workflow.steps.map((step, index) => {
                  const isLast = index === workflow.steps.length - 1
                  const isExpanded = expandedSteps.has(step.id)

                  return (
                    <div key={step.id} className="flex items-center gap-4">
                      {/* Step Box */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="w-64 flex-shrink-0"
                      >
                        <Card className="overflow-hidden border-border bg-card hover:shadow-md transition-all cursor-pointer">
                          <div
                            onClick={() => toggleStep(step.id)}
                            className="p-4 hover:bg-muted/50 transition-colors"
                          >
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-mono font-semibold border-2 border-primary/20">
                                {index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground text-sm truncate">{step.name}</h3>
                              </div>
                              <div className="flex-shrink-0">
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            </div>

                            {/* Purpose */}
                            <p className="text-xs text-muted-foreground line-clamp-2">{step.purpose}</p>

                            {/* Quick Stats */}
                            <div className="flex items-center gap-3 mt-3 text-xs">
                              <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                <span className="text-muted-foreground">{step.inputs.length} in</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                <span className="text-muted-foreground">{step.outputs.length} out</span>
                              </div>
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-border bg-muted/20"
                            >
                              <div className="p-4 space-y-3">
                                <div>
                                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">
                                    📥 Inputs
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {step.inputs.map((input) => (
                                      <span key={input} className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] font-mono text-blue-600 dark:text-blue-400 truncate max-w-full">
                                        {input}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">
                                    📤 Outputs
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {step.outputs.map((output) => (
                                      <span key={output} className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded text-[10px] font-mono text-green-600 dark:text-green-400 truncate max-w-full">
                                        {output}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </Card>
                      </motion.div>

                      {/* Arrow Connector */}
                      {!isLast && (
                        <div className="flex-shrink-0 flex items-center justify-center">
                          <div className="flex flex-col items-center gap-1">
                            <ArrowRight className="h-5 w-5 text-primary/40" />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "inputs" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h3 className="text-xl font-semibold">Workflow Inputs</h3>
            <div className="space-y-2">
              {["User Intent", "System Context", "Previous Results"].map((input) => (
                <Card key={input} className="p-4 border-border">
                  <p className="font-mono text-sm">{input}</p>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "outputs" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h3 className="text-xl font-semibold">Workflow Outputs</h3>
            <div className="space-y-2">
              {["Execution Results", "Performance Metrics", "Next Steps"].map((output) => (
                <Card key={output} className="p-4 border-border">
                  <p className="font-mono text-sm">{output}</p>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "logic" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h3 className="text-xl font-semibold">Workflow Logic</h3>
            <Card className="p-6 border-border bg-muted/20">
              <pre className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {`This workflow implements a structured approach to ${workflow.name.toLowerCase()} operations:

1. First, we analyze the incoming context and requirements
2. Next, we generate a comprehensive execution plan
3. Then, we perform the necessary actions based on the plan
4. Finally, we validate outputs and ensure quality standards

The workflow includes built-in error handling, retry logic, and coordination with other workflows in the system.`}
              </pre>
            </Card>
          </motion.div>
        )}

        {activeTab === "json" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">
                {workflow.n8n_json ? "n8n Workflow JSON" : "Workflow Configuration"}
              </h3>
              {workflow.n8n_workflow_id && (
                <a
                  href={`https://stevedusty.app.n8n.cloud/workflow/${workflow.n8n_workflow_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in n8n
                  </Button>
                </a>
              )}
            </div>
            <Card className="p-6 border-border bg-muted/30 max-h-[60vh] overflow-auto">
              <pre className="text-xs font-mono text-foreground overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(
                  workflow.n8n_json || {
                    id: workflow.id,
                    name: workflow.name,
                    status: workflow.status,
                    steps: workflow.steps,
                  },
                  null,
                  2,
                )}
              </pre>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
