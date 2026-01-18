import { generateObject } from "ai";
import { z } from "zod";
import { getModel } from "../../model";
import type { AgentStep } from "../../types";

// Finance variables from user input
export interface FinanceVariables {
  companyName: string;
  industry: string;
  productDescription: string;
  targetAudience?: string;
  fundingStage?: string;
  revenueModel?: string;
  initialInvestment?: string;
}

// Financial report types
export type FinanceReportType =
  | "revenue_projection"
  | "market_analysis"
  | "funding_requirements"
  | "executive_summary";

// Structured data for charts
export interface RevenueData {
  year: string;
  revenue: number;
  mrr: number;
  growth: number;
}

export interface MarketData {
  segment: string;
  value: number;
  color: string;
}

export interface FundingData {
  category: string;
  amount: number;
  percentage: number;
}

export interface MetricCard {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
}

export interface FinanceArtifact {
  id: string;
  type: FinanceReportType;
  title: string;
  data: {
    metrics?: MetricCard[];
    revenueData?: RevenueData[];
    marketData?: MarketData[];
    fundingData?: FundingData[];
    insights?: string[];
    summary?: string;
  };
  createdAt: Date;
}

// Schemas for structured generation - charts only
const RevenueProjectionSchema = z.object({
  revenueData: z.array(z.object({
    year: z.string(),
    revenue: z.number(),
    mrr: z.number(),
    growth: z.number(),
  })),
  insights: z.array(z.string()),
});

const MarketAnalysisSchema = z.object({
  marketData: z.array(z.object({
    segment: z.string().optional(),
    name: z.string().optional(),
    value: z.number(),
    color: z.string(),
  }).transform(item => ({
    segment: item.segment || item.name || "Unknown",
    value: item.value,
    color: item.color,
  }))),
  insights: z.array(z.string()),
});

const FundingRequirementsSchema = z.object({
  fundingData: z.array(z.object({
    category: z.string(),
    amount: z.number(),
    percentage: z.number(),
  })),
  insights: z.array(z.string()),
});

const ExecutiveSummarySchema = z.object({
  summary: z.string(),
  insights: z.array(z.string()),
});

// Generate a single financial report
async function generateFinanceReport(
  reportType: FinanceReportType,
  variables: FinanceVariables,
  onStep?: (step: AgentStep) => void
): Promise<FinanceArtifact> {
  const titles: Record<FinanceReportType, string> = {
    revenue_projection: "Revenue Projections",
    market_analysis: "Market Analysis",
    funding_requirements: "Funding Requirements",
    executive_summary: "Executive Summary",
  };

  const prompts: Record<FinanceReportType, string> = {
    revenue_projection: `Generate 5-year revenue projection data for a ${variables.fundingStage || "seed"} stage ${variables.industry} company called ${variables.companyName}.

Return ONLY the structured data with:
- revenueData: Array of 5 years with year (e.g. "2025"), revenue (number in dollars), mrr (monthly recurring revenue number), growth (percentage as number like 150 for 150%)
- insights: 3-4 bullet points about the projections (no dash prefix)

Use realistic numbers for a ${variables.revenueModel || "SaaS"} business.`,

    market_analysis: `Generate market analysis data for ${variables.companyName} in the ${variables.industry} industry.

Return ONLY the structured data with:
- marketData: Array with 3 objects for TAM, SAM, SOM. Each object must have: "segment" (string like "TAM"), "value" (number in billions), "color" (hex string)
- insights: 3-4 bullet points about market opportunity (no dash prefix)

Example marketData item: {"segment": "TAM", "value": 50, "color": "#10B981"}

Use realistic market sizes for ${variables.industry}.`,

    funding_requirements: `Generate funding requirements data for ${variables.companyName}, a ${variables.fundingStage || "Seed"} stage startup.

Return ONLY the structured data with:
- fundingData: Array of 5-6 categories showing use of funds - each with category name, amount (number in dollars), percentage (number like 35 for 35%)
- insights: 3-4 bullet points about funding strategy (no dash prefix)

Categories should include Engineering, Marketing, Sales, Operations, etc.`,

    executive_summary: `Generate executive summary data for ${variables.companyName}, a ${variables.industry} company.

Return ONLY the structured data with:
- summary: One paragraph executive summary (2-3 sentences)
- insights: 3-4 key insights as bullet points (no dash prefix)

Focus on: revenue, growth, market size, competitive position.`,
  };

  const schemas: Record<FinanceReportType, z.ZodSchema> = {
    revenue_projection: RevenueProjectionSchema,
    market_analysis: MarketAnalysisSchema,
    funding_requirements: FundingRequirementsSchema,
    executive_summary: ExecutiveSummarySchema,
  };

  onStep?.({
    id: crypto.randomUUID(),
    type: "thinking",
    content: `Generating ${titles[reportType]}...`,
    timestamp: new Date(),
  });

  try {
    const { object } = await generateObject({
      model: getModel(),
      schema: schemas[reportType],
      system: "You are a financial data generator. Output ONLY valid JSON matching the exact schema provided. No markdown, no explanations.",
      prompt: prompts[reportType],
    });

    onStep?.({
      id: crypto.randomUUID(),
      type: "text_output",
      content: `Generated ${titles[reportType]}`,
      timestamp: new Date(),
    });

    return {
      id: crypto.randomUUID(),
      type: reportType,
      title: titles[reportType],
      data: object as FinanceArtifact["data"],
      createdAt: new Date(),
    };
  } catch (error) {
    console.error(`Error generating ${reportType}:`, error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return {
      id: crypto.randomUUID(),
      type: reportType,
      title: titles[reportType],
      data: {
        summary: `Error generating report: ${errorMessage}`,
        insights: ["Please check your API configuration and try again."],
      },
      createdAt: new Date(),
    };
  }
}

// Execute the full financial department
export async function executeFinanceDepartment(
  variables: FinanceVariables,
  callbacks: {
    onAgentStart?: (agentId: string) => void;
    onAgentComplete?: (agentId: string, result: unknown) => void;
    onStep?: (agentId: string, step: AgentStep) => void;
    onArtifact?: (artifact: FinanceArtifact) => void;
  } = {}
): Promise<{
  artifacts: FinanceArtifact[];
  message: string;
}> {
  const agentId = "agent_financial_analyst";
  callbacks.onAgentStart?.(agentId);

  const artifacts: FinanceArtifact[] = [];

  const reports: FinanceReportType[] = [
    "executive_summary",
    "revenue_projection",
    "market_analysis",
    "funding_requirements",
  ];

  callbacks.onStep?.(agentId, {
    id: crypto.randomUUID(),
    type: "thinking",
    content: `Starting financial analysis for ${variables.companyName}...`,
    timestamp: new Date(),
  });

  for (const reportType of reports) {
    const artifact = await generateFinanceReport(
      reportType,
      variables,
      (step) => callbacks.onStep?.(agentId, step)
    );
    artifacts.push(artifact);
    callbacks.onArtifact?.(artifact);
  }

  callbacks.onAgentComplete?.(agentId, { artifacts });

  return {
    artifacts,
    message: `Generated ${artifacts.length} financial reports for ${variables.companyName}`,
  };
}
