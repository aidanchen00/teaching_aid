"use client";

import { useState, useCallback, useRef } from "react";
import type { AgentStep, AgentExecutionState } from "../types";
import type { FinanceVariables, FinanceArtifact } from "../agents/finance";

export interface FinanceExecutionResult {
  isRunning: boolean;
  error: string | null;
  agents: Record<string, AgentExecutionState>;
  steps: AgentStep[];
  artifacts: FinanceArtifact[];
  result: unknown | null;
  execute: (variables: FinanceVariables) => Promise<void>;
  reset: () => void;
}

export function useFinanceExecution(): FinanceExecutionResult {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agents, setAgents] = useState<Record<string, AgentExecutionState>>({});
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [artifacts, setArtifacts] = useState<FinanceArtifact[]>([]);
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
    async (variables: FinanceVariables) => {
      reset();
      setIsRunning(true);

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/agents/finance", {
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

                switch (currentEvent) {
                  case "agent_start":
                    setAgents((prev) => ({
                      ...prev,
                      [data.agentId]: {
                        agentId: data.agentId,
                        agentName: "Financial Analyst",
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
                    setArtifacts((prev) => [...prev, data.artifact]);
                    break;

                  case "complete":
                    setResult(data);
                    setIsRunning(false);
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
    artifacts,
    result,
    execute,
    reset,
  };
}
