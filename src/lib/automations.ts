"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type AutomationState = { enabled: boolean; lastRun: string | null };

export async function fetchAutomationStates(
  userId: string,
): Promise<Record<string, AutomationState>> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return {};
  const { data, error } = await supabase
    .from("automations")
    .select("automation_key,enabled,last_run")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  const result: Record<string, AutomationState> = {};
  for (const row of (data ?? []) as { automation_key: string; enabled: boolean; last_run: string | null }[]) {
    result[row.automation_key] = { enabled: row.enabled, lastRun: row.last_run };
  }
  return result;
}

export async function setAutomationEnabled(
  userId: string,
  automationKey: string,
  enabled: boolean,
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  const { error } = await supabase
    .from("automations")
    .upsert({ user_id: userId, automation_key: automationKey, enabled });
  if (error) throw new Error(error.message);
}
