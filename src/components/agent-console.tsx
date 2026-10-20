"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Brain } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSettings } from "@/lib/settings";
import { matchFastAction } from "@/lib/fast-actions";
import { providerMeta } from "@/components/ai-chat";
import type { ChatProvider } from "@/app/api/chat/route";
import type { JevDecision } from "@/lib/jev";

type LogEntry = {
  task: string;
  decision: JevDecision | null;
  result: string;
  route: "fast" | "complex" | "error";
};

export function AgentConsole() {
  const router = useRouter();
  const { settings, loaded } = useSettings();
  const [providerId, setProviderId] = useState<ChatProvider>("claude");
  const [task, setTask] = useState("");
  const [log, setLog] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState(false);

  if (!loaded) return null;

  const provider = providerMeta.find((p) => p.id === providerId)!;
  const apiKey = settings[provider.keyField];

  async function run() {
    const currentTask = task.trim();
    if (!currentTask || running) return;
    setTask("");
    setRunning(true);

    let decision: JevDecision | null = null;
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ task: currentTask }),
      });
      const data = await res.json();
      if (res.ok) decision = data as JevDecision;
    } catch {
      // Classification failing shouldn't block the task - fall through to complex/escalate.
    }

    if (decision?.category === "fast") {
      const action = matchFastAction(currentTask);
      if (action?.kind === "navigate") {
        router.push(action.route);
        setLog((prev) => [
          { task: currentTask, decision, result: `Opened ${action.label} directly - no AI call.`, route: "fast" },
          ...prev,
        ]);
        setRunning(false);
        return;
      }
      if (action?.kind === "info") {
        setLog((prev) => [{ task: currentTask, decision, result: action.text, route: "fast" }, ...prev]);
        setRunning(false);
        return;
      }
      // Jev called it fast, but there's no local handler for it - escalate anyway.
    }

    if (!apiKey) {
      setLog((prev) => [
        {
          task: currentTask,
          decision,
          result: `Add a ${provider.name} API key in Settings to escalate this task.`,
          route: "error",
        },
        ...prev,
      ]);
      setRunning(false);
      return;
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          provider: providerId,
          apiKey,
          model: provider.defaultModel,
          messages: [{ role: "user", content: currentTask }],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setLog((prev) => [{ task: currentTask, decision, result: data.content, route: "complex" }, ...prev]);
    } catch (err) {
      setLog((prev) => [
        {
          task: currentTask,
          decision,
          result: err instanceof Error ? err.message : "Something went wrong",
          route: "error",
        },
        ...prev,
      ]);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        Every task is routed by Jev (TypeSafe AI) first: routine tasks execute instantly with no LLM
        call, ambiguous ones escalate to the model below.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {providerMeta.map((p) => (
          <Button
            key={p.id}
            size="sm"
            variant={p.id === providerId ? "default" : "outline"}
            onClick={() => setProviderId(p.id)}
          >
            {p.name}
            {!settings[p.keyField] && <span className="ml-1 text-xs opacity-60">(no key)</span>}
          </Button>
        ))}
      </div>

      <Card className="flex-1">
        <CardContent className="flex h-96 flex-col gap-3 overflow-y-auto p-4">
          {log.length === 0 && (
            <p className="m-auto text-sm text-muted-foreground">
              Try &quot;open settings&quot;, &quot;what&apos;s the time&quot;, or &quot;write a sales
              summary&quot;.
            </p>
          )}
          {log.map((entry, i) => (
            <div key={i} className="space-y-1.5 rounded-lg border p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{entry.task}</span>
                {entry.decision && (
                  <Badge
                    variant={entry.route === "fast" ? "default" : "outline"}
                    className="gap-1 text-xs"
                  >
                    {entry.route === "fast" ? <Zap className="size-3" /> : <Brain className="size-3" />}
                    {entry.decision.category} · {entry.decision.latencyMs}ms · {entry.decision.source}
                  </Badge>
                )}
              </div>
              <p
                className={cn(
                  "whitespace-pre-wrap text-muted-foreground",
                  entry.route === "error" && "text-destructive",
                )}
              >
                {entry.result}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Input
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              run();
            }
          }}
          placeholder="Give the agent a task..."
          disabled={running}
        />
        <Button onClick={run} disabled={running || !task.trim()}>
          Run
        </Button>
      </div>
    </div>
  );
}
