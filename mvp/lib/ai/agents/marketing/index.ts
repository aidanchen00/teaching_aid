import { streamText, stepCountIs } from "ai";
import { getModel } from "../../model";
import {
  brandStrategistTemplate,
  designerTemplate,
  contentWriterTemplate,
  socialMediaManagerTemplate,
  fillTemplate,
} from "../../templates/marketing";
import {
  brandStrategistTools,
  designerTools,
  contentWriterTools,
  socialMediaManagerTools,
  sharedTools,
} from "./tools";
import { getComposioTools } from "@/lib/composio/client";
import type { AgentStep, ToolCallEvent } from "../../types";

// Variables to fill into agent prompts
export interface MarketingVariables {
  COMPANY_NAME: string;
  INDUSTRY: string;
  TARGET_AUDIENCE: string;
  PRODUCT_DESCRIPTION: string;
  UNIQUE_VALUE: string;
  TONE: string;
  COMPETITORS: string;
  [key: string]: string; // Index signature for Record<string, string> compatibility
}

// Agent execution options
interface AgentExecuteOptions {
  variables: MarketingVariables;
  previousOutputs?: Record<string, unknown>; // Outputs from previous agents
  onStep?: (step: AgentStep) => void;
  onToolCall?: (toolCall: ToolCallEvent) => void;
  maxSteps?: number;
}

// Execute Brand Strategist Agent
export async function executeBrandStrategist(options: AgentExecuteOptions) {
  const { variables, onStep, onToolCall, maxSteps = 10 } = options;

  const systemPrompt = fillTemplate(brandStrategistTemplate.systemPrompt, variables);

  // Get Composio MCP tools (Firecrawl, Gmail, Notion)
  let composioClient: Awaited<ReturnType<typeof getComposioTools>>["client"] | null = null;
  let composioTools: Record<string, unknown> = {};
  
  try {
    const composio = await getComposioTools();
    composioClient = composio.client;
    composioTools = composio.tools;
    console.log("Loaded Composio MCP tools:", Object.keys(composioTools));
  } catch (error) {
    console.warn("Failed to load Composio MCP tools:", error);
  }

  const result = streamText({
    model: getModel(),
    system: systemPrompt,
    prompt: `Create a comprehensive brand strategy for ${variables.COMPANY_NAME}.

Define the brand identity with mission, vision, values, and positioning. Create a messaging framework.

You have MCP tools available:

1. **Notion Tools**: Save your brand strategy:
   - Call NOTION_CREATE_NOTION_PAGE to create a page
   - Then call NOTION_ADD_MULTIPLE_PAGE_CONTENT with the page ID to add content

2. **Gmail Tool**: Send ONE outreach email to paul@copy.ai introducing ${variables.COMPANY_NAME}.
   - Subject: "Introducing ${variables.COMPANY_NAME}"
   - Brief intro of the product and unique value
   - IMPORTANT: Only call GMAIL_SEND_EMAIL exactly ONCE

Be concise and efficient. Define the brand identity, save to Notion, send one email.`,
    tools: {
      ...brandStrategistTools,
      ...sharedTools,
      ...composioTools,
    },
    stopWhen: stepCountIs(maxSteps),
    onChunk: async ({ chunk }) => {
      if (chunk.type === "text-delta" && onStep) {
        onStep({
          id: crypto.randomUUID(),
          type: "text_output",
          content: chunk.text,
          timestamp: new Date(),
        });
      }
    },
  });

  // Process the stream
  const steps: AgentStep[] = [];
  const toolCalls: ToolCallEvent[] = [];

  for await (const chunk of result.fullStream) {
    switch (chunk.type) {
      case "text-delta":
        // Text is handled in onChunk
        break;
      case "tool-call":
        const toolCallEvent: ToolCallEvent = {
          id: chunk.toolCallId,
          toolName: chunk.toolName,
          args: (chunk as { input?: unknown }).input as Record<string, unknown> ?? {},
          status: "running",
          startedAt: new Date(),
        };
        toolCalls.push(toolCallEvent);
        onToolCall?.(toolCallEvent);
        
        const step: AgentStep = {
          id: crypto.randomUUID(),
          type: "tool_call",
          toolCall: toolCallEvent,
          timestamp: new Date(),
        };
        steps.push(step);
        onStep?.(step);
        break;
      case "tool-result":
        const matchingCall = toolCalls.find((tc) => tc.id === chunk.toolCallId);
        if (matchingCall) {
          matchingCall.status = "completed";
          matchingCall.result = (chunk as { output?: unknown }).output;
          matchingCall.completedAt = new Date();
          onToolCall?.(matchingCall);
        }
        break;
    }
  }

  const finalResult = await result;

  // Close Composio MCP client
  if (composioClient) {
    try {
      await composioClient.close();
    } catch (error) {
      console.warn("Failed to close Composio client:", error);
    }
  }

  return {
    text: finalResult.text,
    steps,
    toolCalls,
    usage: finalResult.usage,
  };
}

