import { tool } from "ai";
import { z } from "zod";
import { generateBrandImage } from "@/lib/ai/openai";
import {
  BrandIdentitySchema,
  ColorPaletteSchema,
  TypographySchema,
  LogoConceptSchema,
  WebsiteCopySchema,
  SocialMediaPlanSchema,
} from "../../types";

// ============================================
// BRAND STRATEGIST TOOLS
// ============================================

export const analyzeMarketTool = tool({
  description:
    "Analyze the market landscape, competitors, and identify positioning opportunities",
  inputSchema: z.object({
    industry: z.string().describe("The industry to analyze"),
    competitors: z
      .array(z.string())
      .describe("List of competitor names to analyze"),
    targetMarket: z.string().describe("Description of the target market"),
  }),
  execute: async ({ industry, competitors, targetMarket }) => {
    return {
      industry,
      competitors,
      targetMarket,
      analysisComplete: true,
      insights: {
        marketSize: "Analysis pending - LLM will provide based on context",
        trends: [],
        opportunities: [],
        threats: [],
      },
    };
  },
});

export const defineBrandIdentityTool = tool({
  description:
    "Define and save the complete brand identity including mission, vision, values, and positioning",
  inputSchema: BrandIdentitySchema,
  execute: async (brandIdentity) => {
    const id = crypto.randomUUID();
    return {
      success: true,
      documentId: id,
      brandIdentity,
      message: `Brand identity for ${brandIdentity.companyName} created successfully`,
    };
  },
});

export const createMessagingFrameworkTool = tool({
  description:
    "Create a messaging framework with key messages for different audiences and contexts",
  inputSchema: z.object({
    companyName: z.string(),
    elevatorPitch: z
      .string()
      .describe("30-second elevator pitch for the company"),
    keyMessages: z.array(
      z.object({
        audience: z.string().describe("Target audience for this message"),
        message: z.string().describe("The key message"),
        proofPoints: z
          .array(z.string())
          .describe("Supporting proof points"),
      })
    ),
    boilerplate: z.string().describe("Standard company boilerplate text"),
  }),
  execute: async (messagingFramework) => {
    const id = crypto.randomUUID();
    return {
      success: true,
      documentId: id,
      messagingFramework,
      message: "Messaging framework created successfully",
    };
  },
});

// ============================================
// DESIGNER TOOLS
// ============================================

export const generateColorPaletteTool = tool({
  description:
    "Generate and save a complete color palette for the brand including primary, secondary, accent, and semantic colors",
  inputSchema: ColorPaletteSchema,
  execute: async (colorPalette) => {
    const id = crypto.randomUUID();
    return {
      success: true,
      documentId: id,
      colorPalette,
      message: "Color palette created successfully",
      cssVariables: generateCSSVariables(colorPalette),
    };
  },
});

function generateCSSVariables(palette: z.infer<typeof ColorPaletteSchema>) {
  return `
:root {
  --color-primary: ${palette.primary.hex};
  --color-secondary: ${palette.secondary.hex};
  --color-accent: ${palette.accent.hex};
  ${palette.neutral.map((n, i) => `--color-neutral-${i + 1}: ${n.hex};`).join("\n  ")}
  --color-success: ${palette.semantic.success};
  --color-warning: ${palette.semantic.warning};
  --color-error: ${palette.semantic.error};
  --color-info: ${palette.semantic.info};
}`.trim();
}

export const defineTypographyTool = tool({
  description:
    "Define and save the typography system including font families and scale",
  inputSchema: TypographySchema,
  execute: async (typography) => {
    const id = crypto.randomUUID();
    return {
      success: true,
      documentId: id,
      typography,
      message: "Typography system created successfully",
      cssVariables: generateTypographyCSS(typography),
    };
  },
});

function generateTypographyCSS(typography: z.infer<typeof TypographySchema>) {
  return `
:root {
  --font-heading: '${typography.headingFont.family}', ${typography.headingFont.fallback};
  --font-body: '${typography.bodyFont.family}', ${typography.bodyFont.fallback};
  --text-h1: ${typography.scale.h1};
  --text-h2: ${typography.scale.h2};
  --text-h3: ${typography.scale.h3};
  --text-h4: ${typography.scale.h4};
  --text-body: ${typography.scale.body};
  --text-small: ${typography.scale.small};
}`.trim();
}

export const generateLogoTool = tool({
  description:
    "Generate SVG logo concepts for the brand. Creates a main logo and variations.",
  inputSchema: LogoConceptSchema,
  execute: async (logoConcept) => {
    const id = crypto.randomUUID();
    return {
      success: true,
      documentId: id,
      logoConcept,
      message: "Logo concept created successfully",
      previewUrl: `data:image/svg+xml,${encodeURIComponent(logoConcept.svgCode)}`,
    };
  },
});

// ============================================
// OPENAI DALL-E IMAGE GENERATION TOOL
// ============================================

