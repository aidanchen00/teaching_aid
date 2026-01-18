import { NextRequest } from "next/server";
import {
  executeBusinessDepartment,
  type BusinessVariables,
} from "@/lib/ai/agents/business";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes max

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("=== Business API received variables ===");
    console.log("companyName:", body.companyName);
    console.log("industry:", body.industry);
    console.log("productDescription:", body.productDescription);
    console.log("======================================");

    const variables: BusinessVariables = {
      companyName: body.companyName || "Company",
      industry: body.industry || "Technology",
      productDescription: body.productDescription || "Product",
      targetAudience: body.targetAudience,
      fundingStage: body.fundingStage || "seed",
      revenueModel: body.revenueModel || "SaaS subscription",
      uniqueValue: body.uniqueValue,
      competitors: body.competitors,
    };

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    let isClosed = false;

    const sendEvent = async (event: string, data: unknown) => {
      if (isClosed) return;
      try {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        await writer.write(encoder.encode(message));
      } catch {
        isClosed = true;
      }
    };

    // Execute in background
    (async () => {
      console.log("[Business API] Starting background execution...");
      try {
        await sendEvent("start", {
          departmentId: "dept_business",
          departmentName: "Business Strategy",
          timestamp: new Date().toISOString(),
        });

        console.log("[Business API] Calling executeBusinessDepartment with:", JSON.stringify(variables, null, 2));
        const result = await executeBusinessDepartment(variables, {
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
            await sendEvent("step", {
              agentId,
              step,
            });
          },
          onArtifact: async (artifact) => {
            // Don't send pptxBase64 over SSE - it's too large and breaks streaming
            // Send artifact without the base64 data, it will be in the final complete event
            const lightArtifact = {
              ...artifact,
              data: {
                ...artifact.data,
                pptxBase64: artifact.data.pptxBase64 ? "[available]" : undefined,
              },
            };
            await sendEvent("artifact", {
              artifact: lightArtifact,
              timestamp: new Date().toISOString(),
            });
          },
        });

        console.log("[Business API] Execution complete, artifacts:", result.artifacts.length);
        await sendEvent("complete", {
          departmentId: "dept_business",
          artifacts: result.artifacts,
          message: result.message,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("[Business API] Execution error:", error);
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
        error: error instanceof Error ? error.message : "Failed to start business strategy",
      },
      { status: 500 }
    );
  }
}
