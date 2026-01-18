import { NextRequest } from "next/server";
import { streamText, convertToModelMessages, UIMessage, tool } from "ai";
import { z } from "zod";
import { getModel } from "@/lib/ai/model";
import { getDb } from "@/lib/db/mongodb";

export const runtime = "nodejs";
export const maxDuration = 60;

// Save messages to thread in database, create if needed
async function saveMessagesToThread(threadId: string | undefined, messages: UIMessage[]) {
  if (!messages || messages.length === 0) return threadId;
  
  try {
    const db = await getDb();
    
    // If no threadId, create a new thread
    if (!threadId) {
      const newThread = {
        id: crypto.randomUUID(),
        title: getThreadTitle(messages),
        status: "regular",
        messages: messages,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.collection("threads").insertOne(newThread);
      console.log("Created new thread:", newThread.id);
      return newThread.id;
    }
    
    // Update existing thread
    await db.collection("threads").updateOne(
      { id: threadId },
      {
        $set: { 
          messages: messages,
          title: getThreadTitle(messages),
          updatedAt: new Date() 
        },
      },
      { upsert: true }
    );
    return threadId;
  } catch (error) {
    console.error("Failed to save messages to thread:", error);
    return threadId;
  }
}

// Generate thread title from first user message
function getThreadTitle(messages: UIMessage[]): string {
  const firstUserMessage = messages.find(m => m.role === "user");
  if (firstUserMessage) {
    // Handle different content formats - could be string or array of parts
    const parts = firstUserMessage.parts;
    if (Array.isArray(parts)) {
      const textPart = parts.find(p => p.type === "text");
      if (textPart && "text" in textPart) {
        const content = textPart.text;
        return content.length > 50 ? content.substring(0, 50) + "..." : content;
      }
    }
  }
  return "New Chat";
}

const ORCHESTRATOR_SYSTEM_PROMPT = `You are Openpreneurship, an AI company orchestrator that helps users build entire companies using AI departments. You are part of the Open Curriculum platform.

Your role is to:
1. Understand what the user wants to build through conversation
2. Gather necessary information by asking thoughtful questions
3. Only execute when you have enough context to create quality outputs

Available: Marketing & Brand department (creates brand identity, visual design, content, social media)

## CRITICAL: EXTRACTING USER VALUES

When calling execute_marketing, you MUST extract the EXACT values from the user's messages. NEVER use generic placeholders.

Required fields to extract from user's message:
- companyName: The EXACT company/brand name the user mentioned (e.g., "NexaHealth", "FitFlow")
- industry: The EXACT industry they mentioned (e.g., "telemedicine", "fitness tech")
- targetAudience: Their EXACT description of who it's for
- productDescription: Their EXACT description of what it does
- uniqueValue: What they said makes it unique - use their words
- tone: The brand voice they want - use their words or infer from context
- competitors: Any competitors they mentioned

## EXAMPLES OF CORRECT EXTRACTION:

User: "I'm building NexaHealth, a telemedicine platform for busy professionals who need quick doctor consultations"
CORRECT execute_marketing call:
- companyName: "NexaHealth" (EXACT name from user)
- industry: "telemedicine" (EXACT industry from user)
- targetAudience: "busy professionals who need quick doctor consultations" (user's words)
- productDescription: "a telemedicine platform for quick doctor consultations"

WRONG (generic placeholders - NEVER DO THIS):
- companyName: "Your Company"
- industry: "Technology"
- targetAudience: "Tech-savvy professionals"

## CONVERSATION FLOW:
1. First message: Greet and understand their idea
2. Gather 3-4 key pieces through natural conversation
3. Summarize what you understand and confirm
4. Call execute_marketing when user confirms (says "yes", "go ahead", "execute", "run it", etc.)

## IMMEDIATE EXECUTION MODE:
If the user says ONLY "go", "execute", "run", "do it", "start", "begin", or similar single-word/short commands expressing they just want to execute immediately:
- Do NOT ask any questions
- Do NOT request clarification
- IMMEDIATELY call execute_marketing with whatever information you have from the conversation
- Use reasonable defaults for any missing fields based on context
- If absolutely no context exists, use: companyName="Startup", industry="Technology", targetAudience="General consumers", productDescription="A new product", uniqueValue="Innovation", tone="Professional", competitors="Various"

The user's intent to "just execute" should ALWAYS be respected without friction.

When you call execute_marketing, COPY the user's exact words and phrases. Do not paraphrase into generic business language.`;

export async function POST(request: NextRequest) {
  try {
    const { messages, phase, threadId } = await request.json();

    const model = getModel();

    let systemPrompt = ORCHESTRATOR_SYSTEM_PROMPT;
    if (phase === "executing") {
      systemPrompt += "\n\nDepartments are currently executing. Provide updates and answer questions about progress. Do not call tools unless asked to start a new execution.";
    }

    // Save incoming messages to thread
    if (threadId) {
      await saveMessagesToThread(threadId, messages as UIMessage[]);
    }

    const result = streamText({
      model,
      system: systemPrompt,
      messages: await convertToModelMessages(messages as UIMessage[]),
      tools: {
        execute_marketing: tool({
          description: "Execute the Marketing & Brand department. Only call when you have ALL fields.",
          inputSchema: z.object({
            companyName: z.string().describe("Name of the company/brand"),
            industry: z.string().describe("Industry or sector"),
            targetAudience: z.string().describe("Target audience description"),
            productDescription: z.string().describe("What the product/service does"),
            uniqueValue: z.string().describe("Unique value proposition"),
            tone: z.string().describe("Brand tone/voice"),
            competitors: z.string().describe("Key competitors"),
          }),
          execute: async ({ companyName, industry, targetAudience, productDescription, uniqueValue, tone, competitors }) => {
            return {
              action: "execute_department",
              department: "marketing",
              variables: { companyName, industry, targetAudience, productDescription, uniqueValue, tone, competitors },
              message: `Starting Marketing department for ${companyName}...`,
            };
          },
        }),
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Orchestrator chat error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to process chat" },
      { status: 500 }
    );
  }
}
