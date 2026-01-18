"use client";

import { useState, useCallback, useRef } from "react";
import type { ChatMessage } from "@/lib/types";

interface ExecuteDepartmentAction {
  action: "execute_department";
  department: string;
  variables: Record<string, string>;
}

// Robust parsing function with multiple strategies
function parseExecuteAction(content: string): ExecuteDepartmentAction | null {
  // Strategy 1: Standard JSON code block
  const jsonBlockMatch = content.match(
    /```json\s*(\{[\s\S]*?\})\s*```/
  );
  if (jsonBlockMatch) {
    try {
      const parsed = JSON.parse(jsonBlockMatch[1]);
      if (parsed.action === "execute_department" && parsed.department && parsed.variables) {
        return parsed as ExecuteDepartmentAction;
      }
    } catch {
      // Continue to next strategy
    }
  }

  // Strategy 2: Inline JSON (no code block)
  const inlineJsonMatch = content.match(
    /\{"action"\s*:\s*"execute_department"[^}]+\}/
  );
  if (inlineJsonMatch) {
    try {
      const parsed = JSON.parse(inlineJsonMatch[0]);
      if (parsed.department && parsed.variables) {
        return parsed as ExecuteDepartmentAction;
      }
    } catch {
      // Continue to next strategy
    }
  }

  // Strategy 3: Look for structured data patterns even without proper JSON
  const departmentMatch = content.match(/"department"\s*:\s*"(\w+)"/);
  const variablesMatch = content.match(/"variables"\s*:\s*(\{[^}]+\})/);
  
  if (departmentMatch && variablesMatch) {
    try {
      const variables = JSON.parse(variablesMatch[1]);
      return {
        action: "execute_department",
        department: departmentMatch[1],
        variables,
      };
    } catch {
      // Failed all strategies
    }
  }

  return null;
}

interface UseOrchestratorChatOptions {
  onExecuteDepartment?: (department: string, variables: Record<string, string>) => void;
}

export function useOrchestratorChat(options: UseOrchestratorChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string, phase: string = "input") => {
      // Add user message
      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/orchestrate/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            phase,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to get response");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let assistantContent = "";
        const assistantMessageId = `msg_${Date.now()}_assistant`;

        // Add initial assistant message
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMessageId,
            role: "assistant",
            content: "",
            timestamp: new Date(),
          },
        ]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          assistantContent += chunk;

          // Update the assistant message with streamed content
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessageId
                ? { ...m, content: assistantContent }
                : m
            )
          );
        }

        // Check for execute action in the response (multiple parsing strategies)
        const parsedAction = parseExecuteAction(assistantContent);
        if (parsedAction && options.onExecuteDepartment) {
          options.onExecuteDepartment(parsedAction.department, parsedAction.variables);
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        
        // Add error message
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_${Date.now()}_error`,
            role: "assistant",
            content: `I encountered an error: ${errorMessage}. Please try again.`,
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, options]
  );

  const addSystemMessage = useCallback((content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `msg_${Date.now()}_system`,
        role: "system" as const,
        content,
        timestamp: new Date(),
      },
    ]);
  }, []);

  const reset = useCallback(() => {
    setMessages([]);
    setError(null);
    setIsLoading(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    addSystemMessage,
    reset,
    setMessages,
  };
}
