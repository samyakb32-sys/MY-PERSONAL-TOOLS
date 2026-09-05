"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { writeSettings, emptySettings, type Settings } from "@/lib/settings";
import { writeSessions, type ChatSession } from "@/lib/chat-history";

export async function pullRemoteData(userId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;

  const [{ data: settingsRow }, { data: sessionRows }] = await Promise.all([
    supabase.from("user_settings").select("data").eq("user_id", userId).maybeSingle(),
    supabase
      .from("chat_sessions")
      .select("id,title,messages")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false }),
  ]);

  if (settingsRow?.data) {
    writeSettings({ ...emptySettings, ...(settingsRow.data as Partial<Settings>) });
  }
  if (sessionRows && sessionRows.length > 0) {
    writeSessions(
      (sessionRows as { id: string; title: string; messages: ChatSession["messages"] }[]).map(
        (r) => ({ id: r.id, title: r.title, messages: r.messages }),
      ),
    );
  }
}

export async function pushSettings(userId: string, settings: Settings) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  await supabase
    .from("user_settings")
    .upsert({ user_id: userId, data: settings, updated_at: new Date().toISOString() });
}

export async function pushChatSessions(userId: string, sessions: ChatSession[]) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase || sessions.length === 0) return;
  await supabase.from("chat_sessions").upsert(
    sessions.map((s) => ({
      id: s.id,
      user_id: userId,
      title: s.title,
      messages: s.messages,
      updated_at: new Date().toISOString(),
    })),
  );
}
