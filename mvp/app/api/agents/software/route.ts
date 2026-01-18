import { NextRequest } from "next/server";
import {
  executeSoftwareDepartment,
  type SoftwareVariables,
} from "@/lib/ai/agents/software";
import {
  createE2BSandbox,
  writeFilesToE2BSandbox,
  storeSandbox,
  type GeneratedFile,
} from "@/lib/e2b";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes max

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const variables: SoftwareVariables = {
      companyName: body.companyName || "Your Company",
      productDescription: body.productDescription || "An innovative solution",
      brandIdentity: body.brandIdentity,
      websiteCopy: body.websiteCopy,
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

    // Start execution in background
    (async () => {
      let sandboxId: string | null = null;
      let previewUrl: string | null = null;
      let generatedFiles: GeneratedFile[] = [];

      try {
        await sendEvent("start", {
          departmentId: "dept_engineering",
          departmentName: "Software Engineering",
          timestamp: new Date().toISOString(),
        });

        // Step 1: Create sandbox first
        await sendEvent("status", {
          message: "Creating development sandbox...",
          timestamp: new Date().toISOString(),
        });

        try {
          const sandboxResult = await createE2BSandbox();
          sandboxId = crypto.randomUUID();
          previewUrl = sandboxResult.previewUrl;
          storeSandbox(sandboxId, sandboxResult.sandbox);

          await sendEvent("sandbox_ready", {
            sandboxId,
            previewUrl,
            timestamp: new Date().toISOString(),
          });
        } catch (sandboxError) {
          console.error("Sandbox creation failed:", sandboxError);
          await sendEvent("sandbox_error", {
            error: String(sandboxError),
            timestamp: new Date().toISOString(),
          });
        }

        // Step 2: Execute code generation
        const result = await executeSoftwareDepartment(variables, {
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
          onFilesGenerated: async (files) => {
            generatedFiles = files;
            await sendEvent("files_generated", {
              files: files.map((f) => ({ path: f.path, size: f.content.length })),
              timestamp: new Date().toISOString(),
            });
          },
        });

        // Step 3: Write files to sandbox if available
        if (sandboxId && generatedFiles.length > 0) {
          await sendEvent("status", {
            message: "Deploying to sandbox...",
            timestamp: new Date().toISOString(),
          });

          try {
            const sandbox = (await import("@/lib/e2b")).getSandbox(sandboxId);
            if (sandbox) {
              await writeFilesToE2BSandbox(sandbox, generatedFiles);
              await sendEvent("files_deployed", {
                sandboxId,
                previewUrl,
                fileCount: generatedFiles.length,
                timestamp: new Date().toISOString(),
              });
            }
          } catch (deployError) {
            console.error("Deploy to sandbox failed:", deployError);
            await sendEvent("deploy_error", {
              error: String(deployError),
              timestamp: new Date().toISOString(),
            });
          }
        }

        await sendEvent("complete", {
          departmentId: "dept_engineering",
          files: generatedFiles,
          sandboxId,
          previewUrl,
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
        error: error instanceof Error ? error.message : "Failed to start agents",
      },
      { status: 500 }
    );
  }
}
