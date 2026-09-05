import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { callProvider, type ChatProvider } from "@/lib/llm";
import { socialMessages } from "@/data/social";

const providerPriority: { id: ChatProvider; keyField: string; defaultModel: string }[] = [
  { id: "claude", keyField: "claudeApiKey", defaultModel: "claude-sonnet-5" },
  { id: "chatgpt", keyField: "openaiApiKey", defaultModel: "gpt-4o-mini" },
  { id: "gemini", keyField: "geminiApiKey", defaultModel: "gemini-2.5-flash" },
  { id: "groq", keyField: "groqApiKey", defaultModel: "llama-3.3-70b-versatile" },
];

function pickProvider(settings: Record<string, string>) {
  return providerPriority.find((p) => settings[p.keyField]);
}

const unreadPreview = socialMessages
  .filter((m) => m.unread)
  .map((m) => `${m.platform} · ${m.sender}: "${m.preview}"`)
  .join("\n");

async function runAutomation(key: string, settings: Record<string, string>): Promise<string> {
  const provider = pickProvider(settings);
  if (!provider) throw new Error("No AI provider key configured");

  const prompt =
    key === "a1"
      ? `Summarize these unread direct messages in 2-3 sentences total:\n${unreadPreview}`
      : `Draft a short suggested reply for each of these unread direct messages:\n${unreadPreview}`;

  return callProvider(provider.id, settings[provider.keyField], provider.defaultModel, [
    { role: "user", content: prompt },
  ]);
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const { data: enabledAutomations, error: autoError } = await supabase
    .from("automations")
    .select("user_id,automation_key")
    .eq("enabled", true);

  if (autoError) {
    return NextResponse.json({ error: autoError.message }, { status: 500 });
  }

  const results: { userId: string; automationKey: string; status: string }[] = [];

  for (const row of (enabledAutomations ?? []) as { user_id: string; automation_key: string }[]) {
    try {
      const { data: settingsRow, error: settingsError } = await supabase
        .from("user_settings")
        .select("data")
        .eq("user_id", row.user_id)
        .maybeSingle();
      if (settingsError) throw new Error(settingsError.message);

      const settings = (settingsRow?.data ?? {}) as Record<string, string>;
      const output = await runAutomation(row.automation_key, settings);

      await supabase
        .from("automations")
        .update({ last_run: new Date().toISOString(), last_result: output })
        .eq("user_id", row.user_id)
        .eq("automation_key", row.automation_key);

      results.push({ userId: row.user_id, automationKey: row.automation_key, status: "ok" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      await supabase
        .from("automations")
        .update({ last_run: new Date().toISOString(), last_result: `Error: ${message}` })
        .eq("user_id", row.user_id)
        .eq("automation_key", row.automation_key);
      results.push({ userId: row.user_id, automationKey: row.automation_key, status: `error: ${message}` });
    }
  }

  return NextResponse.json({ ran: results.length, results });
}
