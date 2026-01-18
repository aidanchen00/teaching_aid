"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface IntentInputProps {
  onSubmit: (intent: string) => void
}

export function IntentInput({ onSubmit }: IntentInputProps) {
  const [intent, setIntent] = useState("")

  const handleSubmit = () => {
    if (intent.trim()) {
      onSubmit(intent.trim())
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <motion.div
        className="w-full max-w-2xl px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1
          className="text-4xl font-bold mb-3 text-balance"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Orchestrate your workflow
        </motion.h1>
        <motion.p
          className="text-muted-foreground mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Describe what you want to accomplish, and the orchestrator will coordinate specialized agents to get it done.
        </motion.p>

        <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <Textarea
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            placeholder="e.g., Research the AI market, analyze competitors, and write a comprehensive report..."
            className="min-h-[180px] resize-none text-base"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleSubmit()
              }
            }}
          />

          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Press <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘</kbd> +{" "}
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd> to start
            </p>
            <Button onClick={handleSubmit} disabled={!intent.trim()} size="lg">
              Start Orchestration
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
