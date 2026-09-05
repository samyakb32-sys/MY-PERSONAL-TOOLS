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
