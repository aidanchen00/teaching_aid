import { NextRequest } from "next/server";
import { getDb } from "@/lib/db/mongodb";
import { generateText } from "ai";
import { getModel } from "@/lib/ai/model";

export const runtime = "nodejs";
export const maxDuration = 30;

// POST - Generate title for thread
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const messages = body.messages || [];

    // Generate title from messages
    const userMessages = messages
      .filter((m: { role: string }) => m.role === "user")
      .slice(0, 3)
      .map((m: { content: string }) => m.content)
      .join(" ");

    let title = "New Chat";

    if (userMessages) {
      try {
        const result = await generateText({
          model: getModel(),
          system: "Generate a very short title (3-5 words) for this conversation. Only output the title, nothing else.",
          prompt: userMessages.slice(0, 500),
        });
        title = result.text.trim().slice(0, 50);
      } catch (e) {
        // Fallback to first few words
        title = userMessages.slice(0, 40) + (userMessages.length > 40 ? "..." : "");
      }
    }

    // Save title to database
    const db = await getDb();
    await db.collection("threads").updateOne(
      { id },
      {
        $set: {
          title,
          updatedAt: new Date(),
        },
      }
    );

    return Response.json({ title });
  } catch (error) {
    console.error("Failed to generate title:", error);
    return Response.json({ error: "Failed to generate title" }, { status: 500 });
  }
}
