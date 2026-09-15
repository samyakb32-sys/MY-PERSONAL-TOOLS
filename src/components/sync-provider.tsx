"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { useAuth } from "@/lib/auth";
import { pullRemoteData, pushSettings, pushChatSessions } from "@/lib/sync";
import { readSettings, emptySettings } from "@/lib/settings";
import { readSessions, CHAT_SESSIONS_CHANGE_EVENT } from "@/lib/chat-history";

const SETTINGS_CHANGE_EVENT = "personal-tools:settings-changed";

function hasLocalSettings() {
  const local = readSettings();
  return Object.keys(emptySettings).some((key) => local[key as keyof typeof emptySettings]);
}

export function SyncProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const pulledForUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      // Allow a re-pull if the same account signs back in later.
      pulledForUserId.current = null;
      return;
    }
    if (pulledForUserId.current === user.id) return;
    pulledForUserId.current = user.id;

    const userId = user.id;
    let cancelled = false;

    (async () => {
      try {
        const { hadRemoteSettings, hadRemoteSessions } = await pullRemoteData(userId);
        if (cancelled) return;
        // First sign-in on a fresh account: seed it from whatever is already local
        // instead of leaving the account empty until the next edit.
        if (!hadRemoteSettings && hasLocalSettings()) await pushSettings(userId, readSettings());
        if (cancelled) return;
        if (!hadRemoteSessions) {
          const localSessions = readSessions().filter((s) => s.messages.length > 0);
          if (localSessions.length > 0) await pushChatSessions(userId, localSessions);
        }
      } catch {
        // Sync is best-effort; the app stays usable on local data if it fails.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const userId = user.id;

    // Settings fire a change event per keystroke, so coalesce before writing.
    let settingsTimer: ReturnType<typeof setTimeout> | undefined;
    let sessionsTimer: ReturnType<typeof setTimeout> | undefined;

    const pushSettingsSoon = () => {
      clearTimeout(settingsTimer);
      settingsTimer = setTimeout(() => {
        pushSettings(userId, readSettings()).catch(() => {});
      }, 800);
    };
    const pushSessionsSoon = () => {
      clearTimeout(sessionsTimer);
      sessionsTimer = setTimeout(() => {
        pushChatSessions(userId, readSessions()).catch(() => {});
      }, 800);
    };

    window.addEventListener(SETTINGS_CHANGE_EVENT, pushSettingsSoon);
    window.addEventListener(CHAT_SESSIONS_CHANGE_EVENT, pushSessionsSoon);
    return () => {
      clearTimeout(settingsTimer);
      clearTimeout(sessionsTimer);
      window.removeEventListener(SETTINGS_CHANGE_EVENT, pushSettingsSoon);
      window.removeEventListener(CHAT_SESSIONS_CHANGE_EVENT, pushSessionsSoon);
    };
  }, [user]);

  return <>{children}</>;
}