// Execute Designer Agent
export async function executeDesigner(options: AgentExecuteOptions) {
  const { variables, previousOutputs, onStep, onToolCall, maxSteps = 10 } = options;

  const systemPrompt = fillTemplate(designerTemplate.systemPrompt, variables);

  // Include brand strategy context if available
  const brandContext = previousOutputs?.brandIdentity
    ? `\n\n## Brand Strategy Context\n${JSON.stringify(previousOutputs.brandIdentity, null, 2)}`
    : "";

  const result = streamText({
    model: getModel(),
    system: systemPrompt + brandContext,
    prompt: `Create the visual identity system for ${variables.COMPANY_NAME}.

1. First, generate a color palette that reflects the brand personality
2. Define the typography system
3. Create SVG logo concepts

Use the tools to save each output. Ensure everything is cohesive with the brand strategy.`,
    tools: {
      ...designerTools,
      ...sharedTools,
    },
    stopWhen: stepCountIs(maxSteps),
  });

  const steps: AgentStep[] = [];
  const toolCalls: ToolCallEvent[] = [];

  for await (const chunk of result.fullStream) {
    switch (chunk.type) {
      case "text-delta":
        if (onStep) {
          onStep({
            id: crypto.randomUUID(),
            type: "text_output",
            content: chunk.text,
            timestamp: new Date(),
          });
        }
        break;
      case "tool-call":
        const toolCallEvent: ToolCallEvent = {
          id: chunk.toolCallId,
          toolName: chunk.toolName,
          args: (chunk as { input?: unknown }).input as Record<string, unknown> ?? {},
          status: "running",
          startedAt: new Date(),
        };
        toolCalls.push(toolCallEvent);
        onToolCall?.(toolCallEvent);
        
        steps.push({
          id: crypto.randomUUID(),
          type: "tool_call",
          toolCall: toolCallEvent,
          timestamp: new Date(),
        });
        break;
      case "tool-result":
        const matchingCall = toolCalls.find((tc) => tc.id === chunk.toolCallId);
        if (matchingCall) {
          matchingCall.status = "completed";
          matchingCall.result = (chunk as { output?: unknown }).output;
          matchingCall.completedAt = new Date();
          onToolCall?.(matchingCall);
        }
        break;
    }
  }

  const finalResult = await result;

  return {
    text: finalResult.text,
    steps,
    toolCalls,
    usage: finalResult.usage,
  };
}

