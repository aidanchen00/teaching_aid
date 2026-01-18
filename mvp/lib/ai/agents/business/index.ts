import { generateObject } from "ai";
import { z } from "zod";
import { getModel } from "../../model";
import type { AgentStep } from "../../types";
import PptxGenJS from "pptxgenjs";
import { runCrewAIResearch, type CrewAIResearchOutput } from "@/lib/crewai/client";

// Business variables from user input
export interface BusinessVariables {
  companyName: string;
  industry: string;
  productDescription: string;
  targetAudience?: string;
  fundingStage?: string;
  revenueModel?: string;
  uniqueValue?: string;
  competitors?: string;
}

// Business presentation types
export type BusinessReportType =
  | "pitch_deck"
  | "business_plan"
  | "competitive_analysis"
  | "go_to_market";

// Chart data structure for slides (exported for type reference)
export interface ChartData {
  type: "bar" | "pie" | "doughnut" | "line" | "area";
  title?: string;
  labels: string[];
  values: number[];
  colors?: string[];
}

// Simple slide structure with chart support
export interface SimpleSlide {
  title: string;
  subtitle?: string;
  bullets?: string[];
  notes?: string;
  chart?: ChartData;
  layout?: "bullets" | "chart" | "split" | "comparison";
  leftColumn?: string[];
  rightColumn?: string[];
}

export interface PresentationData {
  title: string;
  subtitle?: string;
  slides: SimpleSlide[];
}

export interface BusinessArtifact {
  id: string;
  type: BusinessReportType;
  title: string;
  data: {
    presentation?: PresentationData;
    pptxBase64?: string;
    slideCount?: number;
    insights?: string[];
    summary?: string;
  };
  createdAt: Date;
}

// Slide schema - all fields required for OpenAI structured outputs
const SlideSchema = z.object({
  title: z.string().describe("Slide title"),
  subtitle: z.string().describe("Slide subtitle or key point (use empty string if none)"),
  bullets: z.array(z.string()).describe("Bullet points for this slide"),
  notes: z.string().describe("Speaker notes (use empty string if none)"),
});

// Presentation schema - all fields required for OpenAI structured outputs
const PresentationSchema = z.object({
  title: z.string().describe("Presentation title"),
  subtitle: z.string().describe("Presentation subtitle (use empty string if none)"),
  slides: z.array(SlideSchema).describe("Array of slides"),
});

// Helper to normalize AI output
function normalizePresentation(data: unknown, defaultTitle: string): PresentationData {
  // Handle case where AI wraps output in { presentation: { ... } }
  let normalized = data as Record<string, unknown>;
  if (normalized.presentation && typeof normalized.presentation === 'object') {
    normalized = normalized.presentation as Record<string, unknown>;
  }

  const slides = normalized.slides as Array<{
    title: string;
    subtitle: string;
    bullets: string[];
    notes: string;
  }> | undefined;

  if (!slides || !Array.isArray(slides)) {
    throw new Error('No slides array found in response');
  }

  return {
    title: (normalized.title as string) || defaultTitle,
    subtitle: (normalized.subtitle as string) || undefined,
    slides: slides.map(slide => ({
      title: slide.title || 'Untitled Slide',
      subtitle: slide.subtitle || undefined,
      bullets: slide.bullets || [],
      notes: slide.notes || undefined,
    })),
  };
}

// Extract presentation data from error object if validation failed but data exists
function extractPresentationFromError(error: unknown, defaultTitle: string): PresentationData | null {
  try {
    // Check if error has a value property with presentation data
    const errorObj = error as { value?: unknown; cause?: { value?: unknown } };
    let rawValue = errorObj.value;

    // Also check cause.value
    if (!rawValue && errorObj.cause && typeof errorObj.cause === 'object') {
      rawValue = (errorObj.cause as { value?: unknown }).value;
    }

    if (rawValue && typeof rawValue === 'object') {
      return normalizePresentation(rawValue, defaultTitle);
    }
  } catch {
    // Extraction failed
  }
  return null;
}

// Shared system prompt for presentation generation
const PRESENTATION_SYSTEM_PROMPT = `You are a presentation generator that outputs ONLY valid JSON.

CRITICAL: Your output must be a JSON object with this EXACT structure:
{
  "title": "Presentation Title",
  "subtitle": "Optional subtitle",
  "slides": [
    {
      "title": "Slide Title",
      "subtitle": "Optional slide subtitle",
      "bullets": ["Point 1", "Point 2", "Point 3"],
      "notes": "Optional speaker notes"
    }
  ]
}

RULES:
- Output ONLY the JSON object, no markdown, no explanations
- ALL fields are REQUIRED - use empty string "" if no value
- Each slide MUST have: title, subtitle, bullets (array), notes
- Never use markdown formatting in the JSON values`;

