"use client";

import { useState, useCallback, useRef } from "react";
import type { AgentStep, ToolCallEvent, AgentExecutionState } from "../types";
import type { GeneratedFile, SandboxState } from "@/lib/e2b";
import type { SoftwareVariables } from "../agents/software";

export interface SoftwareEvent {
  type:
    | "start"
    | "status"
    | "agent_start"
    | "agent_complete"
    | "step"
    | "tool_call"
    | "sandbox_ready"
    | "sandbox_error"
    | "files_generated"
    | "files_deployed"
    | "deploy_error"
    | "complete"
    | "error";
  data: unknown;
}

export interface UseSoftwareExecutionOptions {
  onEvent?: (event: SoftwareEvent) => void;
}

export interface SoftwareExecutionResult {
  isRunning: boolean;
  error: string | null;
  agents: Record<string, AgentExecutionState>;
  steps: AgentStep[];
  toolCalls: ToolCallEvent[];
  files: Record<string, string>; // path -> content
  selectedFile: string | null;
  sandbox: SandboxState;
  refreshKey: number;
  result: unknown | null;
  execute: (variables: SoftwareVariables) => Promise<void>;
  setSelectedFile: (path: string | null) => void;
  updateFile: (path: string, content: string) => Promise<void>;
  reset: () => void;
}

export function useSoftwareExecution(
  options: UseSoftwareExecutionOptions = {}
): SoftwareExecutionResult {
  // Stabilize options reference to prevent unnecessary re-renders
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agents, setAgents] = useState<Record<string, AgentExecutionState>>({});
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [toolCalls, setToolCalls] = useState<ToolCallEvent[]>([]);
  const [files, setFiles] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [sandbox, setSandbox] = useState<SandboxState>({
    id: null,
    previewUrl: null,
    status: "idle",
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [result, setResult] = useState<unknown | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setIsRunning(false);
    setError(null);
    setAgents({});
    setSteps([]);
    setToolCalls([]);
    setFiles({});
    setSelectedFile(null);
    setSandbox({ id: null, previewUrl: null, status: "idle" });
    setRefreshKey(0);
    setResult(null);
  }, []);

  const updateFile = useCallback(
    async (path: string, content: string) => {
      setFiles((prev) => ({ ...prev, [path]: content }));

      // Sync to sandbox if available
      if (sandbox.id) {
        try {
          const res = await fetch("/api/sandbox", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sandboxId: sandbox.id,
              files: [{ path, content }],
            }),
          });

          if (res.ok) {
            setRefreshKey((k) => k + 1);
          }
        } catch (err) {
          console.error("Failed to sync file to sandbox:", err);
        }
      }
    },
    [sandbox.id]
  );

  const execute = useCallback(
    async (variables: SoftwareVariables) => {
      reset();
      setIsRunning(true);
      setSandbox((s) => ({ ...s, status: "creating" }));

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/agents/software", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(variables),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE messages
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          let currentEvent = "";
          let currentData = "";

          for (const line of lines) {
            if (line.startsWith("event: ")) {
              currentEvent = line.slice(7);
            } else if (line.startsWith("data: ")) {
              currentData = line.slice(6);
            } else if (line === "" && currentEvent && currentData) {
              try {
                const data = JSON.parse(currentData);
                const event: SoftwareEvent = {
                  type: currentEvent as SoftwareEvent["type"],
                  data,
                };

                optionsRef.current.onEvent?.(event);

                switch (currentEvent) {
                  case "sandbox_ready":
                    setSandbox({
                      id: data.sandboxId,
                      previewUrl: data.previewUrl,
                      status: "ready",
                    });
                    break;

                  case "sandbox_error":
                    setSandbox((s) => ({
                      ...s,
                      status: "error",
                      error: data.error,
                    }));
                    break;

                  case "agent_start":
                    setAgents((prev) => ({
                      ...prev,
                      [data.agentId]: {
                        agentId: data.agentId,
                        agentName: "Software Engineer",
                        status: "running",
                        steps: [],
                        progress: 0,
                        outputs: [],
                        startedAt: new Date(data.timestamp),
                      },
                    }));
                    break;

                  case "agent_complete":
                    setAgents((prev) => ({
                      ...prev,
                      [data.agentId]: {
                        ...prev[data.agentId],
                        status: "completed",
                        progress: 100,
                        completedAt: new Date(data.timestamp),
                      },
                    }));
                    break;

                  case "step":
                    setSteps((prev) => [...prev, data.step]);
                    break;

                  case "tool_call":
                    setToolCalls((prev) => {
                      const toolCallWithAgent = {
                        ...data.toolCall,
                        agentId: data.agentId,
                      };
                      const existing = prev.findIndex(
                        (tc) => tc.id === data.toolCall.id
                      );
                      if (existing >= 0) {
                        const updated = [...prev];
                        updated[existing] = toolCallWithAgent;
                        return updated;
                      }
                      return [...prev, toolCallWithAgent];
                    });
                    break;

                  case "files_generated":
                    // Files will be sent in the complete event with full content
                    break;

                  case "files_deployed":
                    setRefreshKey((k) => k + 1);
                    break;

                  case "complete":
                    if (data.files && Array.isArray(data.files)) {
                      const newFiles: Record<string, string> = {};
                      for (const file of data.files as GeneratedFile[]) {
                        newFiles[file.path] = file.content;
                      }
                      setFiles(newFiles);

                      // Select first file
                      if (data.files.length > 0) {
                        setSelectedFile((data.files as GeneratedFile[])[0].path);
                      }
                    }

                    if (data.sandboxId && data.previewUrl) {
                      setSandbox({
                        id: data.sandboxId,
                        previewUrl: data.previewUrl,
                        status: "ready",
                      });
                    }

                    setResult(data);
                    setIsRunning(false);
                    setRefreshKey((k) => k + 1);
                    break;

                  case "error":
                    setError(data.message);
                    setIsRunning(false);
                    break;
                }
              } catch (e) {
                console.error("Failed to parse SSE data:", e);
              }

              currentEvent = "";
              currentData = "";
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        setError(err instanceof Error ? err.message : "Unknown error");
        setSandbox((s) => ({ ...s, status: "error", error: String(err) }));
      } finally {
        setIsRunning(false);
      }
    },
    [reset]
  );

  return {
    isRunning,
    error,
    agents,
    steps,
    toolCalls,
    files,
    selectedFile,
    sandbox,
    refreshKey,
    result,
    execute,
    setSelectedFile,
    updateFile,
    reset,
  };
}
