"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Circle, CircleCheck, Loader2, ArrowDown } from "lucide-react"
import type { Workflow } from "../phases/workflow-inspection"

interface WorkflowNavigatorProps {
  workflows: Workflow[]
  activeWorkflowId: string
  onSelectWorkflow: (id: string) => void
}

export function WorkflowNavigator({ workflows, activeWorkflowId, onSelectWorkflow }: WorkflowNavigatorProps) {
  return (
    <div className="w-64 border-r border-border bg-background p-4 space-y-2 overflow-y-auto">
      <div className="mb-4">
        <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 font-semibold">Workflows</h3>
      </div>

      {workflows.map((workflow, index) => {
        const isActive = workflow.id === activeWorkflowId
        const isLast = index === workflows.length - 1

        return (
          <div key={workflow.id}>
            <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.2 }}>
              <Card
                className={`p-3 cursor-pointer transition-all duration-200 ${
                  isActive
                    ? "bg-primary/10 border-primary/50 shadow-sm"
                    : "bg-card hover:bg-muted/50 border-border hover:border-border/80"
                }`}
                onClick={() => onSelectWorkflow(workflow.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {workflow.status === "draft" && <Circle className="h-4 w-4 text-muted-foreground" />}
                    {workflow.status === "ready" && <CircleCheck className="h-4 w-4 text-green-600" />}
                    {workflow.status === "running" && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium font-mono truncate ${isActive ? "text-foreground" : "text-foreground"}`}>{workflow.name}</p>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">{workflow.status}</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Data Flow Indicator */}
            {!isLast && (
              <div className="flex items-center justify-center py-2">
                <div className="flex flex-col items-center gap-1">
                  <ArrowDown className="h-3 w-3 text-muted-foreground/50" />
                  <span className="text-[10px] text-muted-foreground/70 font-mono">data flow</span>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
