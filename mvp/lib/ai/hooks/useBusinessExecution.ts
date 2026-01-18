"use client";

import { useState, useCallback, useRef } from "react";
import type { AgentStep, AgentExecutionState } from "../types";
import type { BusinessVariables, BusinessArtifact } from "../agents/business";

export interface BusinessExecutionResult {
  isRunning: boolean;
  error: string | null;
  agents: Record<string, AgentExecutionState>;
  steps: AgentStep[];
  artifacts: BusinessArtifact[];
  result: unknown | null;
  execute: (variables: BusinessVariables) => Promise<void>;
  reset: () => void;
}

export function useBusinessExecution(): BusinessExecutionResult {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agents, setAgents] = useState<Record<string, AgentExecutionState>>({});
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [artifacts, setArtifacts] = useState<BusinessArtifact[]>([]);
  const [result, setResult] = useState<unknown | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setIsRunning(false);
    setError(null);
    setAgents({});
    setSteps([]);
    setArtifacts([]);
    setResult(null);
  }, []);

  const execute = useCallback(
    async (variables: BusinessVariables) => {
      console.log("[BusinessExecution] Starting execution with variables:", variables);
      reset();
      setIsRunning(true);

      abortControllerRef.current = new AbortController();

      try {
        console.log("[BusinessExecution] Fetching /api/agents/business with:", JSON.stringify(variables, null, 2));
        const response = await fetch("/api/agents/business", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(variables),
          signal: abortControllerRef.current.signal,
        });

        console.log("[BusinessExecution] Response status:", response.status, response.statusText);
        if (!response.ok) {
          const errorText = await response.text();
          console.error("[BusinessExecution] Error response:", errorText);
          setError(`HTTP ${response.status}: ${errorText}`);
          throw new Error(`HTTP error: ${response.status} - ${errorText}`);
        }

        if (!response.body) {
          console.error("[BusinessExecution] No response body");
          setError("No response body from server");
          throw new Error("No response body");
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

                switch (currentEvent) {
                  case "agent_start":
                    setAgents((prev) => ({
                      ...prev,
                      [data.agentId]: {
                        agentId: data.agentId,
                        agentName: "Strategy Lead",
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

                  case "artifact":
                    // Light artifact without pptxBase64 - just for progress tracking
                    console.log("[BusinessExecution] Received artifact:", data.artifact.type, data.artifact.title);
                    setArtifacts((prev) => {
                      // Check if we already have this artifact (from complete event)
                      const exists = prev.some(a => a.id === data.artifact.id);
                      if (exists) return prev;
                      return [...prev, data.artifact];
                    });
                    break;

                  case "complete":
                    console.log("[BusinessExecution] Complete event, full artifacts:", data.artifacts?.length);
                    // Replace with full artifacts that include pptxBase64
                    if (data.artifacts && Array.isArray(data.artifacts)) {
                      setArtifacts(data.artifacts);
                    }
                    setResult(data);
                    setIsRunning(false);
                    break;

                  case "error":
                    console.error("[BusinessExecution] Server error:", data.message);
                    setError(data.message);
                    setIsRunning(false);
                    break;
                }
              } catch (e) {
                console.error("[BusinessExecution] Failed to parse SSE data:", currentData, e);
              }

              currentEvent = "";
              currentData = "";
            }
          }
        }
      } catch (err) {
        console.error("[BusinessExecution] Error:", err);
        if (err instanceof Error && err.name === "AbortError") {
          console.log("[BusinessExecution] Request aborted");
          return;
        }
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        console.log("[BusinessExecution] Execution finished");
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
    artifacts,
    result,
    execute,
    reset,
  };
}
