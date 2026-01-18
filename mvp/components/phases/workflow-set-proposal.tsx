"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Check } from "lucide-react"
import type { WorkflowSet } from "../openpreneurship-orchestrator"

interface WorkflowSetProposalProps {
  intent: string
  options: WorkflowSet[]
  onSelect: (set: WorkflowSet) => void
}

export function WorkflowSetProposal({ intent, options, onSelect }: WorkflowSetProposalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-6 flex items-center justify-center"
    >
      <div className="w-full max-w-5xl space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <h2 className="text-3xl font-bold text-foreground">Select Configuration</h2>
          <p className="text-muted-foreground text-base">
            Choose an organizational structure for: <span className="text-foreground font-medium italic">{intent}</span>
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {options.map((set, index) => (
            <motion.div
              key={set.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className="p-6 cursor-pointer border-border hover:border-primary/50 hover:shadow-md transition-all duration-300 group relative overflow-hidden bg-card"
                onClick={() => onSelect(set)}
              >
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{set.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{set.description}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Roles / Workflows</p>
                    <div className="space-y-2">
                      {set.workflows.map((workflow) => (
                        <div key={workflow} className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-primary" />
                          <span className="text-sm font-mono">{workflow}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {set.rationale && (
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground italic">{set.rationale}</p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
