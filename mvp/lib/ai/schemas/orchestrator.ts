import { z } from "zod";

// Schema for executing a department
export const ExecuteMarketingSchema = z.object({
  companyName: z.string().describe("Name of the company/brand"),
  industry: z.string().describe("Industry or sector (e.g., fitness, technology, food)"),
  targetAudience: z.string().describe("Description of target audience"),
  productDescription: z.string().describe("What the product or service does"),
  uniqueValue: z.string().describe("Unique value proposition"),
  tone: z.string().describe("Brand tone/voice (e.g., professional, playful, luxurious)"),
  competitors: z.string().describe("Key competitors in the space"),
});

export type ExecuteMarketingVariables = z.infer<typeof ExecuteMarketingSchema>;

// Generic execute department action
export const ExecuteDepartmentActionSchema = z.object({
  action: z.literal("execute_department"),
  department: z.enum(["marketing", "engineering", "sales", "operations", "business"]),
  variables: ExecuteMarketingSchema, // For now, marketing is the only one implemented
});

export type ExecuteDepartmentAction = z.infer<typeof ExecuteDepartmentActionSchema>;

// Validate and parse execute action from AI response
export function parseExecuteAction(content: string): ExecuteDepartmentAction | null {
  // Try to find JSON in the content
  const patterns = [
    /```json\s*(\{[\s\S]*?\})\s*```/, // JSON code block
    /```\s*(\{[\s\S]*?"action"[\s\S]*?\})\s*```/, // Generic code block with action
    /(\{"action"\s*:\s*"execute_department"[\s\S]*?\})/, // Inline JSON
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      try {
        const parsed = JSON.parse(match[1]);
        const result = ExecuteDepartmentActionSchema.safeParse(parsed);
        if (result.success) {
          return result.data;
        }
      } catch {
        continue;
      }
    }
  }

  return null;
}
