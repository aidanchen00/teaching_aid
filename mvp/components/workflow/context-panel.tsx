"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import { motion } from "framer-motion"
import type { Workflow } from "../phases/workflow-inspection"

interface ContextPanelProps {
  workflow: Workflow
  messages: Array<{ role: "user" | "assistant"; content: string }>
  onSendMessage: (message: string) => void
}

export function ContextPanel({ workflow, messages, onSendMessage }: ContextPanelProps) {
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input)
      setInput("")
    }
  }

  return (
    <div className="w-80 border-l border-border bg-background flex flex-col">
      <div className="p-4 border-b border-border bg-background">
        <h3 className="text-sm font-semibold text-foreground">Edit Workflow</h3>
        <p className="text-xs text-muted-foreground mt-1">Chat to modify {workflow.name}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <p className="text-sm text-muted-foreground">No messages yet. Try:</p>
            <div className="space-y-2">
              {["Add an approval step", "Make this more conservative", "Add error handling"].map((suggestion) => (
                <Card
                  key={suggestion}
                  className="p-3 cursor-pointer hover:bg-muted/50 transition-colors border-border bg-card hover:shadow-sm"
                  onClick={() => {
                    setInput(suggestion)
                  }}
                >
                  <p className="text-xs font-mono text-foreground">{suggestion}</p>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <Card
                className={`p-3 max-w-[90%] ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-muted border-border"
                }`}
              >
                <p className={`text-sm leading-relaxed ${message.role === "user" ? "text-primary-foreground" : "text-foreground"}`}>{message.content}</p>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-background border-border"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSend()
              }
            }}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim()}
            size="icon"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
