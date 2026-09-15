import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type ApiCaller = { userId: string | null };

/**
 * These routes proxy requests using caller-supplied credentials, so they must
 * not be open to the internet. When Supabase is configured a valid session is
 * required; when it isn't, the app is in local-only mode and there is no
 * session to check.
 */
export async function authenticateRequest(): Promise<ApiCaller | null> {
  if (!isSupabaseConfigured()) return { userId: null };

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { userId: null };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? { userId: user.id } : null;
}
