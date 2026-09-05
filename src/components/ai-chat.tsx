"use client";

import { useState } from "react";
import { Send } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSettings, type Settings } from "@/lib/settings";
import type { ChatProvider } from "@/app/api/chat/route";

type Message = { role: "user" | "assistant"; content: string };

const providerMeta: {
  id: ChatProvider;
  name: string;
  keyField: keyof Settings;
  defaultModel: string;
}[] = [
  { id: "claude", name: "Claude", keyField: "claudeApiKey", defaultModel: "claude-sonnet-5" },
  { id: "chatgpt", name: "ChatGPT", keyField: "openaiApiKey", defaultModel: "gpt-4o-mini" },
  { id: "gemini", name: "Gemini", keyField: "geminiApiKey", defaultModel: "gemini-2.5-flash" },
  { id: "groq", name: "Groq", keyField: "groqApiKey", defaultModel: "llama-3.3-70b-versatile" },
];

export function AiChat() {
  const { settings, loaded } = useSettings();
  const [providerId, setProviderId] = useState<ChatProvider>("claude");
  const [model, setModel] = useState(providerMeta[0].defaultModel);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loaded) return null;

  const provider = providerMeta.find((p) => p.id === providerId)!;
  const apiKey = settings[provider.keyField];

  function selectProvider(id: ChatProvider) {
    setProviderId(id);
    setModel(providerMeta.find((p) => p.id === id)!.defaultModel);
  }

  async function send() {
    if (!input.trim() || !apiKey) return;
    const nextMessages: Message[] = [...messages, { role: "user", content: input }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          provider: providerId,
          apiKey,
          model,
          messages: nextMessages,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setMessages([...nextMessages, { role: "assistant", content: data.content }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {providerMeta.map((p) => (
          <Button
            key={p.id}
            size="sm"
            variant={p.id === providerId ? "default" : "outline"}
            onClick={() => selectProvider(p.id)}
          >
            {p.name}
            {!settings[p.keyField] && (
              <span className="ml-1 text-xs opacity-60">(no key)</span>
            )}
          </Button>
        ))}
        <Input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="ml-auto h-8 w-48 text-xs"
          aria-label="Model"
        />
      </div>

      <Card>
        <CardContent className="flex h-96 flex-col gap-3 overflow-y-auto p-4">
          {messages.length === 0 && (
            <p className="m-auto text-sm text-muted-foreground">
              {apiKey
                ? `Start chatting with ${provider.name}.`
                : `Add a ${provider.name} API key in Settings to start chatting.`}
            </p>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                m.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "mr-auto bg-muted",
              )}
            >
              {m.content}
            </div>
          ))}
          {loading && (
            <div className="mr-auto rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
              Thinking...
            </div>
          )}
          {error && (
            <div className="mr-auto rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={apiKey ? "Message..." : "Add an API key in Settings first"}
          disabled={!apiKey || loading}
        />
        <Button onClick={send} disabled={!apiKey || loading || !input.trim()}>
          <Send />
        </Button>
      </div>
    </div>
  );
}
