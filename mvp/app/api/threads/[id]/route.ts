import { NextRequest } from "next/server";
import { getDb } from "@/lib/db/mongodb";

export const runtime = "nodejs";

// GET - Get thread by ID
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

    return Response.json({
      id: thread.id,
      external_id: thread.externalId ?? thread.localId,
      title: thread.title,
      is_archived: thread.status === "archived",
      messages: thread.messages || [],
      status: thread.status,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
    });
  } catch (error) {
    console.error("Failed to get thread:", error);
    return Response.json({ error: "Failed to get thread" }, { status: 500 });
  }
}

// PATCH - Update thread (rename)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = await getDb();

    await db.collection("threads").updateOne(
      { id },
      {
        $set: {
          ...(body.title && { title: body.title }),
          ...(body.status && { status: body.status }),
          updatedAt: new Date(),
        },
      }
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to update thread:", error);
    return Response.json({ error: "Failed to update thread" }, { status: 500 });
  }
}

// DELETE - Delete thread
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();

    await db.collection("threads").deleteOne({ id });
    await db.collection("messages").deleteMany({ threadId: id });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to delete thread:", error);
    return Response.json({ error: "Failed to delete thread" }, { status: 500 });
  }
}
