"use client";

import { useSettings, type Settings } from "@/lib/settings";
import type { ChatProvider } from "@/app/api/chat/route";

const providerOrder: { id: ChatProvider; keyField: keyof Settings; defaultModel: string }[] = [
  { id: "claude", keyField: "claudeApiKey", defaultModel: "claude-sonnet-5" },
  { id: "chatgpt", keyField: "openaiApiKey", defaultModel: "gpt-4o-mini" },
  { id: "gemini", keyField: "geminiApiKey", defaultModel: "gemini-2.5-flash" },
  { id: "groq", keyField: "groqApiKey", defaultModel: "llama-3.3-70b-versatile" },
];

export function useAiAssist() {
  const { settings } = useSettings();
  const provider = providerOrder.find((p) => settings[p.keyField]);

  async function run(prompt: string): Promise<string> {
    if (!provider) throw new Error("Add an AI provider API key in Settings first.");
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        provider: provider.id,
        apiKey: settings[provider.keyField],
        model: provider.defaultModel,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "AI request failed");
    return data.content as string;
  }

  return { available: Boolean(provider), run };
}
