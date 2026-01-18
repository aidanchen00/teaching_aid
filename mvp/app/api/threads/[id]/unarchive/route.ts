import { NextRequest } from "next/server";
import { getDb } from "@/lib/db/mongodb";

export const runtime = "nodejs";

// POST - Unarchive thread
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();

    await db.collection("threads").updateOne(
      { id },
      {
        $set: {
          status: "regular",
          updatedAt: new Date(),
        },
      }
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to unarchive thread:", error);
    return Response.json({ error: "Failed to unarchive thread" }, { status: 500 });
  }
}
