"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface IntentInputProps {
  onSubmit: (intent: string) => void
}

export function IntentInput({ onSubmit }: IntentInputProps) {
  const [value, setValue] = useState("")

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex items-center justify-center min-h-screen p-6"
    >
      <div className="w-full max-w-2xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center space-y-4"
        >
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            Openpreneurship
          </h1>
          <p className="text-muted-foreground text-lg font-medium">Orchestrate workflows. Build organizations.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Describe the organization you want to design..."
            className="min-h-[120px] resize-none bg-background border-border text-lg placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-primary/20"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.metaKey) {
                handleSubmit()
              }
            }}
          />

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-mono">⌘ + Enter to submit</p>
            <Button
              onClick={handleSubmit}
              disabled={!value.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Generate workflows
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
