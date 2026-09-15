import { NextResponse } from "next/server";

import { authenticateRequest } from "@/lib/api-auth";
import { rateLimit, callerKey } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const caller = await authenticateRequest();
  if (!caller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = rateLimit(`vercel:${callerKey(req, caller.userId)}`, 30, 60_000);
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

  const headers = { Authorization: `Bearer ${token}` };

  try {
    const [userRes, projectsRes] = await Promise.all([
      fetch("https://api.vercel.com/v2/user", { headers }),
      fetch("https://api.vercel.com/v9/projects?limit=5", { headers }),
    ]);

    const userData = await userRes.json();
    const projectsData = await projectsRes.json();

    if (!userRes.ok) {
      throw new Error(userData?.error?.message ?? `Vercel API error ${userRes.status}`);
    }
    if (!projectsRes.ok) {
      throw new Error(
        projectsData?.error?.message ?? `Vercel API error ${projectsRes.status}`,
      );
    }

    return NextResponse.json({
      user: { username: userData.user?.username ?? userData.user?.email },
      projects: (projectsData.projects ?? []).map(
        (p: { id: string; name: string; latestDeployments?: { url: string; readyState: string }[] }) => ({
          id: p.id,
          name: p.name,
          latestUrl: p.latestDeployments?.[0]?.url ?? null,
          latestState: p.latestDeployments?.[0]?.readyState ?? null,
        }),
      ),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
