import { openai } from "@ai-sdk/openai";

// Default model - using gpt-4o-mini for higher rate limits
export const DEFAULT_MODEL = "gpt-4o-mini";

// Get the configured model
export function getModel(modelId: string = DEFAULT_MODEL) {
  return openai(modelId);
}

// Model configuration for different use cases
export const MODEL_CONFIG = {
  // For complex reasoning tasks (use sparingly due to rate limits)
  reasoning: "gpt-4o",
  // Default for most tasks - higher rate limits
  fast: "gpt-4o-mini",
} as const;
