"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Loader2, AlertCircle, RotateCcw } from "lucide-react"
import type { WorkflowSet } from "../openpreneurship-orchestrator"

interface ExecutionVisualizationProps {
  workflowSet: WorkflowSet
  onReset: () => void
}

type ExecutionStatus = "pending" | "running" | "completed" | "blocked"

interface WorkflowExecution {
  name: string
  status: ExecutionStatus
  message: string
  iteration: number
}

export function ExecutionVisualization({ workflowSet, onReset }: ExecutionVisualizationProps) {
  const [executions, setExecutions] = useState<WorkflowExecution[]>(
    workflowSet.workflows.map((name) => ({
      name,
      status: "pending" as ExecutionStatus,
      message: "Waiting to start...",
      iteration: 1,
    })),
  )
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex >= executions.length) return

    const timer = setTimeout(() => {
      setExecutions((prev) =>
        prev.map((exec, idx) => {
          if (idx === currentIndex) {
            return { ...exec, status: "running", message: "Processing..." }
          }
          return exec
        }),
      )

      setTimeout(() => {
        setExecutions((prev) =>
          prev.map((exec, idx) => {
            if (idx === currentIndex) {
              const isBlocked = Math.random() < 0.2 && idx > 0
              return {
                ...exec,
                status: isBlocked ? "blocked" : "completed",
                message: isBlocked
                  ? "Blocked pending approval"
                  : `Completed - Passing context to ${executions[idx + 1]?.name || "next stage"}`,
              }
            }
            return exec
          }),
        )
        setCurrentIndex((prev) => prev + 1)
      }, 2000)
    }, 1000)

    return () => clearTimeout(timer)
  }, [currentIndex, executions.length])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h2 className="text-3xl font-bold">Execution in Progress</h2>
            <p className="text-muted-foreground mt-2">Orchestrating {workflowSet.title}</p>
          </div>
          <Button variant="outline" onClick={onReset} disabled={currentIndex < executions.length}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Start Over
          </Button>
        </motion.div>

        {/* Timeline View */}
        <div className="space-y-4">
          {executions.map((execution, index) => (
            <motion.div
              key={execution.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 border-border relative overflow-hidden">
                {/* Status indicator border */}
                <motion.div
                  className="absolute left-0 top-0 bottom-0 w-1"
                  initial={{ backgroundColor: "rgb(38, 38, 38)" }}
                  animate={{
                    backgroundColor:
                      execution.status === "running"
                        ? "rgb(120, 119, 198)"
                        : execution.status === "completed"
                          ? "rgb(34, 197, 94)"
                          : execution.status === "blocked"
                            ? "rgb(239, 68, 68)"
                            : "rgb(38, 38, 38)",
                  }}
                  transition={{ duration: 0.3 }}
                />

                <div className="flex items-center gap-4 ml-4">
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {execution.status === "pending" && (
                      <div className="w-8 h-8 rounded-full border-2 border-muted flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-muted" />
                      </div>
                    )}
                    {execution.status === "running" && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      >
                        <Loader2 className="w-8 h-8 text-primary" />
                      </motion.div>
                    )}
                    {execution.status === "completed" && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center"
                      >
                        <Check className="w-5 h-5 text-green-500" />
                      </motion.div>
                    )}
                    {execution.status === "blocked" && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center"
                      >
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      </motion.div>
                    )}
                  </div>

                  {/* Workflow Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold font-mono">{execution.name}</h3>
                      {execution.iteration > 1 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-mono">
                          Iteration {execution.iteration}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{execution.message}</p>
                  </div>

                  {/* Timestamp */}
                  <div className="text-xs text-muted-foreground font-mono">
                    {execution.status !== "pending" && new Date().toLocaleTimeString()}
                  </div>
                </div>

                {/* Animation overlay for running state */}
                <AnimatePresence>
                  {execution.status === "running" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.05, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                      className="absolute inset-0 bg-primary pointer-events-none"
                    />
                  )}
                </AnimatePresence>
              </Card>

              {/* Connection line */}
              {index < executions.length - 1 && (
                <motion.div
                  className="h-8 w-0.5 bg-border ml-10 my-1"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: execution.status === "completed" ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ transformOrigin: "top" }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
