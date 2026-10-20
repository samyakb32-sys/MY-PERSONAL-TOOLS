"use client";

export type ChatMessage = { role: "user" | "assistant"; content: string };
export type ChatSession = { id: string; title: string; messages: ChatMessage[] };

const STORAGE_KEY = "personal-tools:chat-sessions";
export const CHAT_SESSIONS_CHANGE_EVENT = "personal-tools:chat-sessions-changed";

export function readSessions(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeSessions(sessions: ChatSession[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    window.dispatchEvent(new Event(CHAT_SESSIONS_CHANGE_EVENT));
  } catch {
    // localStorage unavailable (private mode, quota, etc.) - silently no-op
  }
}

export function newSession(): ChatSession {
  return { id: crypto.randomUUID(), title: "New chat", messages: [] };
}