// Parse markdown output to presentation format (fallback when model ignores JSON)
function parseMarkdownToPresentation(text: string, defaultTitle: string): PresentationData {
  const slides: SimpleSlide[] = [];

  // Split by ### Slide headers
  const slideMatches = text.split(/###\s*Slide\s*\d+[:\s]*/i).filter(s => s.trim());

  for (const slideText of slideMatches) {
    const lines = slideText.trim().split('\n').filter(l => l.trim());
    if (lines.length === 0) continue;

    // First line is the title (remove any remaining header syntax)
    let title = lines[0].replace(/^#+\s*/, '').replace(/^\*\*|\*\*$/g, '').trim();
    // Remove trailing content after " - " which is often a subtitle in the markdown
    const titleParts = title.split(' - ');
    title = titleParts[0].trim();
    const subtitle = titleParts[1]?.trim();

    // Rest are bullets (lines starting with -)
    const bullets: string[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('-')) {
        bullets.push(line.substring(1).trim());
      } else if (line.startsWith('*')) {
        bullets.push(line.substring(1).trim());
      }
    }

    if (title) {
      slides.push({ title, subtitle, bullets });
    }
  }

  return {
    title: defaultTitle,
    slides,
  };
}

// Enhance a presentation with contextual charts based on slide content
function enhancePresentationWithCharts(
  presentation: PresentationData,
  presentationType: BusinessReportType,
  variables: BusinessVariables
): PresentationData {
  const enhancedSlides = presentation.slides.map((slide, index) => {
    const titleLower = slide.title.toLowerCase();
    const enhancedSlide = { ...slide };

    // Add charts based on slide title patterns
    if (presentationType === "pitch_deck") {
      // Market Size slide
      if (titleLower.includes("market") && (titleLower.includes("size") || titleLower.includes("opportunity"))) {
        enhancedSlide.layout = "split";
        enhancedSlide.chart = {
          type: "doughnut",
          title: "Market Segments",
          labels: ["Target Segment", "Adjacent Market", "Future Expansion"],
          values: [45, 35, 20],
        };
      }
      // Traction / Growth slide
      else if (titleLower.includes("traction") || titleLower.includes("growth") || titleLower.includes("metrics")) {
        enhancedSlide.layout = "split";
        enhancedSlide.chart = {
          type: "line",
          title: "Growth",
          labels: ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6"],
          values: [10, 25, 45, 80, 120, 180],
        };
      }
      // Financial slide
      else if (titleLower.includes("financial") || titleLower.includes("revenue") || titleLower.includes("projection")) {
        enhancedSlide.layout = "chart";
        enhancedSlide.chart = {
          type: "bar",
          title: "Revenue Projection",
          labels: ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"],
          values: [500, 1200, 2800, 5500, 10000],
        };
      }
      // Competition slide
      else if (titleLower.includes("competit") || titleLower.includes("landscape")) {
        enhancedSlide.layout = "split";
        enhancedSlide.chart = {
          type: "bar",
          title: "Market Share",
          labels: [variables.companyName, "Competitor A", "Competitor B", "Others"],
          values: [15, 30, 25, 30],
        };
      }
      // The Ask / Funding slide
      else if (titleLower.includes("ask") || titleLower.includes("funding") || titleLower.includes("investment")) {
        enhancedSlide.layout = "split";
        enhancedSlide.chart = {
          type: "pie",
          title: "Fund Allocation",
          labels: ["Product Dev", "Marketing", "Team", "Operations"],
          values: [40, 25, 25, 10],
        };
      }
    }

    if (presentationType === "business_plan") {
      // Financial Plan slide
      if (titleLower.includes("financial") || titleLower.includes("revenue")) {
        enhancedSlide.layout = "split";
        enhancedSlide.chart = {
          type: "area",
          title: "5-Year Projection",
          labels: ["Y1", "Y2", "Y3", "Y4", "Y5"],
          values: [100, 250, 500, 900, 1500],
        };
      }
      // Market Analysis slide
      else if (titleLower.includes("market") && titleLower.includes("analysis")) {
        enhancedSlide.layout = "split";
        enhancedSlide.chart = {
          type: "doughnut",
          title: "Target Market",
          labels: ["Primary", "Secondary", "Tertiary"],
          values: [50, 30, 20],
        };
      }
      // Operations slide
      else if (titleLower.includes("operation")) {
        enhancedSlide.layout = "split";
        enhancedSlide.chart = {
          type: "pie",
          title: "Cost Breakdown",
          labels: ["Personnel", "Tech", "Marketing", "Admin"],
          values: [45, 25, 20, 10],
        };
      }
      // Risk Analysis slide
      else if (titleLower.includes("risk")) {
        enhancedSlide.layout = "comparison";
        const bullets = slide.bullets || [];
        enhancedSlide.leftColumn = bullets.slice(0, Math.ceil(bullets.length / 2));
        enhancedSlide.rightColumn = bullets.slice(Math.ceil(bullets.length / 2));
      }
    }

    if (presentationType === "competitive_analysis") {
      // Market Landscape slide
      if (titleLower.includes("landscape") || titleLower.includes("overview")) {
        enhancedSlide.layout = "split";
        enhancedSlide.chart = {
          type: "doughnut",
          title: "Market Distribution",
          labels: ["Enterprise", "SMB", "Startup", "Individual"],
          values: [35, 30, 20, 15],
        };
      }
      // Competitors slide
      else if (titleLower.includes("competitor") && !titleLower.includes("advantage")) {
        enhancedSlide.layout = "split";
        enhancedSlide.chart = {
          type: "bar",
          title: "Competitor Strength",
          labels: ["Comp A", "Comp B", "Comp C", variables.companyName],
          values: [75, 65, 55, 85],
        };
      }
      // Feature Comparison slide
      else if (titleLower.includes("feature") || titleLower.includes("comparison")) {
        enhancedSlide.layout = "chart";
        enhancedSlide.chart = {
          type: "bar",
          title: "Feature Score",
          labels: [variables.companyName, "Competitor A", "Competitor B", "Competitor C"],
          values: [92, 78, 71, 65],
        };
      }
      // SWOT slide
      else if (titleLower.includes("swot")) {
        enhancedSlide.layout = "comparison";
        const bullets = slide.bullets || [];
        enhancedSlide.leftColumn = bullets.slice(0, Math.ceil(bullets.length / 2));
        enhancedSlide.rightColumn = bullets.slice(Math.ceil(bullets.length / 2));
      }
      // Strategic Positioning slide
      else if (titleLower.includes("position") || titleLower.includes("strateg")) {
        enhancedSlide.layout = "split";
        enhancedSlide.chart = {
          type: "pie",
          title: "Strategic Focus",
          labels: ["Innovation", "Customer", "Quality", "Speed"],
          values: [35, 30, 20, 15],
        };
      }
    }

    if (presentationType === "go_to_market") {
      // Market Opportunity slide
      if (titleLower.includes("opportunity") || (titleLower.includes("market") && index < 2)) {
        enhancedSlide.layout = "split";
        enhancedSlide.chart = {
          type: "doughnut",
          title: "TAM/SAM/SOM",
          labels: ["TAM", "SAM", "SOM"],
          values: [100, 40, 10],
        };
      }
      // Pricing slide
      else if (titleLower.includes("pricing") || titleLower.includes("price")) {
        enhancedSlide.layout = "chart";
        enhancedSlide.chart = {
          type: "bar",
          title: "Pricing Tiers",
          labels: ["Starter", "Pro", "Business", "Enterprise"],
          values: [29, 79, 199, 499],
        };
      }
      // Distribution / Channels slide
      else if (titleLower.includes("channel") || titleLower.includes("distribution")) {
        enhancedSlide.layout = "split";
        enhancedSlide.chart = {
          type: "pie",
          title: "Channel Mix",
          labels: ["Direct Sales", "Partners", "Online", "Referral"],
          values: [35, 25, 25, 15],
        };
      }
      // Marketing Plan slide
      else if (titleLower.includes("marketing")) {
        enhancedSlide.layout = "split";
        enhancedSlide.chart = {
          type: "doughnut",
          title: "Budget Allocation",
          labels: ["Digital", "Content", "Events", "PR"],
          values: [40, 25, 20, 15],
        };
      }
      // Success Metrics slide
      else if (titleLower.includes("metric") || titleLower.includes("kpi") || titleLower.includes("success")) {
        enhancedSlide.layout = "split";
        enhancedSlide.chart = {
          type: "line",
          title: "Target KPIs",
          labels: ["M1", "M3", "M6", "M9", "M12"],
          values: [100, 300, 600, 1000, 1500],
        };
      }
      // Timeline slide
      else if (titleLower.includes("timeline") || titleLower.includes("launch") || titleLower.includes("rollout")) {
        enhancedSlide.layout = "split";
        enhancedSlide.chart = {
          type: "bar",
          title: "Phase Progress",
          labels: ["Phase 1", "Phase 2", "Phase 3", "Phase 4"],
          values: [100, 75, 50, 25],
        };
      }
    }

    return enhancedSlide;
  });

  return {
    ...presentation,
    slides: enhancedSlides,
  };
}

// Map chart type to PptxGenJS chart type
function getChartType(pptx: PptxGenJS, type: ChartData["type"]): PptxGenJS.CHART_NAME {
  switch (type) {
    case "bar": return pptx.ChartType.bar;
    case "pie": return pptx.ChartType.pie;
    case "doughnut": return pptx.ChartType.doughnut;
    case "line": return pptx.ChartType.line;
    case "area": return pptx.ChartType.area;
    default: return pptx.ChartType.bar;
  }
}

// Default chart colors palette
const CHART_COLORS = [
  "3B82F6", // Blue
  "10B981", // Green
  "F59E0B", // Amber
  "EF4444", // Red
  "8B5CF6", // Purple
  "EC4899", // Pink
  "06B6D4", // Cyan
  "84CC16", // Lime
];

// Generate PPTX using PptxGenJS with charts and enhanced visuals
async function generatePPTX(
  presentationData: PresentationData,
  companyName: string,
  primaryColor: string = "3B82F6",
  secondaryColor: string = "10B981"
): Promise<{ pptxBase64: string; slideCount: number }> {
  const pptx = new PptxGenJS();

  // Set presentation properties
  pptx.author = companyName;
  pptx.title = presentationData.title;
  pptx.subject = presentationData.subtitle || "Business Presentation";
  pptx.company = companyName;

  // Title slide with gradient effect
  const titleSlide = pptx.addSlide();
  // Background gradient simulation with overlapping shapes
  titleSlide.addShape("rect", {
    x: 0, y: 0, w: "100%", h: "100%",
    fill: { color: primaryColor },
  });
  // Add decorative circles
  titleSlide.addShape("ellipse", {
    x: 7, y: -1, w: 4, h: 4,
    fill: { color: secondaryColor, transparency: 70 },
  });
  titleSlide.addShape("ellipse", {
    x: -1, y: 4, w: 3, h: 3,
    fill: { color: secondaryColor, transparency: 80 },
  });

  titleSlide.addText(presentationData.title, {
    x: 0.5, y: 2, w: 9, h: 1.5,
    fontSize: 44,
    bold: true,
    color: "FFFFFF",
    align: "center",
  });
  if (presentationData.subtitle) {
    titleSlide.addText(presentationData.subtitle, {
      x: 0.5, y: 3.5, w: 9, h: 0.8,
      fontSize: 24,
      color: "FFFFFF",
      align: "center",
    });
  }
  titleSlide.addText(companyName, {
    x: 0.5, y: 4.8, w: 9, h: 0.5,
    fontSize: 18,
    color: "FFFFFF",
    align: "center",
  });

  // Content slides
  for (let slideIndex = 0; slideIndex < presentationData.slides.length; slideIndex++) {
    const slide = presentationData.slides[slideIndex];
    const contentSlide = pptx.addSlide();

    // Header bar with accent
    contentSlide.addShape("rect", {
      x: 0, y: 0, w: "100%", h: 0.5,
      fill: { color: primaryColor },
    });
    // Small accent shape
    contentSlide.addShape("rect", {
      x: 0, y: 0.5, w: 2, h: 0.08,
      fill: { color: secondaryColor },
    });

    // Slide title
    contentSlide.addText(slide.title, {
      x: 0.5, y: 0.7, w: 9, h: 0.7,
      fontSize: 28,
      bold: true,
      color: primaryColor,
    });

    // Subtitle if present
    let yOffset = 1.5;
    if (slide.subtitle) {
      contentSlide.addText(slide.subtitle, {
        x: 0.5, y: 1.4, w: 9, h: 0.5,
        fontSize: 16,
        color: secondaryColor,
        italic: true,
      });
      yOffset = 2.0;
    }

    // Handle different layouts
    const layout = slide.layout || "bullets";

    if (layout === "chart" && slide.chart) {
      // Chart-only layout
      const chartData = [{
        name: slide.chart.title || "Data",
        labels: slide.chart.labels,
        values: slide.chart.values,
      }];

      const chartColors = slide.chart.colors || CHART_COLORS.slice(0, slide.chart.labels.length);

      contentSlide.addChart(getChartType(pptx, slide.chart.type), chartData, {
        x: 0.5,
        y: yOffset,
        w: 9,
        h: 3.5,
        chartColors: chartColors,
        showLegend: true,
        legendPos: "b",
        showValue: slide.chart.type !== "pie" && slide.chart.type !== "doughnut",
        showPercent: slide.chart.type === "pie" || slide.chart.type === "doughnut",
        showTitle: false,
        barDir: "bar",
        dataLabelPosition: "outEnd",
        dataLabelFontSize: 10,
        dataLabelColor: "333333",
      });
    } else if (layout === "split" && slide.chart) {
      // Split layout: bullets on left, chart on right
      if (slide.bullets && slide.bullets.length > 0) {
        const bulletText = slide.bullets.map(b => ({
          text: b,
          options: { bullet: { type: "bullet" as const, color: primaryColor }, indentLevel: 0 },
        }));

        contentSlide.addText(bulletText, {
          x: 0.5, y: yOffset, w: 4.2, h: 3.2,
          fontSize: 14,
          color: "333333",
          valign: "top",
          lineSpacingMultiple: 1.4,
        });
      }

      const chartData = [{
        name: slide.chart.title || "Data",
        labels: slide.chart.labels,
        values: slide.chart.values,
      }];

      const chartColors = slide.chart.colors || CHART_COLORS.slice(0, slide.chart.labels.length);

      contentSlide.addChart(getChartType(pptx, slide.chart.type), chartData, {
        x: 5,
        y: yOffset,
        w: 4.5,
        h: 3.2,
        chartColors: chartColors,
        showLegend: true,
        legendPos: "b",
        showValue: slide.chart.type !== "pie" && slide.chart.type !== "doughnut",
        showPercent: slide.chart.type === "pie" || slide.chart.type === "doughnut",
        showTitle: false,
      });
    } else if (layout === "comparison" && slide.leftColumn && slide.rightColumn) {
      // Two-column comparison layout
      // Left column header
      contentSlide.addShape("rect", {
        x: 0.5, y: yOffset, w: 4.2, h: 0.4,
        fill: { color: primaryColor },
      });
      contentSlide.addText("Strengths", {
        x: 0.5, y: yOffset, w: 4.2, h: 0.4,
        fontSize: 14,
        bold: true,
        color: "FFFFFF",
        align: "center",
        valign: "middle",
      });

      const leftBullets = slide.leftColumn.map(b => ({
        text: b,
        options: { bullet: { type: "bullet" as const, color: primaryColor }, indentLevel: 0 },
      }));
      contentSlide.addText(leftBullets, {
        x: 0.5, y: yOffset + 0.5, w: 4.2, h: 2.7,
        fontSize: 13,
        color: "333333",
        valign: "top",
        lineSpacingMultiple: 1.3,
      });

      // Right column header
      contentSlide.addShape("rect", {
        x: 5, y: yOffset, w: 4.2, h: 0.4,
        fill: { color: secondaryColor },
      });
      contentSlide.addText("Opportunities", {
        x: 5, y: yOffset, w: 4.2, h: 0.4,
        fontSize: 14,
        bold: true,
        color: "FFFFFF",
        align: "center",
        valign: "middle",
      });

      const rightBullets = slide.rightColumn.map(b => ({
        text: b,
        options: { bullet: { type: "bullet" as const, color: secondaryColor }, indentLevel: 0 },
      }));
      contentSlide.addText(rightBullets, {
        x: 5, y: yOffset + 0.5, w: 4.2, h: 2.7,
        fontSize: 13,
        color: "333333",
        valign: "top",
        lineSpacingMultiple: 1.3,
      });
    } else {
      // Default bullets layout with visual enhancement
      if (slide.bullets && slide.bullets.length > 0) {
        const bulletText = slide.bullets.map((b, idx) => ({
          text: b,
          options: {
            bullet: { type: "bullet" as const, color: idx % 2 === 0 ? primaryColor : secondaryColor },
            indentLevel: 0
          },
        }));

        contentSlide.addText(bulletText, {
          x: 0.5, y: yOffset, w: 9, h: 3.2,
          fontSize: 16,
          color: "333333",
          valign: "top",
          lineSpacingMultiple: 1.5,
        });
      }
    }

    // Decorative element on alternating slides
    if (slideIndex % 3 === 0) {
      contentSlide.addShape("rect", {
        x: 9.3, y: 1.5, w: 0.15, h: 2,
        fill: { color: secondaryColor, transparency: 50 },
      });
    }

    // Footer with slide number
    contentSlide.addText(companyName, {
      x: 0.5, y: 5.2, w: 3, h: 0.3,
      fontSize: 10,
      color: "666666",
    });
    contentSlide.addText(`${slideIndex + 1}`, {
      x: 9, y: 5.2, w: 0.5, h: 0.3,
      fontSize: 10,
      color: "999999",
      align: "right",
    });

    // Speaker notes
    if (slide.notes) {
      contentSlide.addNotes(slide.notes);
    }
  }

  // Thank you slide
  const endSlide = pptx.addSlide();
  endSlide.addShape("rect", {
    x: 0, y: 0, w: "100%", h: "100%",
    fill: { color: secondaryColor },
  });
  endSlide.addText("Thank You", {
    x: 0.5, y: 2, w: 9, h: 1,
    fontSize: 44,
    bold: true,
    color: "FFFFFF",
    align: "center",
  });
  endSlide.addText(companyName, {
    x: 0.5, y: 3.2, w: 9, h: 0.5,
    fontSize: 24,
    color: "FFFFFF",
    align: "center",
  });

  // Generate base64
  const pptxBase64 = await pptx.write({ outputType: "base64" }) as string;

  return {
    pptxBase64,
    slideCount: presentationData.slides.length + 2,
  };
}

// Generate a pitch deck presentation
async function generatePitchDeck(
  variables: BusinessVariables,
  onStep?: (step: AgentStep) => void
): Promise<BusinessArtifact> {
  onStep?.({
    id: crypto.randomUUID(),
    type: "thinking",
    content: `Generating pitch deck for ${variables.companyName}...`,
    timestamp: new Date(),
  });

  const prompt = `Create a 10-slide investor pitch deck for ${variables.companyName}.

Company Details:
- Company: ${variables.companyName}
- Industry: ${variables.industry}
- Product: ${variables.productDescription}
- Target Audience: ${variables.targetAudience || "Not specified"}
- Revenue Model: ${variables.revenueModel || "SaaS"}
- Unique Value: ${variables.uniqueValue || "Not specified"}
- Competitors: ${variables.competitors || "Not specified"}
- Funding Stage: ${variables.fundingStage || "seed"}

Create exactly 10 slides covering: Problem, Solution, Market Size, Product, Business Model, Traction, Competition, Team, Financials, The Ask.

Each slide needs a title and 4-6 bullet points with specific numbers and data.`;

  try {
    let presentation: PresentationData;

    try {
      const { object } = await generateObject({
        model: getModel(),
        schema: PresentationSchema,
        system: PRESENTATION_SYSTEM_PROMPT,
        prompt,
      });
      presentation = normalizePresentation(object, "Investor Pitch Deck");
    } catch (genError) {
      // Try to extract presentation from validation error (AI returned valid data but wrong format)
      const extracted = extractPresentationFromError(genError, "Investor Pitch Deck");
      if (extracted && extracted.slides.length > 0) {
        console.log("Extracted presentation from validation error for pitch deck");
        presentation = extracted;
      } else {
        // Fallback: try to parse markdown if JSON generation failed
        const errorText = genError instanceof Error && 'text' in genError ? (genError as { text?: string }).text : null;
        if (errorText && errorText.includes('###')) {
          console.log("Falling back to markdown parsing for pitch deck");
          presentation = parseMarkdownToPresentation(errorText, "Investor Pitch Deck");
        } else {
          throw genError;
        }
      }
    }

    onStep?.({
      id: crypto.randomUUID(),
      type: "text_output",
      content: `Generated ${presentation.slides.length} slides`,
      timestamp: new Date(),
    });

    // Enhance presentation with charts and visuals
    const enhancedPresentation = enhancePresentationWithCharts(presentation, "pitch_deck", variables);
    const pptxResult = await generatePPTX(enhancedPresentation, variables.companyName, "3B82F6", "10B981");

    onStep?.({
      id: crypto.randomUUID(),
      type: "text_output",
      content: `Created PowerPoint with ${pptxResult.slideCount} slides`,
      timestamp: new Date(),
    });

    return {
      id: crypto.randomUUID(),
      type: "pitch_deck",
      title: "Investor Pitch Deck",
      data: {
        presentation,
        pptxBase64: pptxResult.pptxBase64,
        slideCount: pptxResult.slideCount,
        insights: [
          `Created ${pptxResult.slideCount}-slide pitch deck`,
          "Optimized for investor presentations",
        ],
      },
      createdAt: new Date(),
    };
  } catch (error) {
    console.error("Error generating pitch deck:", error);
    return {
      id: crypto.randomUUID(),
      type: "pitch_deck",
      title: "Investor Pitch Deck",
      data: {
        summary: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        insights: ["Generation failed"],
      },
      createdAt: new Date(),
    };
  }
}

// Generate a business plan
async function generateBusinessPlan(
  variables: BusinessVariables,
  onStep?: (step: AgentStep) => void
): Promise<BusinessArtifact> {
  onStep?.({
    id: crypto.randomUUID(),
    type: "thinking",
    content: `Generating business plan for ${variables.companyName}...`,
    timestamp: new Date(),
  });

  const prompt = `Create an 8-slide business plan presentation.

Company: ${variables.companyName}
Industry: ${variables.industry}
Product: ${variables.productDescription}
Target Audience: ${variables.targetAudience || "Not specified"}
Revenue Model: ${variables.revenueModel || "SaaS"}

Create exactly 8 slides:
1. Executive Summary - Company mission and overview
2. Products/Services - What you offer
3. Market Analysis - Target market and opportunity size
4. Marketing Strategy - Customer acquisition approach
5. Operations - How the business runs day-to-day
6. Financial Plan - Revenue model and projections
7. Risk Analysis - Key risks and mitigations
8. Next Steps - Timeline and action items

Each slide should have 4-6 detailed bullet points.`;

  try {
    let presentation: PresentationData;

    try {
      const { object } = await generateObject({
        model: getModel(),
        schema: PresentationSchema,
        system: PRESENTATION_SYSTEM_PROMPT,
        prompt,
      });
      presentation = normalizePresentation(object, "Business Plan");
    } catch (genError) {
      // Try to extract presentation from validation error
      const extracted = extractPresentationFromError(genError, "Business Plan");
      if (extracted && extracted.slides.length > 0) {
        console.log("Extracted presentation from validation error for business plan");
        presentation = extracted;
      } else {
        const errorText = genError instanceof Error && 'text' in genError ? (genError as { text?: string }).text : null;
        if (errorText && errorText.includes('###')) {
          console.log("Falling back to markdown parsing for business plan");
          presentation = parseMarkdownToPresentation(errorText, "Business Plan");
        } else {
          throw genError;
        }
      }
    }

    // Enhance presentation with charts and visuals
    const enhancedPresentation = enhancePresentationWithCharts(presentation, "business_plan", variables);
    const pptxResult = await generatePPTX(enhancedPresentation, variables.companyName, "8B5CF6", "F59E0B");

    onStep?.({
      id: crypto.randomUUID(),
      type: "text_output",
      content: `Generated business plan with ${pptxResult.slideCount} slides`,
      timestamp: new Date(),
    });

    return {
      id: crypto.randomUUID(),
      type: "business_plan",
      title: "Business Plan",
      data: {
        presentation,
        pptxBase64: pptxResult.pptxBase64,
        slideCount: pptxResult.slideCount,
        insights: [
          `Created ${pptxResult.slideCount}-slide business plan`,
          "Covers strategy, operations, and financials",
        ],
      },
      createdAt: new Date(),
    };
  } catch (error) {
    console.error("Error generating business plan:", error);
    return {
      id: crypto.randomUUID(),
      type: "business_plan",
      title: "Business Plan",
      data: {
        summary: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        insights: ["Generation failed"],
      },
      createdAt: new Date(),
    };
  }
}

// Generate competitive analysis
async function generateCompetitiveAnalysis(
  variables: BusinessVariables,
  onStep?: (step: AgentStep) => void
): Promise<BusinessArtifact> {
  onStep?.({
    id: crypto.randomUUID(),
    type: "thinking",
    content: `Generating competitive analysis for ${variables.companyName}...`,
    timestamp: new Date(),
  });

  const prompt = `Create a 6-slide competitive analysis.

Company: ${variables.companyName}
Industry: ${variables.industry}
Product: ${variables.productDescription}
Unique Value: ${variables.uniqueValue || "Not specified"}
Competitors: ${variables.competitors || "General market competitors"}

Create exactly 6 slides:
1. Market Landscape - Industry overview and key trends
2. Key Competitors - Top 3-5 competitors with their strengths
3. Feature Comparison - How you stack up on key features
4. Competitive Advantages - What sets you apart
5. SWOT Analysis - Strengths, Weaknesses, Opportunities, Threats
6. Strategic Positioning - Your winning strategy

Each slide should have 4-6 detailed bullet points with specific insights.`;

  try {
    let presentation: PresentationData;

    try {
      const { object } = await generateObject({
        model: getModel(),
        schema: PresentationSchema,
        system: PRESENTATION_SYSTEM_PROMPT,
        prompt,
      });
      presentation = normalizePresentation(object, "Competitive Analysis");
    } catch (genError) {
      // Try to extract presentation from validation error
      const extracted = extractPresentationFromError(genError, "Competitive Analysis");
      if (extracted && extracted.slides.length > 0) {
        console.log("Extracted presentation from validation error for competitive analysis");
        presentation = extracted;
      } else {
        const errorText = genError instanceof Error && 'text' in genError ? (genError as { text?: string }).text : null;
        if (errorText && errorText.includes('###')) {
          console.log("Falling back to markdown parsing for competitive analysis");
          presentation = parseMarkdownToPresentation(errorText, "Competitive Analysis");
        } else {
          throw genError;
        }
      }
    }

    // Enhance presentation with charts and visuals
    const enhancedPresentation = enhancePresentationWithCharts(presentation, "competitive_analysis", variables);
    const pptxResult = await generatePPTX(enhancedPresentation, variables.companyName, "F59E0B", "EF4444");

    onStep?.({
      id: crypto.randomUUID(),
      type: "text_output",
      content: `Generated competitive analysis with ${pptxResult.slideCount} slides`,
      timestamp: new Date(),
    });

    return {
      id: crypto.randomUUID(),
      type: "competitive_analysis",
      title: "Competitive Analysis",
      data: {
        presentation,
        pptxBase64: pptxResult.pptxBase64,
        slideCount: pptxResult.slideCount,
        insights: [
          `Analyzed ${variables.industry} competitive landscape`,
          "Identified key differentiators",
        ],
      },
      createdAt: new Date(),
    };
  } catch (error) {
    console.error("Error generating competitive analysis:", error);
    return {
      id: crypto.randomUUID(),
      type: "competitive_analysis",
      title: "Competitive Analysis",
      data: {
        summary: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        insights: ["Generation failed"],
      },
      createdAt: new Date(),
    };
  }
}

// Generate go-to-market strategy
async function generateGoToMarket(
  variables: BusinessVariables,
  onStep?: (step: AgentStep) => void
): Promise<BusinessArtifact> {
  onStep?.({
    id: crypto.randomUUID(),
    type: "thinking",
    content: `Generating GTM strategy for ${variables.companyName}...`,
    timestamp: new Date(),
  });

  const prompt = `Create an 8-slide go-to-market strategy.

Company: ${variables.companyName}
Industry: ${variables.industry}
Product: ${variables.productDescription}
Target Audience: ${variables.targetAudience || "Not specified"}
Revenue Model: ${variables.revenueModel || "SaaS"}
Unique Value: ${variables.uniqueValue || "Not specified"}

Create exactly 8 slides:
1. Market Opportunity - Why now and market size
2. Target Customers - Primary customer segments
3. Value Proposition - Core messaging
4. Pricing Strategy - Pricing tiers with specifics
5. Distribution Channels - How to reach customers
6. Marketing Plan - Key channels and tactics
7. Launch Timeline - Phased rollout plan
8. Success Metrics - KPIs and targets

Each slide should have 4-6 actionable bullet points.`;

  try {
    let presentation: PresentationData;

    try {
      const { object } = await generateObject({
        model: getModel(),
        schema: PresentationSchema,
        system: PRESENTATION_SYSTEM_PROMPT,
        prompt,
      });
      presentation = normalizePresentation(object, "Go-to-Market Strategy");
    } catch (genError) {
      // Try to extract presentation from validation error
      const extracted = extractPresentationFromError(genError, "Go-to-Market Strategy");
      if (extracted && extracted.slides.length > 0) {
        console.log("Extracted presentation from validation error for GTM strategy");
        presentation = extracted;
      } else {
        const errorText = genError instanceof Error && 'text' in genError ? (genError as { text?: string }).text : null;
        if (errorText && errorText.includes('###')) {
          console.log("Falling back to markdown parsing for GTM strategy");
          presentation = parseMarkdownToPresentation(errorText, "Go-to-Market Strategy");
        } else {
          throw genError;
        }
      }
    }

    // Enhance presentation with charts and visuals
    const enhancedPresentation = enhancePresentationWithCharts(presentation, "go_to_market", variables);
    const pptxResult = await generatePPTX(enhancedPresentation, variables.companyName, "10B981", "3B82F6");

    onStep?.({
      id: crypto.randomUUID(),
      type: "text_output",
      content: `Generated GTM strategy with ${pptxResult.slideCount} slides`,
      timestamp: new Date(),
    });

    return {
      id: crypto.randomUUID(),
      type: "go_to_market",
      title: "Go-to-Market Strategy",
      data: {
        presentation,
        pptxBase64: pptxResult.pptxBase64,
        slideCount: pptxResult.slideCount,
        insights: [
          `Created actionable GTM plan`,
          "Includes pricing, channels, and timeline",
        ],
      },
      createdAt: new Date(),
    };
  } catch (error) {
    console.error("Error generating GTM strategy:", error);
    return {
      id: crypto.randomUUID(),
      type: "go_to_market",
      title: "Go-to-Market Strategy",
      data: {
        summary: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        insights: ["Generation failed"],
      },
      createdAt: new Date(),
    };
  }
}

// ============================================
// CREWAI MARKET RESEARCH (OPTIONAL)
// ============================================

/**
 * Run CrewAI market research to enhance business presentations
 * This is optional and will gracefully fail if CrewAI is not installed
 */
export async function runMarketResearch(
  variables: BusinessVariables,
  onStep?: (step: AgentStep) => void
): Promise<CrewAIResearchOutput | null> {
  onStep?.({
    id: crypto.randomUUID(),
    type: "thinking",
    content: `Running AI-powered market research with CrewAI for ${variables.companyName}...`,
    timestamp: new Date(),
  });

  try {
    const competitors = variables.competitors
      ? variables.competitors.split(",").map(c => c.trim())
      : [];

    const result = await runCrewAIResearch({
      companyName: variables.companyName,
      industry: variables.industry,
      competitors,
      targetAudience: variables.targetAudience,
    });

    if (result.success) {
      onStep?.({
        id: crypto.randomUUID(),
        type: "text_output",
        content: `CrewAI research completed: Market analysis, competitive intelligence, and strategic recommendations generated`,
        timestamp: new Date(),
      });
    } else {
      onStep?.({
        id: crypto.randomUUID(),
        type: "text_output",
        content: `CrewAI research skipped: ${result.error || "Not available"}`,
        timestamp: new Date(),
      });
    }

    return result;
  } catch (error) {
    onStep?.({
      id: crypto.randomUUID(),
      type: "text_output",
      content: `CrewAI research not available (optional): ${error instanceof Error ? error.message : "Unknown error"}`,
      timestamp: new Date(),
    });
    return null;
  }
}

// Execute the full business department
export async function executeBusinessDepartment(
  variables: BusinessVariables,
  callbacks: {
    onAgentStart?: (agentId: string) => void;
    onAgentComplete?: (agentId: string, result: unknown) => void;
    onStep?: (agentId: string, step: AgentStep) => void;
    onArtifact?: (artifact: BusinessArtifact) => void;
  } = {}
): Promise<{
  artifacts: BusinessArtifact[];
  message: string;
}> {
  const agentId = "agent_strategy_lead";
  callbacks.onAgentStart?.(agentId);

  const artifacts: BusinessArtifact[] = [];

  callbacks.onStep?.(agentId, {
    id: crypto.randomUUID(),
    type: "thinking",
    content: `Starting business strategy generation for ${variables.companyName}...`,
    timestamp: new Date(),
  });

  const generators = [
    { fn: generatePitchDeck, name: "pitch deck" },
    { fn: generateBusinessPlan, name: "business plan" },
    { fn: generateCompetitiveAnalysis, name: "competitive analysis" },
    { fn: generateGoToMarket, name: "GTM strategy" },
  ];

  for (const { fn, name } of generators) {
    callbacks.onStep?.(agentId, {
      id: crypto.randomUUID(),
      type: "thinking",
      content: `Generating ${name}...`,
      timestamp: new Date(),
    });

    const artifact = await fn(variables, (step) => callbacks.onStep?.(agentId, step));
    artifacts.push(artifact);
    callbacks.onArtifact?.(artifact);
  }

  callbacks.onAgentComplete?.(agentId, { artifacts });

  return {
    artifacts,
    message: `Generated ${artifacts.length} business presentations for ${variables.companyName}`,
  };
}