// Execute Content Writer Agent (simplified - just brand messaging)
export async function executeContentWriter(options: AgentExecuteOptions) {
  const { variables, onStep, onToolCall, maxSteps = 10 } = options;

  const systemPrompt = fillTemplate(contentWriterTemplate.systemPrompt, variables);

  const result = streamText({
    model: getModel(),
    system: systemPrompt,
    prompt: `Create a brief messaging framework for ${variables.COMPANY_NAME}.

Write a short elevator pitch (2-3 sentences) and 3 key messages for the target audience.
Output as plain text - no tools needed.`,
    tools: {
      ...sharedTools,
    },
    stopWhen: stepCountIs(maxSteps),
  });

  const steps: AgentStep[] = [];
  const toolCalls: ToolCallEvent[] = [];

  for await (const chunk of result.fullStream) {
    switch (chunk.type) {
      case "text-delta":
        onStep?.({
          id: crypto.randomUUID(),
          type: "text_output",
          content: chunk.text,
          timestamp: new Date(),
        });
        break;
      case "tool-call":
        const toolCallEvent: ToolCallEvent = {
          id: chunk.toolCallId,
          toolName: chunk.toolName,
          args: (chunk as { input?: unknown }).input as Record<string, unknown> ?? {},
          status: "running",
          startedAt: new Date(),
        };
        toolCalls.push(toolCallEvent);
        onToolCall?.(toolCallEvent);
        
        steps.push({
          id: crypto.randomUUID(),
          type: "tool_call",
          toolCall: toolCallEvent,
          timestamp: new Date(),
        });
        break;
      case "tool-result":
        const matchingCall = toolCalls.find((tc) => tc.id === chunk.toolCallId);
        if (matchingCall) {
          matchingCall.status = "completed";
          matchingCall.result = (chunk as { output?: unknown }).output;
          matchingCall.completedAt = new Date();
          onToolCall?.(matchingCall);
        }
        break;
    }
  }

  const finalResult = await result;

  return {
    text: finalResult.text,
    steps,
    toolCalls,
    usage: finalResult.usage,
  };
}

// Execute Social Media Manager Agent (simplified - just 2 posts)
export async function executeSocialMediaManager(options: AgentExecuteOptions) {
  const { variables, onStep, onToolCall, maxSteps = 10 } = options;

  const systemPrompt = fillTemplate(socialMediaManagerTemplate.systemPrompt, variables);

  const result = streamText({
    model: getModel(),
    system: systemPrompt,
    prompt: `Create exactly 2 social media posts for ${variables.COMPANY_NAME}.

Use the generateSocialPosts tool ONCE to create 2 posts for Twitter/X:
- Post 1: Launch announcement
- Post 2: Value proposition highlight

Keep it simple - just 2 posts total, no content calendar or strategy document needed.`,
    tools: {
      ...socialMediaManagerTools,
      ...sharedTools,
    },
    stopWhen: stepCountIs(maxSteps),
  });

  const steps: AgentStep[] = [];
  const toolCalls: ToolCallEvent[] = [];

  for await (const chunk of result.fullStream) {
    switch (chunk.type) {
      case "text-delta":
        onStep?.({
          id: crypto.randomUUID(),
          type: "text_output",
          content: chunk.text,
          timestamp: new Date(),
        });
        break;
      case "tool-call":
        const toolCallEvent: ToolCallEvent = {
          id: chunk.toolCallId,
          toolName: chunk.toolName,
          args: (chunk as { input?: unknown }).input as Record<string, unknown> ?? {},
          status: "running",
          startedAt: new Date(),
        };
        toolCalls.push(toolCallEvent);
        onToolCall?.(toolCallEvent);
        
        steps.push({
          id: crypto.randomUUID(),
          type: "tool_call",
          toolCall: toolCallEvent,
          timestamp: new Date(),
        });
        break;
      case "tool-result":
        const matchingCall = toolCalls.find((tc) => tc.id === chunk.toolCallId);
        if (matchingCall) {
          matchingCall.status = "completed";
          matchingCall.result = (chunk as { output?: unknown }).output;
          matchingCall.completedAt = new Date();
          onToolCall?.(matchingCall);
        }
        break;
    }
  }

  const finalResult = await result;

  return {
    text: finalResult.text,
    steps,
    toolCalls,
    usage: finalResult.usage,
  };
}

