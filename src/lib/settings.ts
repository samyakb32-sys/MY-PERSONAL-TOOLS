"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Settings = {
  githubToken: string;
  vercelToken: string;
  supabaseAccessToken: string;
  firebaseProjectId: string;
  claudeApiKey: string;
  openaiApiKey: string;
  geminiApiKey: string;
  groqApiKey: string;
};

export const emptySettings: Settings = {
  githubToken: "",
  vercelToken: "",
  supabaseAccessToken: "",
  firebaseProjectId: "",
  claudeApiKey: "",
  openaiApiKey: "",
  geminiApiKey: "",
  groqApiKey: "",
};

const STORAGE_KEY = "personal-tools:settings";
const CHANGE_EVENT = "personal-tools:settings-changed";

export function readSettings(): Settings {
  if (typeof window === "undefined") return emptySettings;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptySettings;
    return { ...emptySettings, ...JSON.parse(raw) };
  } catch {
    return emptySettings;
  }
}

export function writeSettings(settings: Settings) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // localStorage unavailable (private mode, etc.) - silently no-op
  }
}

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getServerSnapshotFalse() {
  return false;
}
function getSnapshotTrue() {
  return true;
}

export function useSettings() {
  const settings = useSyncExternalStore(subscribe, readSettings, () => emptySettings);
  const loaded = useSyncExternalStore(subscribe, getSnapshotTrue, getServerSnapshotFalse);

  const update = useCallback((patch: Partial<Settings>) => {
    writeSettings({ ...readSettings(), ...patch });
  }, []);

  return { settings, update, loaded };
}
