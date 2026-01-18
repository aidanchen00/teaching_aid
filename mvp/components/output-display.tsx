"use client"

import { motion } from "framer-motion"
import { FileText, Code, Database } from "lucide-react"
import type { OutputItem } from "./openpreneurship-orchestrator"
import { Card } from "@/components/ui/card"

interface OutputDisplayProps {
  outputs: OutputItem[]
}

export function OutputDisplay({ outputs }: OutputDisplayProps) {
  const getIcon = (type: OutputItem["type"]) => {
    switch (type) {
      case "text":
        return <FileText className="h-5 w-5" />
      case "code":
        return <Code className="h-5 w-5" />
      case "data":
        return <Database className="h-5 w-5" />
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 bg-background">
        <h2 className="font-semibold text-lg text-foreground">Output Results</h2>
        <p className="text-sm text-muted-foreground mt-1">Final results from agent execution</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {outputs.length === 0 ? (
          <div className="text-center text-muted-foreground mt-12">
            <p>No outputs yet</p>
            <p className="text-sm mt-2">Results will appear here as agents complete their work</p>
          </div>
        ) : (
          outputs.map((output) => (
            <motion.div
              key={output.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="p-5 border-border bg-card hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">{getIcon(output.type)}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base text-foreground">{output.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{output.timestamp}</p>
                  </div>
                </div>
                <div className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">{output.content}</div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
