import { NextRequest } from "next/server";
import {
  executeMarketingDepartment,
  type MarketingVariables,
} from "@/lib/ai/agents/marketing";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes max for long-running agent tasks

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("[Marketing API] Received variables:", body.companyName);

    const variables: MarketingVariables = {
      COMPANY_NAME: body.companyName || "Your Company",
      INDUSTRY: body.industry || "Technology",
      TARGET_AUDIENCE: body.targetAudience || "Tech-savvy professionals",
      PRODUCT_DESCRIPTION: body.productDescription || "An innovative solution",
      UNIQUE_VALUE: body.uniqueValue || "Unique approach to solving problems",
      TONE: body.tone || "Professional yet approachable",
      COMPETITORS: body.competitors || "Major industry players",
    };

    // Create a TransformStream for SSE
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    let isClosed = false;

    // Helper to send SSE events safely
    const sendEvent = async (event: string, data: unknown) => {
      if (isClosed) return;
      try {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        await writer.write(encoder.encode(message));
      } catch {
        isClosed = true;
      }
    };

    // Start the agent execution in the background
    (async () => {
      try {
        await sendEvent("start", {
          departmentId: "dept_marketing",
          departmentName: "Marketing & Brand",
          timestamp: new Date().toISOString(),
        });

        const result = await executeMarketingDepartment(variables, {
          onAgentStart: async (agentId) => {
            await sendEvent("agent_start", {
              agentId,
              timestamp: new Date().toISOString(),
            });
          },
          onAgentComplete: async (agentId, agentResult) => {
            await sendEvent("agent_complete", {
              agentId,
              result: agentResult,
              timestamp: new Date().toISOString(),
            });
          },
          onStep: async (agentId, step) => {
            await sendEvent("step", { agentId, step });
          },
          onToolCall: async (agentId, toolCall) => {
            await sendEvent("tool_call", { agentId, toolCall });
          },
        });

        await sendEvent("complete", {
          departmentId: "dept_marketing",
          result,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        await sendEvent("error", {
          message: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        });
      } finally {
        if (!isClosed) {
          try {
            await writer.close();
          } catch {
            // Already closed
          }
        }
        isClosed = true;
      }
    })();

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Failed to start agents",
      },
      { status: 500 }
    );
  }
}

// GET endpoint - returns empty outputs since we don't persist
export async function GET() {
  return Response.json({ outputs: {} });
}
