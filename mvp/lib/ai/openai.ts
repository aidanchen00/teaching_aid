import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export { openai };

// Image generation with DALL-E 3
export interface ImageGenerationOptions {
  prompt: string;
  size?: "1024x1024" | "1792x1024" | "1024x1792";
  quality?: "standard" | "hd";
  style?: "vivid" | "natural";
}

export interface GeneratedImage {
  url: string;
  revisedPrompt: string;
}

/**
 * Generate an image using DALL-E 3
 */
export async function generateImage(
  options: ImageGenerationOptions
): Promise<GeneratedImage> {
  const { prompt, size = "1024x1024", quality = "standard", style = "vivid" } = options;

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size,
    quality,
    style,
  });

  const image = response.data?.[0];

  if (!image?.url) {
    throw new Error("No image URL returned from DALL-E");
  }

  return {
    url: image.url,
    revisedPrompt: image.revised_prompt || prompt,
  };
}

/**
 * Generate a brand-focused image (logo concept, hero image, social media asset)
 */
export async function generateBrandImage(
  companyName: string,
  imageType: "logo" | "hero" | "social" | "product",
  description: string,
  brandColors?: { primary?: string; secondary?: string; accent?: string }
): Promise<GeneratedImage> {
  let prompt = "";

  switch (imageType) {
    case "logo":
      prompt = `Create a modern, minimalist logo concept for "${companyName}". ${description}.
        The design should be clean, professional, and work well at any size.
        ${brandColors?.primary ? `Primary brand color: ${brandColors.primary}.` : ""}
        Style: flat design, no gradients, suitable for business use.
        Background: solid white or transparent feel.`;
      break;

    case "hero":
      prompt = `Create a stunning hero image for "${companyName}" website. ${description}.
        ${brandColors?.primary ? `Color scheme should incorporate ${brandColors.primary}.` : ""}
        Style: modern, professional, high-end marketing visual.
        The image should evoke trust and innovation.`;
      break;

    case "social":
      prompt = `Create a social media marketing image for "${companyName}". ${description}.
        ${brandColors?.primary ? `Brand colors: ${brandColors.primary}${brandColors.secondary ? `, ${brandColors.secondary}` : ""}.` : ""}
        Style: eye-catching, scroll-stopping, suitable for Instagram/LinkedIn.
        Professional and on-brand aesthetic.`;
      break;

    case "product":
      prompt = `Create a product showcase image for "${companyName}". ${description}.
        ${brandColors?.primary ? `Brand color theme: ${brandColors.primary}.` : ""}
        Style: clean product photography style, professional lighting.`;
      break;
  }

  return generateImage({
    prompt,
    size: imageType === "social" ? "1024x1024" : "1792x1024",
    quality: "hd",
    style: imageType === "logo" ? "natural" : "vivid",
  });
}

/**
 * Use GPT-4 for quick content analysis or enhancement
 */
export async function analyzeContent(
  content: string,
  task: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that analyzes and enhances marketing content. Be concise and actionable.",
      },
      {
        role: "user",
        content: `${task}\n\nContent:\n${content}`,
      },
    ],
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content || "";
}
