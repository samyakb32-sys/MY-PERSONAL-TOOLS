"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type CreationStatus = "live" | "in-progress" | "archived";

export type Creation = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  status: CreationStatus;
  repoUrl: string | null;
  liveUrl: string | null;
};

type Row = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  status: CreationStatus;
  repo_url: string | null;
  live_url: string | null;
};

function fromRow(row: Row): Creation {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    tags: row.tags,
    status: row.status,
    repoUrl: row.repo_url,
    liveUrl: row.live_url,
  };
}

export async function fetchCreations(userId: string): Promise<Creation[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("creations")
    .select("id,name,description,tags,status,repo_url,live_url")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as Row[]).map(fromRow);
}

export async function addCreation(
  userId: string,
  input: {
    name: string;
    description: string;
    tags: string[];
    status: CreationStatus;
    repoUrl: string;
    liveUrl: string;
  },
): Promise<Creation> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase
    .from("creations")
    .insert({
      user_id: userId,
      name: input.name,
      description: input.description,
      tags: input.tags,
      status: input.status,
      repo_url: input.repoUrl || null,
      live_url: input.liveUrl || null,
    })
    .select("id,name,description,tags,status,repo_url,live_url")
    .single();
  if (error) throw new Error(error.message);
  return fromRow(data as Row);
}

export async function deleteCreation(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  const { error } = await supabase.from("creations").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
