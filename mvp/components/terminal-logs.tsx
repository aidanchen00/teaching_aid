"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Terminal } from "lucide-react"
import type { LogEntry } from "./openpreneurship-orchestrator"
import { cn } from "@/lib/utils"

interface TerminalLogsProps {
  logs: LogEntry[]
}

export function TerminalLogs({ logs }: TerminalLogsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header */}
      <div className="border-b border-zinc-800 px-4 py-3 flex items-center gap-2 bg-zinc-950">
        <Terminal className="h-4 w-4 text-emerald-500" />
        <span className="font-mono text-sm text-zinc-400">System Logs</span>
      </div>

      {/* Terminal Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-sm">
        {logs.length === 0 ? (
          <div className="text-zinc-600 text-center mt-8">Waiting for orchestration to begin...</div>
        ) : (
          logs.map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="flex gap-3"
            >
              <span className="text-zinc-600 shrink-0">{log.timestamp}</span>
              <span
                className={cn("shrink-0", {
                  "text-blue-400": log.source === "orchestrator",
                  "text-purple-400": log.source === "agent",
                })}
              >
                {log.source === "orchestrator" ? "[ORCHESTRATOR]" : `[${log.agentName}]`}
              </span>
              <span
                className={cn({
                  "text-zinc-300": log.type === "info",
                  "text-emerald-400": log.type === "success",
                  "text-yellow-400": log.type === "warning",
                  "text-red-400": log.type === "error",
                })}
              >
                {log.message}
              </span>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
