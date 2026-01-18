"use client";

import { useState, useCallback, useRef } from "react";
import type { AgentStep, ToolCallEvent, AgentExecutionState } from "../types";

export interface AgentEvent {
  type:
    | "start"
    | "agent_start"
    | "agent_complete"
    | "step"
    | "tool_call"
    | "complete"
    | "error";
  data: unknown;
}

export interface UseAgentExecutionOptions {
  onEvent?: (event: AgentEvent) => void;
}

export interface AgentExecutionResult {
  isRunning: boolean;
  error: string | null;
  agents: Record<string, AgentExecutionState>;
  steps: AgentStep[];
  toolCalls: ToolCallEvent[];
  result: unknown | null;
  execute: (variables: Record<string, string>) => Promise<void>;
  reset: () => void;
}

export function useAgentExecution(
  departmentId: string,
  options: UseAgentExecutionOptions = {}
): AgentExecutionResult {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agents, setAgents] = useState<Record<string, AgentExecutionState>>({});
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [toolCalls, setToolCalls] = useState<ToolCallEvent[]>([]);
  const [result, setResult] = useState<unknown | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setIsRunning(false);
    setError(null);
    setAgents({});
    setSteps([]);
    setToolCalls([]);
    setResult(null);
  }, []);

  const execute = useCallback(
    async (variables: Record<string, string>) => {
      reset();
      setIsRunning(true);

      // Create abort controller for this execution
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(`/api/agents/${departmentId}`, {
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
              // Process complete event
              try {
                const data = JSON.parse(currentData);
                const event: AgentEvent = { type: currentEvent as AgentEvent["type"], data };
                
                options.onEvent?.(event);

                switch (currentEvent) {
                  case "agent_start":
                    setAgents((prev) => ({
                      ...prev,
                      [data.agentId]: {
                        agentId: data.agentId,
                        agentName: getAgentName(data.agentId),
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
                        agentId: data.agentId, // Include agentId for filtering
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

                  case "complete":
                    setResult(data.result);
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
          // Execution was cancelled
          return;
        }
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsRunning(false);
      }
    },
    [departmentId, options, reset]
  );

  return {
    isRunning,
    error,
    agents,
    steps,
    toolCalls,
    result,
    execute,
    reset,
  };
}

// Helper to get human-readable agent names
function getAgentName(agentId: string): string {
  const names: Record<string, string> = {
    agent_brand_strategist: "Brand Strategist",
    agent_designer: "Designer",
    agent_content_writer: "Content Writer",
    agent_social_media: "Social Media Manager",
  };
  return names[agentId] || agentId;
}
