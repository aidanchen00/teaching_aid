import { NextRequest } from "next/server";
import { getDb } from "@/lib/db/mongodb";

export const runtime = "nodejs";

// GET - List all threads
export async function GET() {
  try {
    const db = await getDb();
    const threads = await db
      .collection("threads")
      .find({})
      .sort({ updatedAt: -1 })
      .toArray();

    return Response.json(
      threads.map((t) => ({
        id: t.id,
        external_id: t.externalId,
        title: t.title,
        is_archived: t.status === "archived",
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }))
    );
  } catch (error) {
    console.error("Failed to list threads:", error);
    return Response.json({ error: "Failed to list threads" }, { status: 500 });
  }
}

// POST - Create new thread
export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    const localId = body.localId || crypto.randomUUID();

    const thread = {
      id: crypto.randomUUID(),
      localId,
      title: "New Chat",
      status: "regular",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("threads").insertOne(thread);

    return Response.json({
      id: thread.id,
      external_id: thread.localId,
    });
  } catch (error) {
    console.error("Failed to create thread:", error);
    return Response.json({ error: "Failed to create thread" }, { status: 500 });
  }
}
