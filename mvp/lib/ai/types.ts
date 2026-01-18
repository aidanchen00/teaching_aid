import { z } from "zod";

// Agent status during execution
export type AgentExecutionStatus =
  | "idle"
  | "running"
  | "completed"
  | "error"
  | "waiting_approval";

// Tool call event for UI visualization
export interface ToolCallEvent {
  id: string;
  toolName: string;
  args: Record<string, unknown>;
  status: "pending" | "running" | "completed" | "error";
  result?: unknown;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}

// Step in the agent execution (for multi-step reasoning)
export interface AgentStep {
  id: string;
  type: "thinking" | "tool_call" | "text_output";
  content?: string;
  toolCall?: ToolCallEvent;
  timestamp: Date;
}

// Agent execution state
export interface AgentExecutionState {
  agentId: string;
  agentName: string;
  status: AgentExecutionStatus;
  steps: AgentStep[];
  currentStep?: string;
  progress: number;
  outputs: AgentOutput[];
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

// Output produced by an agent
export interface AgentOutput {
  id: string;
  type: "text" | "markdown" | "svg" | "image" | "json" | "file";
  name: string;
  content: string;
  mimeType?: string;
  fileId?: string; // MongoDB GridFS file ID
  metadata?: Record<string, unknown>;
  createdAt: Date;
  createdBy: string;
}

// Department execution state
export interface DepartmentExecutionState {
  departmentId: string;
  departmentName: string;
  status: AgentExecutionStatus;
  agents: AgentExecutionState[];
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
}

// Template for agent prompts
export interface AgentPromptTemplate {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
  variables: string[]; // Variables that can be replaced in the prompt
  description: string;
}

// Department configuration
export interface DepartmentConfig {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  agents: AgentPromptTemplate[];
  dependencies: string[]; // IDs of departments this depends on
}

// Zod schemas for tool outputs
export const BrandIdentitySchema = z.object({
  companyName: z.string(),
  tagline: z.string(),
  mission: z.string(),
  vision: z.string(),
  values: z.array(z.string()),
  personality: z.object({
    traits: z.array(z.string()),
    tone: z.string(),
    voice: z.string(),
  }),
  targetAudience: z.object({
    primary: z.string(),
    secondary: z.string().optional(),
    demographics: z.array(z.string()),
    psychographics: z.array(z.string()),
  }),
  positioning: z.object({
    statement: z.string(),
    uniqueValueProposition: z.string(),
    competitors: z.array(z.string()),
    differentiators: z.array(z.string()),
  }),
});

export const ColorPaletteSchema = z.object({
  primary: z.object({
    hex: z.string(),
    name: z.string(),
    usage: z.string(),
  }),
  secondary: z.object({
    hex: z.string(),
    name: z.string(),
    usage: z.string(),
  }),
  accent: z.object({
    hex: z.string(),
    name: z.string(),
    usage: z.string(),
  }),
  neutral: z.array(
    z.object({
      hex: z.string(),
      name: z.string(),
      usage: z.string(),
    })
  ),
  semantic: z.object({
    success: z.string(),
    warning: z.string(),
    error: z.string(),
    info: z.string(),
  }),
});

export const TypographySchema = z.object({
  headingFont: z.object({
    family: z.string(),
    weights: z.array(z.number()),
    fallback: z.string(),
  }),
  bodyFont: z.object({
    family: z.string(),
    weights: z.array(z.number()),
    fallback: z.string(),
  }),
  scale: z.object({
    h1: z.string(),
    h2: z.string(),
    h3: z.string(),
    h4: z.string(),
    body: z.string(),
    small: z.string(),
  }),
});

export const LogoConceptSchema = z.object({
  concept: z.string(),
  symbolism: z.string(),
  style: z.enum(["minimal", "modern", "classic", "playful", "bold", "elegant"]),
  svgCode: z.string(),
  variations: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      svgCode: z.string(),
    })
  ),
});

export const WebsiteCopySchema = z.object({
  heroSection: z.object({
    headline: z.string(),
    subheadline: z.string(),
    ctaPrimary: z.string(),
    ctaSecondary: z.string().optional(),
  }),
  aboutSection: z.object({
    title: z.string(),
    content: z.string(),
  }),
  featuresSection: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      icon: z.string().optional(),
    })
  ),
  testimonials: z
    .array(
      z.object({
        quote: z.string(),
        author: z.string(),
        role: z.string(),
      })
    )
    .optional(),
  footerTagline: z.string(),
});

export const SocialMediaPlanSchema = z.object({
  platforms: z.array(
    z.object({
      name: z.string(),
      handle: z.string(),
      bio: z.string(),
      contentPillars: z.array(z.string()),
      postingFrequency: z.string(),
    })
  ),
  contentCalendar: z.array(
    z.object({
      week: z.number(),
      posts: z.array(
        z.object({
          platform: z.string(),
          type: z.string(),
          topic: z.string(),
          caption: z.string(),
          hashtags: z.array(z.string()),
        })
      ),
    })
  ),
  brandHashtags: z.array(z.string()),
});

export type BrandIdentity = z.infer<typeof BrandIdentitySchema>;
export type ColorPalette = z.infer<typeof ColorPaletteSchema>;
export type Typography = z.infer<typeof TypographySchema>;
export type LogoConcept = z.infer<typeof LogoConceptSchema>;
export type WebsiteCopy = z.infer<typeof WebsiteCopySchema>;
export type SocialMediaPlan = z.infer<typeof SocialMediaPlanSchema>;
