import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { EmailOutbox } from "@/lib/email-outbox-model";
import { drainEmailOutbox } from "@/lib/email-outbox";
import { connectToDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  try {
    await connectToDatabase();
    await EmailOutbox.init();
    const result = await drainEmailOutbox(25, true);
    return NextResponse.json(result, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Admin email outbox retry failed", error instanceof Error ? error.name : "unknown error");
    return NextResponse.json({ error: "Queued notifications could not be retried." }, { status: 503 });
  }
}
