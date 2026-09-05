import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let token: string | undefined;
  try {
    ({ token } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!token) {
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
