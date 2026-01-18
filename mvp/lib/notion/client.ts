const NOTION_MCP_URL = "https://backend.composio.dev/v3/mcp/63ee1e09-9ae8-451f-a170-a0b153b2f7c6/mcp?user_id=pg-test-8373f14d-2ffa-4acb-aa09-edb62ebb88f9";

// Default parent page ID - you should set this to your Notion workspace's root page
const DEFAULT_PARENT_PAGE_ID = process.env.NOTION_PARENT_PAGE_ID || "";

interface MCPRequest {
  jsonrpc: "2.0";
  id: number;
  method: string;
  params?: Record<string, unknown>;
}

interface MCPResponse {
  jsonrpc: "2.0";
  id: number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
  };
}

// Parse SSE (Server-Sent Events) response format
function parseSSEResponse(text: string): MCPResponse {
  // SSE format: "event: message\ndata: {...}\n\n"
  const lines = text.split('\n');
  let jsonData = '';
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      jsonData = line.substring(6);
      break;
    }
  }
  
  if (!jsonData) {
    // Try to parse as plain JSON if not SSE format
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Failed to parse MCP response: ${text.substring(0, 200)}`);
    }
  }
  
  return JSON.parse(jsonData);
}

export async function callNotionMCP(method: string, params?: Record<string, unknown>): Promise<unknown> {
  const apiKey = process.env.NOTION_API_KEY;
  
  if (!apiKey) {
    throw new Error("NOTION_API_KEY is not set in environment variables");
  }

  const request: MCPRequest = {
    jsonrpc: "2.0",
    id: Date.now(),
    method,
    params,
  };

  const response = await fetch(NOTION_MCP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Notion MCP request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  // Parse SSE response format
  const responseText = await response.text();
  const data = parseSSEResponse(responseText);
  
  if (data.error) {
    throw new Error(`Notion MCP error: ${data.error.message}`);
  }

  return data.result;
}

export async function listNotionTools(): Promise<unknown> {
  return callNotionMCP("tools/list");
}

export async function saveMarketingToNotion(
  companyName: string,
  marketingData: {
    brandIdentity?: Record<string, unknown>;
    messagingFramework?: Record<string, unknown>;
    taglines?: string[];
    colorPalette?: Record<string, unknown>;
    typographySystem?: Record<string, unknown>;
    logoConcept?: Record<string, unknown>;
    socialMediaPlan?: Record<string, unknown>;
    posts?: Array<Record<string, unknown>>;
    websiteCopy?: Record<string, unknown>;
    brandGuidelines?: Record<string, unknown>;
  },
  parentPageId?: string
): Promise<{ success: boolean; pageUrl?: string; pageId?: string; error?: string }> {
  try {
    const parentId = parentPageId || DEFAULT_PARENT_PAGE_ID;
    
    if (!parentId) {
      throw new Error("NOTION_PARENT_PAGE_ID environment variable is not set. Please set it to a valid Notion page ID.");
    }

    // Step 1: Create the page
    const createResult = await callNotionMCP("tools/call", {
      name: "NOTION_CREATE_NOTION_PAGE",
      arguments: {
        parent_id: parentId,
        title: `${companyName} - Marketing & Brand Strategy`,
        icon: "🚀",
      },
    });

    // Extract page ID from result - the response has format: { data: { id: "...", url: "..." } }
    const createResultObj = createResult as { 
      content?: Array<{ text?: string }>;
      data?: { id?: string; url?: string };
    } | undefined;
    
    let pageId: string | undefined;
    let pageUrl: string | undefined;
    
    // First, try to get id directly from data.id (Composio MCP format)
    if (createResultObj?.data?.id) {
      pageId = createResultObj.data.id;
      pageUrl = createResultObj.data.url || `https://notion.so/${pageId.replace(/-/g, '')}`;
      console.log("Extracted page ID from data.id:", pageId);
    }
    // Fallback: try to parse from content[0].text (old format)
    else if (createResultObj?.content?.[0]?.text) {
      const text = createResultObj.content[0].text;
      // Try to parse as JSON first
      try {
        const parsed = JSON.parse(text);
        if (parsed.data?.id) {
          pageId = parsed.data.id;
          pageUrl = parsed.data.url || `https://notion.so/${pageId?.replace(/-/g, '')}`;
          console.log("Extracted page ID from parsed JSON data.id:", pageId);
        }
      } catch {
        // If not JSON, try regex extraction
        const idMatch = text.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
        if (idMatch) {
          pageId = idMatch[1];
          pageUrl = `https://notion.so/${pageId.replace(/-/g, '')}`;
          console.log("Extracted page ID via regex:", pageId);
        }
      }
    }

    if (!pageId) {
      console.warn("Could not extract page ID from create response:", JSON.stringify(createResultObj, null, 2));
      return {
        success: true,
        pageUrl,
        pageId,
      };
    }
    
    console.log("Using page ID for content addition:", pageId);

    // Step 2: Build comprehensive content blocks for Notion
    const contentBlocks: Array<{ content_block: { block_property: string; content: string } }> = [];
    
    // Executive Summary
    contentBlocks.push({ content_block: { block_property: "heading_1", content: "📋 Executive Summary" } });
    contentBlocks.push({ content_block: { block_property: "paragraph", content: `This document contains the complete marketing and brand strategy for **${companyName}**, including brand identity, messaging framework, visual design system, and social media strategy.` } });
    contentBlocks.push({ content_block: { block_property: "divider", content: "" } });

    // Brand Identity Section
    if (marketingData.brandIdentity) {
      contentBlocks.push({ content_block: { block_property: "heading_1", content: "🎯 Brand Identity" } });
      const brand = marketingData.brandIdentity;
      
      // Core Brand Elements
      if (brand.companyName) contentBlocks.push({ content_block: { block_property: "callout", content: `**Company Name:** ${brand.companyName}` } });
      if (brand.tagline) contentBlocks.push({ content_block: { block_property: "quote", content: `"${brand.tagline}"` } });
      
      // Mission & Vision
      if (brand.mission || brand.vision) {
        contentBlocks.push({ content_block: { block_property: "heading_2", content: "Mission & Vision" } });
        if (brand.mission) contentBlocks.push({ content_block: { block_property: "paragraph", content: `**Mission:** ${brand.mission}` } });
        if (brand.vision) contentBlocks.push({ content_block: { block_property: "paragraph", content: `**Vision:** ${brand.vision}` } });
      }
      
      // Values
      if (brand.values && Array.isArray(brand.values)) {
        contentBlocks.push({ content_block: { block_property: "heading_2", content: "Core Values" } });
        (brand.values as string[]).forEach(v => {
          contentBlocks.push({ content_block: { block_property: "bulleted_list_item", content: v } });
        });
      }
      
      // Brand Personality
      if (brand.personality) {
        contentBlocks.push({ content_block: { block_property: "heading_2", content: "Brand Personality" } });
        const personality = brand.personality as { traits?: string[]; tone?: string; voice?: string } | string;
        if (typeof personality === 'string') {
          contentBlocks.push({ content_block: { block_property: "paragraph", content: personality } });
        } else {
          if (personality.traits && Array.isArray(personality.traits)) {
            contentBlocks.push({ content_block: { block_property: "paragraph", content: `**Traits:** ${personality.traits.join(", ")}` } });
          }
          if (personality.tone) contentBlocks.push({ content_block: { block_property: "paragraph", content: `**Tone:** ${personality.tone}` } });
          if (personality.voice) contentBlocks.push({ content_block: { block_property: "paragraph", content: `**Voice:** ${personality.voice}` } });
        }
      }
      
      // Target Audience
      if (brand.targetAudience) {
        contentBlocks.push({ content_block: { block_property: "heading_2", content: "Target Audience" } });
        const audience = brand.targetAudience as { demographics?: string; psychographics?: string; painPoints?: string[] } | string;
        if (typeof audience === 'string') {
          contentBlocks.push({ content_block: { block_property: "paragraph", content: audience } });
        } else {
          if (audience.demographics) contentBlocks.push({ content_block: { block_property: "paragraph", content: `**Demographics:** ${audience.demographics}` } });
          if (audience.psychographics) contentBlocks.push({ content_block: { block_property: "paragraph", content: `**Psychographics:** ${audience.psychographics}` } });
          if (audience.painPoints && Array.isArray(audience.painPoints)) {
            contentBlocks.push({ content_block: { block_property: "paragraph", content: "**Pain Points:**" } });
            audience.painPoints.forEach(p => contentBlocks.push({ content_block: { block_property: "bulleted_list_item", content: p } }));
          }
        }
      }
      
      // Positioning
      if (brand.positioning) {
        contentBlocks.push({ content_block: { block_property: "heading_2", content: "Brand Positioning" } });
        const pos = brand.positioning as { statement?: string; uniqueValueProposition?: string; differentiators?: string[] };
        if (pos.statement) contentBlocks.push({ content_block: { block_property: "callout", content: `**Positioning Statement:** ${pos.statement}` } });
        if (pos.uniqueValueProposition) contentBlocks.push({ content_block: { block_property: "paragraph", content: `**Unique Value Proposition:** ${pos.uniqueValueProposition}` } });
        if (pos.differentiators && Array.isArray(pos.differentiators)) {
          contentBlocks.push({ content_block: { block_property: "paragraph", content: "**Key Differentiators:**" } });
          pos.differentiators.forEach(d => contentBlocks.push({ content_block: { block_property: "bulleted_list_item", content: d } }));
        }
      }
      
      contentBlocks.push({ content_block: { block_property: "divider", content: "" } });
    }

    // Messaging Framework Section
    if (marketingData.messagingFramework) {
      contentBlocks.push({ content_block: { block_property: "heading_1", content: "💬 Messaging Framework" } });
      const msg = marketingData.messagingFramework;
      
      if (msg.valueProposition) {
        contentBlocks.push({ content_block: { block_property: "heading_2", content: "Value Proposition" } });
        contentBlocks.push({ content_block: { block_property: "callout", content: String(msg.valueProposition) } });
      }
      
      if (msg.elevatorPitch) {
        contentBlocks.push({ content_block: { block_property: "heading_2", content: "Elevator Pitch" } });
        contentBlocks.push({ content_block: { block_property: "quote", content: String(msg.elevatorPitch) } });
      }
      
      if (msg.keyMessages && Array.isArray(msg.keyMessages)) {
        contentBlocks.push({ content_block: { block_property: "heading_2", content: "Key Messages by Audience" } });
        (msg.keyMessages as Array<{ audience?: string; message?: string; proofPoints?: string[] } | string>).forEach((m, i) => {
          if (typeof m === 'string') {
            contentBlocks.push({ content_block: { block_property: "numbered_list_item", content: m } });
          } else {
            contentBlocks.push({ content_block: { block_property: "heading_3", content: `${i + 1}. ${m.audience || 'General Audience'}` } });
            if (m.message) contentBlocks.push({ content_block: { block_property: "paragraph", content: m.message } });
            if (m.proofPoints && Array.isArray(m.proofPoints)) {
              contentBlocks.push({ content_block: { block_property: "paragraph", content: "**Proof Points:**" } });
              m.proofPoints.forEach(p => contentBlocks.push({ content_block: { block_property: "bulleted_list_item", content: p } }));
            }
          }
        });
      }
      
      if (msg.toneGuidelines) {
        contentBlocks.push({ content_block: { block_property: "heading_2", content: "Tone Guidelines" } });
        contentBlocks.push({ content_block: { block_property: "paragraph", content: String(msg.toneGuidelines) } });
      }
      
      contentBlocks.push({ content_block: { block_property: "divider", content: "" } });
    }

    // Taglines Section
    if (marketingData.taglines && Array.isArray(marketingData.taglines) && marketingData.taglines.length > 0) {
      contentBlocks.push({ content_block: { block_property: "heading_1", content: "✨ Taglines & Slogans" } });
      marketingData.taglines.forEach((t, i) => {
        const tagline = typeof t === 'string' ? t : (t as { tagline?: string; context?: string });
        if (typeof tagline === 'string') {
          contentBlocks.push({ content_block: { block_property: "numbered_list_item", content: `"${tagline}"` } });
        } else {
          contentBlocks.push({ content_block: { block_property: "numbered_list_item", content: `"${tagline.tagline || ''}"${tagline.context ? ` — *${tagline.context}*` : ''}` } });
        }
      });
      contentBlocks.push({ content_block: { block_property: "divider", content: "" } });
    }

    // Visual Design System
    contentBlocks.push({ content_block: { block_property: "heading_1", content: "🎨 Visual Design System" } });

    // Color Palette
    if (marketingData.colorPalette) {
      contentBlocks.push({ content_block: { block_property: "heading_2", content: "Color Palette" } });
      Object.entries(marketingData.colorPalette).forEach(([key, value]) => {
        const color = value as { hex?: string; name?: string; usage?: string; rgb?: string };
        let colorInfo = `**${key}:** ${color.hex || "N/A"}`;
        if (color.name) colorInfo += ` (${color.name})`;
        if (color.usage) colorInfo += ` — *${color.usage}*`;
        contentBlocks.push({ content_block: { block_property: "paragraph", content: colorInfo } });
      });
    }

    // Typography
    if (marketingData.typographySystem) {
      contentBlocks.push({ content_block: { block_property: "heading_2", content: "Typography System" } });
      Object.entries(marketingData.typographySystem).forEach(([key, value]) => {
        const font = value as { fontFamily?: string; weights?: string[]; usage?: string; fallback?: string };
        let fontInfo = `**${key}:** ${font.fontFamily || "N/A"}`;
        if (font.weights && Array.isArray(font.weights)) fontInfo += ` (Weights: ${font.weights.join(", ")})`;
        if (font.usage) fontInfo += ` — *${font.usage}*`;
        contentBlocks.push({ content_block: { block_property: "paragraph", content: fontInfo } });
      });
    }

    // Logo Concept
    if (marketingData.logoConcept) {
      contentBlocks.push({ content_block: { block_property: "heading_2", content: "Logo Concept" } });
      const logo = marketingData.logoConcept as { name?: string; concept?: string; colorScheme?: string; style?: string; symbolism?: string };
      if (logo.name) contentBlocks.push({ content_block: { block_property: "paragraph", content: `**Logo Name:** ${logo.name}` } });
      if (logo.concept) contentBlocks.push({ content_block: { block_property: "paragraph", content: `**Concept:** ${logo.concept}` } });
      if (logo.style) contentBlocks.push({ content_block: { block_property: "paragraph", content: `**Style:** ${logo.style}` } });
      if (logo.colorScheme) contentBlocks.push({ content_block: { block_property: "paragraph", content: `**Color Scheme:** ${logo.colorScheme}` } });
      if (logo.symbolism) contentBlocks.push({ content_block: { block_property: "paragraph", content: `**Symbolism:** ${logo.symbolism}` } });
    }
    
    contentBlocks.push({ content_block: { block_property: "divider", content: "" } });

    // Website Copy
    if (marketingData.websiteCopy) {
      contentBlocks.push({ content_block: { block_property: "heading_1", content: "🌐 Website Copy" } });
      const copy = marketingData.websiteCopy;
      
      const hero = copy.heroSection as Record<string, string> | undefined;
      if (hero) {
        contentBlocks.push({ content_block: { block_property: "heading_2", content: "Hero Section" } });
        if (hero.headline) contentBlocks.push({ content_block: { block_property: "callout", content: `**Headline:** ${hero.headline}` } });
        if (hero.subheadline) contentBlocks.push({ content_block: { block_property: "paragraph", content: `**Subheadline:** ${hero.subheadline}` } });
        if (hero.ctaPrimary) contentBlocks.push({ content_block: { block_property: "paragraph", content: `**Primary CTA:** ${hero.ctaPrimary}` } });
        if (hero.ctaSecondary) contentBlocks.push({ content_block: { block_property: "paragraph", content: `**Secondary CTA:** ${hero.ctaSecondary}` } });
      }
      
      const about = copy.aboutSection as Record<string, string> | undefined;
      if (about) {
        contentBlocks.push({ content_block: { block_property: "heading_2", content: "About Section" } });
        if (about.title) contentBlocks.push({ content_block: { block_property: "paragraph", content: `**Title:** ${about.title}` } });
        if (about.content) contentBlocks.push({ content_block: { block_property: "paragraph", content: about.content } });
      }
      
      const features = copy.featuresSection as Array<{ title?: string; description?: string }> | undefined;
      if (features && Array.isArray(features)) {
        contentBlocks.push({ content_block: { block_property: "heading_2", content: "Features Section" } });
        features.forEach((f, i) => {
          contentBlocks.push({ content_block: { block_property: "heading_3", content: f.title || `Feature ${i + 1}` } });
          if (f.description) contentBlocks.push({ content_block: { block_property: "paragraph", content: f.description } });
        });
      }
      
      if (copy.footerTagline) contentBlocks.push({ content_block: { block_property: "quote", content: `**Footer Tagline:** "${copy.footerTagline}"` } });
      
      contentBlocks.push({ content_block: { block_property: "divider", content: "" } });
    }

    // Social Media Strategy
    if (marketingData.socialMediaPlan) {
      contentBlocks.push({ content_block: { block_property: "heading_1", content: "📱 Social Media Strategy" } });
      const plan = marketingData.socialMediaPlan;
      
      const platforms = plan.platforms as Array<{ name?: string; purpose?: string; frequency?: string; contentTypes?: string[] }> | undefined;
      if (platforms && Array.isArray(platforms)) {
        contentBlocks.push({ content_block: { block_property: "heading_2", content: "Platform Strategy" } });
        platforms.forEach(p => {
          contentBlocks.push({ content_block: { block_property: "heading_3", content: p.name || "Platform" } });
          if (p.purpose) contentBlocks.push({ content_block: { block_property: "paragraph", content: `**Purpose:** ${p.purpose}` } });
          if (p.frequency) contentBlocks.push({ content_block: { block_property: "paragraph", content: `**Posting Frequency:** ${p.frequency}` } });
          if (p.contentTypes && Array.isArray(p.contentTypes)) {
            contentBlocks.push({ content_block: { block_property: "paragraph", content: `**Content Types:** ${p.contentTypes.join(", ")}` } });
          }
        });
      }
      
      const hashtags = plan.brandHashtags as string[] | undefined;
      if (hashtags && Array.isArray(hashtags)) {
        contentBlocks.push({ content_block: { block_property: "heading_2", content: "Brand Hashtags" } });
        contentBlocks.push({ content_block: { block_property: "paragraph", content: hashtags.map(h => `#${h}`).join(" ") } });
      }
      
      const calendar = plan.contentCalendar as Array<{ week?: number; theme?: string; posts?: unknown[] }> | undefined;
      if (calendar && Array.isArray(calendar)) {
        contentBlocks.push({ content_block: { block_property: "heading_2", content: "Content Calendar Overview" } });
        calendar.slice(0, 4).forEach(week => {
          contentBlocks.push({ content_block: { block_property: "paragraph", content: `**Week ${week.week || '?'}:** ${week.theme || 'Scheduled content'} (${(week.posts as unknown[])?.length || 0} posts)` } });
        });
      }
      
      contentBlocks.push({ content_block: { block_property: "divider", content: "" } });
    }

    // Social Media Posts
    if (marketingData.posts && Array.isArray(marketingData.posts) && marketingData.posts.length > 0) {
      contentBlocks.push({ content_block: { block_property: "heading_1", content: "📝 Social Media Posts" } });
      contentBlocks.push({ content_block: { block_property: "paragraph", content: `*${marketingData.posts.length} posts ready for publishing*` } });
      
      marketingData.posts.forEach((post, i) => {
        contentBlocks.push({ content_block: { block_property: "heading_2", content: `Post ${i + 1}${post.platform ? ` — ${post.platform}` : ""}` } });
        if (post.content) {
          // Split long content into paragraphs (Notion has 2000 char limit)
          const content = String(post.content);
          if (content.length > 1800) {
            const chunks = content.match(/.{1,1800}/g) || [];
            chunks.forEach(chunk => contentBlocks.push({ content_block: { block_property: "paragraph", content: chunk } }));
          } else {
            contentBlocks.push({ content_block: { block_property: "paragraph", content: content } });
          }
        }
        if (post.hashtags && Array.isArray(post.hashtags)) {
          contentBlocks.push({ content_block: { block_property: "paragraph", content: `**Hashtags:** ${(post.hashtags as string[]).map(h => `#${h}`).join(" ")}` } });
        }
        if (post.callToAction) {
          contentBlocks.push({ content_block: { block_property: "paragraph", content: `**CTA:** ${post.callToAction}` } });
        }
        if (post.bestTimeToPost) {
          contentBlocks.push({ content_block: { block_property: "paragraph", content: `**Best Time:** ${post.bestTimeToPost}` } });
        }
      });
    }

    // Step 3: Add content to the page (in batches of 100 max)
    if (contentBlocks.length > 0) {
      const batchSize = 100;
      for (let i = 0; i < contentBlocks.length; i += batchSize) {
        const batch = contentBlocks.slice(i, i + batchSize);
        await callNotionMCP("tools/call", {
          name: "NOTION_ADD_MULTIPLE_PAGE_CONTENT",
          arguments: {
            parent_block_id: pageId,
            content_blocks: batch,
          },
        });
      }
    }
    
    return {
      success: true,
      pageUrl,
      pageId,
    };
  } catch (error) {
    console.error("Failed to save to Notion:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