// Timeout constant for marketing department (40 seconds max)
const MARKETING_TIMEOUT_MS = 40000;

// Helper to wrap a promise with a timeout
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  agentId: string
): Promise<T | { timeout: true; agentId: string }> {
  return Promise.race([
    promise,
    new Promise<{ timeout: true; agentId: string }>((resolve) =>
      setTimeout(() => resolve({ timeout: true, agentId }), timeoutMs)
    ),
  ]);
}

// Execute all Marketing agents in FULL PARALLEL for maximum speed (15s max)
export async function executeMarketingDepartment(
  variables: MarketingVariables,
  callbacks: {
    onAgentStart?: (agentId: string) => void;
    onAgentComplete?: (agentId: string, result: unknown) => void;
    onStep?: (agentId: string, step: AgentStep) => void;
    onToolCall?: (agentId: string, toolCall: ToolCallEvent) => void;
  } = {}
): Promise<Record<string, unknown>> {
  const outputs: Record<string, unknown> = {};
  const startTime = Date.now();

  // Run ALL 4 agents in parallel with individual timeouts
  const results = await Promise.all([
    // Brand Strategist
    withTimeout(
      (async () => {
        callbacks.onAgentStart?.("agent_brand_strategist");
        const result = await executeBrandStrategist({
          variables,
          onStep: (step) => callbacks.onStep?.("agent_brand_strategist", step),
          onToolCall: (tc) => callbacks.onToolCall?.("agent_brand_strategist", tc),
          maxSteps: 4, // Reduced for speed
        });
        outputs.brandStrategy = result;
        callbacks.onAgentComplete?.("agent_brand_strategist", result);
        return result;
      })(),
      MARKETING_TIMEOUT_MS,
      "agent_brand_strategist"
    ),
    // Designer
    withTimeout(
      (async () => {
        callbacks.onAgentStart?.("agent_designer");
        const result = await executeDesigner({
          variables,
          onStep: (step) => callbacks.onStep?.("agent_designer", step),
          onToolCall: (tc) => callbacks.onToolCall?.("agent_designer", tc),
          maxSteps: 4,
        });
        outputs.design = result;
        callbacks.onAgentComplete?.("agent_designer", result);
        return result;
      })(),
      MARKETING_TIMEOUT_MS,
      "agent_designer"
    ),
    // Content Writer
    withTimeout(
      (async () => {
        callbacks.onAgentStart?.("agent_content_writer");
        const result = await executeContentWriter({
          variables,
          onStep: (step) => callbacks.onStep?.("agent_content_writer", step),
          onToolCall: (tc) => callbacks.onToolCall?.("agent_content_writer", tc),
          maxSteps: 4,
        });
        outputs.content = result;
        callbacks.onAgentComplete?.("agent_content_writer", result);
        return result;
      })(),
      MARKETING_TIMEOUT_MS,
      "agent_content_writer"
    ),
    // Social Media Manager
    withTimeout(
      (async () => {
        callbacks.onAgentStart?.("agent_social_media");
        const result = await executeSocialMediaManager({
          variables,
          onStep: (step) => callbacks.onStep?.("agent_social_media", step),
          onToolCall: (tc) => callbacks.onToolCall?.("agent_social_media", tc),
          maxSteps: 4,
        });
        outputs.socialMedia = result;
        callbacks.onAgentComplete?.("agent_social_media", result);
        return result;
      })(),
      MARKETING_TIMEOUT_MS,
      "agent_social_media"
    ),
  ]);

  // Log any timeouts
  const elapsed = Date.now() - startTime;
  console.log(`[Marketing] Completed in ${elapsed}ms`);

  for (const result of results) {
    if (result && typeof result === 'object' && 'timeout' in result) {
      console.warn(`[Marketing] Agent ${result.agentId} timed out after ${MARKETING_TIMEOUT_MS}ms`);
      callbacks.onAgentComplete?.(result.agentId, { timedOut: true });
    }
  }

  return outputs;
}
