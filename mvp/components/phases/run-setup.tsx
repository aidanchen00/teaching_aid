"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { X, Upload, FileText } from "lucide-react"

interface RunSetupProps {
  isOpen: boolean
  onClose: () => void
  onExecute: (config: RunConfig) => void
  initialIntent?: string
}

export interface RunConfig {
  goal: string
  files: File[]
  context?: string
  parameters?: Record<string, any>
}

export function RunSetup({ isOpen, onClose, onExecute, initialIntent = "" }: RunSetupProps) {
  const [goal, setGoal] = useState(initialIntent)
  const [context, setContext] = useState("")
  const [files, setFiles] = useState<File[]>([])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleExecute = () => {
    if (!goal.trim()) return

    onExecute({
      goal: goal.trim(),
      files,
      context: context.trim() || undefined,
    })
  }

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-border bg-card shadow-lg">
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Run Setup</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Configure this execution run with your specific goal and context
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Goal Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Goal for this run *</label>
                  <Textarea
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g., Analyze this company and recommend next steps"
                    className="min-h-[100px] resize-none bg-background border-border placeholder:text-muted-foreground/60"
                  />
                  <p className="text-xs text-muted-foreground">
                    This is the specific task for this execution. The workflows will use this goal.
                  </p>
                </div>

                {/* Context Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Additional Context (optional)</label>
                  <Textarea
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Any additional context, constraints, or requirements..."
                    className="min-h-[80px] resize-none bg-background border-border placeholder:text-muted-foreground/60"
                  />
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Files / Data (optional)</label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <span className="text-sm font-medium text-foreground">Click to upload</span>
                        <span className="text-xs text-muted-foreground block mt-1">
                          or drag and drop files here
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* File List */}
                  {files.length > 0 && (
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-foreground">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveFile(index)}
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleExecute}
                    disabled={!goal.trim()}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Execute Run
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

