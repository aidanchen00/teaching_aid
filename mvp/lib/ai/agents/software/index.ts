import Anthropic from "@anthropic-ai/sdk";
import type { AgentStep, ToolCallEvent } from "../../types";
import type { GeneratedFile } from "@/lib/e2b";

// Software generation input from marketing outputs
export interface SoftwareVariables {
  companyName: string;
  productDescription: string;
  industry?: string;
  targetAudience?: string;
  // From defineBrandIdentity tool
  brandIdentity?: {
    mission?: string;
    vision?: string;
    tagline?: string;
    tone?: string;
    personality?: {
      traits?: string[];
      voice?: string;
    };
  };
  // From generateColorPalette tool
  colorPalette?: {
    primary?: { hex: string; name?: string };
    secondary?: { hex: string; name?: string };
    accent?: { hex: string; name?: string };
  };
  // From generateWebsiteCopy tool
  websiteCopy?: {
    hero?: {
      headline?: string;
      subheadline?: string;
      cta?: string;
    };
    about?: {
      headline?: string;
      body?: string;
    };
    features?: Array<{ title: string; description: string; icon?: string }>;
    footer?: {
      tagline?: string;
    };
  };
  // From generateTaglines tool
  taglines?: {
    recommendedTagline?: string;
    options?: Array<{ tagline: string; rationale?: string }>;
  };
  // From generateLogo tool
  logo?: {
    svgCode?: string;
    concept?: string;
  };
}

// Generate a comprehensive prompt from marketing outputs
export function generatePromptFromMarketing(variables: SoftwareVariables): string {
  const {
    companyName,
    productDescription,
    industry,
    targetAudience,
    brandIdentity,
    colorPalette,
    websiteCopy,
    taglines,
    logo
  } = variables;

  let prompt = `Build a modern, responsive landing page for ${companyName}.

## Company Info
- Company Name: ${companyName}
- Product: ${productDescription}`;

  if (industry) {
    prompt += `\n- Industry: ${industry}`;
  }
  if (targetAudience) {
    prompt += `\n- Target Audience: ${targetAudience}`;
  }

  // Brand Identity
  if (brandIdentity) {
    prompt += `\n\n## Brand Identity`;
    if (brandIdentity.mission) {
      prompt += `\n- Mission: ${brandIdentity.mission}`;
    }
    if (brandIdentity.tagline) {
      prompt += `\n- Tagline: ${brandIdentity.tagline}`;
    }
    if (brandIdentity.tone) {
      prompt += `\n- Brand Tone: ${brandIdentity.tone}`;
    }
    if (brandIdentity.personality?.voice) {
      prompt += `\n- Voice: ${brandIdentity.personality.voice}`;
    }
  }

  // Taglines
  if (taglines?.recommendedTagline) {
    prompt += `\n\n## Tagline\nUse this tagline: "${taglines.recommendedTagline}"`;
  }

  // Color Palette - CRITICAL for visual consistency
  prompt += `\n\n## Brand Colors (USE THESE EXACT COLORS)`;
  if (colorPalette?.primary?.hex) {
    prompt += `\n- Primary: ${colorPalette.primary.hex}${colorPalette.primary.name ? ` (${colorPalette.primary.name})` : ''}`;
  } else {
    prompt += `\n- Primary: #3B82F6 (default blue)`;
  }
  if (colorPalette?.secondary?.hex) {
    prompt += `\n- Secondary: ${colorPalette.secondary.hex}${colorPalette.secondary.name ? ` (${colorPalette.secondary.name})` : ''}`;
  } else {
    prompt += `\n- Secondary: #8B5CF6 (default purple)`;
  }
  if (colorPalette?.accent?.hex) {
    prompt += `\n- Accent: ${colorPalette.accent.hex}${colorPalette.accent.name ? ` (${colorPalette.accent.name})` : ''}`;
  } else {
    prompt += `\n- Accent: #EC4899 (default pink)`;
  }

  // Website Copy - USE EXACT COPY FROM MARKETING
  if (websiteCopy) {
    prompt += `\n\n## Website Copy (USE EXACTLY AS PROVIDED)`;

    if (websiteCopy.hero) {
      prompt += `\n\n### Hero Section`;
      if (websiteCopy.hero.headline) {
        prompt += `\nHeadline: "${websiteCopy.hero.headline}"`;
      }
      if (websiteCopy.hero.subheadline) {
        prompt += `\nSubheadline: "${websiteCopy.hero.subheadline}"`;
      }
      if (websiteCopy.hero.cta) {
        prompt += `\nCTA Button: "${websiteCopy.hero.cta}"`;
      }
    }

    if (websiteCopy.about) {
      prompt += `\n\n### About Section`;
      if (websiteCopy.about.headline) {
        prompt += `\nHeadline: "${websiteCopy.about.headline}"`;
      }
      if (websiteCopy.about.body) {
        prompt += `\nBody: "${websiteCopy.about.body}"`;
      }
    }

    if (websiteCopy.features && websiteCopy.features.length > 0) {
      prompt += `\n\n### Features Section`;
      for (const feature of websiteCopy.features) {
        prompt += `\n- ${feature.title}: ${feature.description}`;
      }
    }

    if (websiteCopy.footer?.tagline) {
      prompt += `\n\n### Footer`;
      prompt += `\nTagline: "${websiteCopy.footer.tagline}"`;
    }
  }

  // Logo
  if (logo?.svgCode) {
    prompt += `\n\n## Logo\nInclude this SVG logo in the header:\n\`\`\`svg\n${logo.svgCode}\n\`\`\``;
  }

  prompt += `

## Technical Requirements
- Use React with functional components
- Apply the EXACT brand colors provided above as CSS variables
- Use the EXACT copy/headlines provided - do not paraphrase
- Modern, clean design with good spacing
- Fully responsive layout (mobile-first)
- Smooth hover animations
- Include: Hero section, Features section, About section, Footer
- Use the company name "${companyName}" in the header/nav`;

  return prompt;
}