export const generateBrandImageTool = tool({
  description:
    "Generate AI images using OpenAI DALL-E 3 for brand assets like hero images, social media visuals, or product showcases. Use this for photorealistic or artistic images (not SVG logos).",
  inputSchema: z.object({
    companyName: z.string().describe("The company name"),
    imageType: z
      .enum(["hero", "social", "product"])
      .describe("Type of image to generate: hero (website banner), social (social media post), product (product showcase)"),
    description: z
      .string()
      .describe("Detailed description of what the image should show"),
    brandColors: z
      .object({
        primary: z.string().optional().describe("Primary brand color (hex)"),
        secondary: z.string().optional().describe("Secondary brand color (hex)"),
        accent: z.string().optional().describe("Accent brand color (hex)"),
      })
      .optional()
      .describe("Brand colors to incorporate into the image"),
  }),
  execute: async ({ companyName, imageType, description, brandColors }) => {
    try {
      const result = await generateBrandImage(
        companyName,
        imageType,
        description,
        brandColors
      );

      const id = crypto.randomUUID();
      return {
        success: true,
        documentId: id,
        imageUrl: result.url,
        revisedPrompt: result.revisedPrompt,
        imageType,
        message: `${imageType} image generated successfully using DALL-E 3`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate image",
        message: "Image generation failed - DALL-E may be unavailable or API key not configured",
      };
    }
  },
});

// ============================================
// CONTENT WRITER TOOLS
// ============================================

export const generateWebsiteCopyTool = tool({
  description:
    "Generate and save complete website copy including hero, about, features, and footer sections",
  inputSchema: WebsiteCopySchema,
  execute: async (websiteCopy) => {
    const id = crypto.randomUUID();
    return {
      success: true,
      documentId: id,
      websiteCopy,
      message: "Website copy created successfully",
    };
  },
});

export const generateTaglinesTool = tool({
  description: "Generate multiple tagline options for the brand",
  inputSchema: z.object({
    companyName: z.string(),
    taglines: z.array(
      z.object({
        tagline: z.string(),
        rationale: z.string().describe("Why this tagline works"),
        useCase: z
          .string()
          .describe("Best context to use this tagline"),
      })
    ),
    recommendedTagline: z.string().describe("The recommended primary tagline"),
  }),
  execute: async (taglines) => {
    const id = crypto.randomUUID();
    return {
      success: true,
      documentId: id,
      taglines,
      message: "Taglines created successfully",
    };
  },
});

// ============================================
// SOCIAL MEDIA MANAGER TOOLS
// ============================================

export const createSocialMediaPlanTool = tool({
  description:
    "Create and save a complete social media strategy including platforms, content pillars, and content calendar",
  inputSchema: SocialMediaPlanSchema,
  execute: async (socialMediaPlan) => {
    const id = crypto.randomUUID();
    return {
      success: true,
      documentId: id,
      socialMediaPlan,
      message: "Social media plan created successfully",
      totalPosts: socialMediaPlan.contentCalendar.reduce(
        (sum, week) => sum + week.posts.length,
        0
      ),
    };
  },
});

export const generateSocialPostsTool = tool({
  description: "Generate individual social media posts for specific platforms",
  inputSchema: z.object({
    platform: z.enum(["twitter", "linkedin", "instagram", "facebook", "tiktok"]),
    posts: z.array(
      z.object({
        content: z.string(),
        hashtags: z.array(z.string()),
        mediaDescription: z
          .string()
          .optional()
          .describe("Description of accompanying media if any"),
        scheduledFor: z.string().optional().describe("Suggested posting time"),
        type: z.enum(["text", "image", "video", "carousel", "story"]),
      })
    ),
  }),
  execute: async ({ platform, posts }) => {
    const id = crypto.randomUUID();
    return {
      success: true,
      documentId: id,
      platform,
      postCount: posts.length,
      posts,
      message: `${posts.length} ${platform} posts created successfully`,
    };
  },
});

// ============================================
// SHARED TOOLS
// ============================================

export const saveBrandGuidelinesTool = tool({
  description:
    "Compile and save the complete brand guidelines document in Markdown format",
  inputSchema: z.object({
    companyName: z.string(),
    version: z.string().default("1.0"),
    sections: z.array(
      z.object({
        title: z.string(),
        content: z.string().describe("Markdown content for this section"),
      })
    ),
  }),
  execute: async ({ companyName, version, sections }) => {
    const markdownContent = `# ${companyName} Brand Guidelines
**Version ${version}** | Generated ${new Date().toLocaleDateString()}

---

${sections.map((s) => `## ${s.title}\n\n${s.content}`).join("\n\n---\n\n")}
`;

    const id = crypto.randomUUID();
    return {
      success: true,
      documentId: id,
      companyName,
      version,
      sectionCount: sections.length,
      markdownContent,
      message: "Brand guidelines created successfully",
    };
  },
});

// Export all tools grouped by agent
export const brandStrategistTools = {
  analyzeMarket: analyzeMarketTool,
  defineBrandIdentity: defineBrandIdentityTool,
  createMessagingFramework: createMessagingFrameworkTool,
};

export const designerTools = {
  generateColorPalette: generateColorPaletteTool,
  defineTypography: defineTypographyTool,
  generateLogo: generateLogoTool,
  generateBrandImage: generateBrandImageTool,
};

export const contentWriterTools = {
  // Removed: generateWebsiteCopy, generateTaglines - not needed for speed
};

export const socialMediaManagerTools = {
  createSocialMediaPlan: createSocialMediaPlanTool,
  generateSocialPosts: generateSocialPostsTool,
};

export const sharedTools = {
  saveBrandGuidelines: saveBrandGuidelinesTool,
};
