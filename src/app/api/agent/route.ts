import { NextResponse } from "next/server";

import { classifyTask } from "@/lib/jev";
import { authenticateRequest } from "@/lib/api-auth";
import { rateLimit, callerKey } from "@/lib/rate-limit";

const MAX_TASK_CHARS = 2000;

export async function POST(req: Request) {
  const caller = await authenticateRequest();
  if (!caller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = rateLimit(`agent:${callerKey(req, caller.userId)}`, 30, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const task = (body as Record<string, unknown> | null)?.task;
  if (typeof task !== "string" || task.trim() === "") {
    return NextResponse.json({ error: "Missing task" }, { status: 400 });
  }
  if (task.length > MAX_TASK_CHARS) {
    return NextResponse.json({ error: `Task too long (max ${MAX_TASK_CHARS} characters)` }, { status: 400 });
  }

  const decision = await classifyTask(task);
  return NextResponse.json(decision);
}