const SYSTEM_PROMPT = `You are an expert React developer. When the user describes an app they want, you generate the code for it.

You MUST respond with valid JSON in this exact format:
{
  "files": [
    { "path": "src/App.jsx", "content": "..." },
    { "path": "src/index.css", "content": "..." }
  ],
  "message": "Brief description of what you created"
}

Rules:
1. Always generate working React code that runs with Vite
2. Use functional components with hooks
3. Include all necessary imports
4. The main component must be in src/App.jsx
5. Put styles in src/index.css
6. Use modern CSS (flexbox, grid, etc.)
7. Make the UI look good with proper spacing, colors, and typography
8. DO NOT use any external libraries besides React - no Tailwind, no UI libraries
9. Keep the code simple and readable
10. Always export default the main App component
11. Use the brand colors if provided - convert hex to CSS custom properties

Only output the JSON, nothing else.`;

// Agent execution callbacks
interface SoftwareExecuteCallbacks {
  onStep?: (step: AgentStep) => void;
  onToolCall?: (toolCall: ToolCallEvent) => void;
  onFilesGenerated?: (files: GeneratedFile[]) => void;
}

// Execute software generation
export async function executeSoftwareGeneration(
  prompt: string,
  callbacks: SoftwareExecuteCallbacks = {}
): Promise<{
  files: GeneratedFile[];
  message: string;
  text: string;
}> {
  const { onStep, onFilesGenerated } = callbacks;

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });

  // Send initial step
  onStep?.({
    id: crypto.randomUUID(),
    type: "thinking",
    content: "Analyzing requirements and generating React code...",
    timestamp: new Date(),
  });

  // Stream the response
  let fullContent = "";

  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta") {
      const delta = event.delta;
      if ("text" in delta) {
        fullContent += delta.text;
        onStep?.({
          id: crypto.randomUUID(),
          type: "text_output",
          content: delta.text,
          timestamp: new Date(),
        });
      }
    }
  }

  // Parse the JSON response
  let jsonContent = fullContent;
  const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonContent = jsonMatch[0];
  }

  try {
    const result = JSON.parse(jsonContent) as {
      files: GeneratedFile[];
      message: string;
    };

    if (result.files && Array.isArray(result.files)) {
      onFilesGenerated?.(result.files);

      onStep?.({
        id: crypto.randomUUID(),
        type: "text_output",
        content: `Generated ${result.files.length} files: ${result.files.map(f => f.path).join(", ")}`,
        timestamp: new Date(),
      });

      return {
        files: result.files,
        message: result.message || "Code generated successfully",
        text: fullContent,
      };
    }

    throw new Error("No files in response");
  } catch (error) {
    console.error("[Software] Parse error:", error);
    throw new Error(`Failed to parse generated code: ${error}`);
  }
}

// Full department execution with sandbox integration
export async function executeSoftwareDepartment(
  variables: SoftwareVariables,
  callbacks: {
    onAgentStart?: (agentId: string) => void;
    onAgentComplete?: (agentId: string, result: unknown) => void;
    onStep?: (agentId: string, step: AgentStep) => void;
    onToolCall?: (agentId: string, toolCall: ToolCallEvent) => void;
    onFilesGenerated?: (files: GeneratedFile[]) => void;
    onSandboxReady?: (sandboxId: string, previewUrl: string) => void;
  } = {}
): Promise<{
  files: GeneratedFile[];
  sandboxId: string | null;
  previewUrl: string | null;
  message: string;
}> {
  const agentId = "agent_software_engineer";

  callbacks.onAgentStart?.(agentId);

  // Generate prompt from marketing outputs
  const prompt = generatePromptFromMarketing(variables);

  callbacks.onStep?.(agentId, {
    id: crypto.randomUUID(),
    type: "thinking",
    content: `Building landing page for ${variables.companyName}...`,
    timestamp: new Date(),
  });

  // Execute code generation
  const result = await executeSoftwareGeneration(prompt, {
    onStep: (step) => callbacks.onStep?.(agentId, step),
    onToolCall: (tc) => callbacks.onToolCall?.(agentId, tc),
    onFilesGenerated: callbacks.onFilesGenerated,
  });

  callbacks.onAgentComplete?.(agentId, result);

  return {
    files: result.files,
    sandboxId: null, // Sandbox is managed by the API route
    previewUrl: null,
    message: result.message,
  };
}
