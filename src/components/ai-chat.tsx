"use client";

import { useState } from "react";
import { Send, Plus, MessageSquare } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSettings, type Settings } from "@/lib/settings";
import type { ChatProvider } from "@/app/api/chat/route";

type Message = { role: "user" | "assistant"; content: string };
type ChatSession = { id: string; title: string; messages: Message[] };

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

function newSession(): ChatSession {
  return { id: crypto.randomUUID(), title: "New chat", messages: [] };
}

export function AiChat() {
  const { settings, loaded } = useSettings();
  const [providerId, setProviderId] = useState<ChatProvider>("claude");
  const [model, setModel] = useState(providerMeta[0].defaultModel);
  const [input, setInput] = useState("");
  const [sessions, setSessions] = useState<ChatSession[]>(() => [newSession()]);
  const [activeId, setActiveId] = useState(sessions[0].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loaded) return null;

  const provider = providerMeta.find((p) => p.id === providerId)!;
  const apiKey = settings[provider.keyField];
  const active = sessions.find((s) => s.id === activeId)!;

  function selectProvider(id: ChatProvider) {
    setProviderId(id);
    setModel(providerMeta.find((p) => p.id === id)!.defaultModel);
  }

  function updateActiveMessages(messages: Message[]) {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeId
          ? { ...s, messages, title: s.title === "New chat" ? messages[0]?.content.slice(0, 30) || s.title : s.title }
          : s,
      ),
    );
  }

  function startNewChat() {
    const session = newSession();
    setSessions((prev) => [session, ...prev]);
    setActiveId(session.id);
    setError(null);
  }

  async function send() {
    if (!input.trim() || !apiKey) return;
    const nextMessages: Message[] = [...active.messages, { role: "user", content: input }];
    updateActiveMessages(nextMessages);
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
      updateActiveMessages([...nextMessages, { role: "assistant", content: data.content }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col gap-3">
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

      <div className="flex min-h-0 flex-1 gap-3">
        <div className="hidden w-44 shrink-0 flex-col gap-1 sm:flex">
          <Button size="sm" variant="outline" onClick={startNewChat}>
            <Plus /> New chat
          </Button>
          <div className="mt-1 space-y-0.5 overflow-y-auto">
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                className={cn(
                  "flex w-full items-center gap-1.5 truncate rounded-md px-2 py-1.5 text-left text-xs",
                  s.id === activeId
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50",
                )}
              >
                <MessageSquare className="size-3 shrink-0" />
                <span className="truncate">{s.title}</span>
              </button>
            ))}
          </div>
        </div>

        <Card className="flex-1">
          <CardContent className="flex h-96 flex-col gap-3 overflow-y-auto p-4">
            {active.messages.length === 0 && (
              <p className="m-auto text-sm text-muted-foreground">
                {apiKey
                  ? `Start chatting with ${provider.name}.`
                  : `Add a ${provider.name} API key in Settings to start chatting.`}
              </p>
            )}
            {active.messages.map((m, i) => (
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
      </div>

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
