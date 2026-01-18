import { NextRequest } from "next/server";
import {
  executeFinanceDepartment,
  type FinanceVariables,
  type FinanceArtifact,
} from "@/lib/ai/agents/finance";
import type { AgentStep } from "@/lib/ai/types";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes max

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("=== Finance API received variables ===");
    console.log("companyName:", body.companyName);
    console.log("industry:", body.industry);
    console.log("productDescription:", body.productDescription);
    console.log("======================================");

    const variables: FinanceVariables = {
      companyName: body.companyName || "Company",
      industry: body.industry || "Technology",
      productDescription: body.productDescription || "Product",
      targetAudience: body.targetAudience,
      fundingStage: body.fundingStage || "seed",
      revenueModel: body.revenueModel || "SaaS subscription",
      initialInvestment: body.initialInvestment,
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
      try {
        await sendEvent("start", {
          departmentId: "dept_finance",
          departmentName: "Financial Analysis",
          timestamp: new Date().toISOString(),
        });

        const result = await executeFinanceDepartment(variables, {
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
            await sendEvent("artifact", {
              artifact,
              timestamp: new Date().toISOString(),
            });
          },
        });

        await sendEvent("complete", {
          departmentId: "dept_finance",
          artifacts: result.artifacts,
          message: result.message,
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
        error: error instanceof Error ? error.message : "Failed to start finance analysis",
      },
      { status: 500 }
    );
  }
}
