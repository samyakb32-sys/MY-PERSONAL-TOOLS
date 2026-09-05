"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { useAuth } from "@/lib/auth";
import { pullRemoteData, pushSettings, pushChatSessions } from "@/lib/sync";
import { readSettings } from "@/lib/settings";
import { readSessions, CHAT_SESSIONS_CHANGE_EVENT } from "@/lib/chat-history";

const SETTINGS_CHANGE_EVENT = "personal-tools:settings-changed";

export function SyncProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const pulledForUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!user || pulledForUserId.current === user.id) return;
    pulledForUserId.current = user.id;
    pullRemoteData(user.id);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const userId = user.id;

    const pushSettingsNow = () => pushSettings(userId, readSettings());
    const pushSessionsNow = () => pushChatSessions(userId, readSessions());

    window.addEventListener(SETTINGS_CHANGE_EVENT, pushSettingsNow);
    window.addEventListener(CHAT_SESSIONS_CHANGE_EVENT, pushSessionsNow);
    return () => {
      window.removeEventListener(SETTINGS_CHANGE_EVENT, pushSettingsNow);
      window.removeEventListener(CHAT_SESSIONS_CHANGE_EVENT, pushSessionsNow);
    };
  }, [user]);

  return <>{children}</>;
}
