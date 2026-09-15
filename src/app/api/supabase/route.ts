import { NextResponse } from "next/server";

import { authenticateRequest } from "@/lib/api-auth";
import { rateLimit, callerKey } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const caller = await authenticateRequest();
  if (!caller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = rateLimit(`supabase:${callerKey(req, caller.userId)}`, 30, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let token: unknown;
  try {
    ({ token } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof token !== "string" || token.trim() === "") {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  try {
    const res = await fetch("https://api.supabase.com/v1/projects", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message ?? `Supabase API error ${res.status}`);
    }

    return NextResponse.json({
      projects: (data as { id: string; name: string; region: string; status: string }[]).map(
        (p) => ({ id: p.id, name: p.name, region: p.region, status: p.status }),
      ),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
