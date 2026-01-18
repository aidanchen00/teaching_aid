import { NextRequest } from "next/server";
import { getDb } from "@/lib/db/mongodb";

export const runtime = "nodejs";

// GET - Get messages for thread
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();
    const thread = await db.collection("threads").findOne({ id });

    if (!thread) {
      return Response.json({ error: "Thread not found" }, { status: 404 });
    }

    return Response.json({ messages: thread.messages || [] });
  } catch (error) {
    console.error("Failed to get messages:", error);
    return Response.json({ error: "Failed to get messages" }, { status: 500 });
  }
}

// POST - Append message to thread
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const message = body.message;

    if (!message) {
      return Response.json({ error: "Message required" }, { status: 400 });
    }

    const db = await getDb();
    await db.collection("threads").updateOne(
      { id },
      {
        $push: { messages: message } as any,
        $set: { updatedAt: new Date() },
      }
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to append message:", error);
    return Response.json({ error: "Failed to append message" }, { status: 500 });
  }
}
