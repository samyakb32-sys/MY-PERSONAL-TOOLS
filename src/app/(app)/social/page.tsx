"use client";

import { useState } from "react";
import { Camera, Briefcase, Send } from "lucide-react";

import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAiAssist } from "@/lib/ai-assist";
import { socialMessages, socialStats, type Platform } from "@/data/social";

const platformIcon: Record<Platform, typeof Camera> = {
  instagram: Camera,
  linkedin: Briefcase,
};

export default function SocialPage() {
  const [selectedId, setSelectedId] = useState(socialMessages[0].id);
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [sentReplies, setSentReplies] = useState<Record<string, string[]>>({});
  const [aiLoading, setAiLoading] = useState<"summarize" | "draft" | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const { available, run } = useAiAssist();

  const selected = socialMessages.find((m) => m.id === selectedId)!;
  const Icon = platformIcon[selected.platform];
  const draft = drafts[selectedId] ?? "";

  async function handleSummarize() {
    setAiError(null);
    setAiLoading("summarize");
    try {
      const summary = await run(
        `Summarize this direct message in one short sentence: "${selected.preview}"`,
      );
      setSummaries((prev) => ({ ...prev, [selectedId]: summary }));
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAiLoading(null);
    }
  }

  async function handleDraft() {
    setAiError(null);
    setAiLoading("draft");
    try {
      const reply = await run(
        `Draft a short, friendly reply to this direct message: "${selected.preview}". Only return the reply text.`,
      );
      setDrafts((prev) => ({ ...prev, [selectedId]: reply }));
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAiLoading(null);
    }
  }

  function handleSend() {
    if (!draft.trim()) return;
    setSentReplies((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] ?? []), draft],
    }));
    setDrafts((prev) => ({ ...prev, [selectedId]: "" }));
  }

  return (
    <>
      <Topbar section="Social" page="Unified Inbox" />
      <main className="flex flex-1 gap-4 overflow-hidden p-6">
        <div className="flex w-80 shrink-0 flex-col">
          <Card className="flex-1 overflow-hidden py-0">
            <div className="border-b p-4">
              <p className="text-sm font-semibold">Inbox</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Instagram: {socialStats.instagram.followers.toLocaleString()} followers /{" "}
                {socialStats.instagram.unread} unread
                <br />
                LinkedIn: {socialStats.linkedin.followers.toLocaleString()} followers /{" "}
                {socialStats.linkedin.unread} unread
              </p>
            </div>
            <div className="max-h-full overflow-y-auto">
              {socialMessages.map((message) => {
                const MsgIcon = platformIcon[message.platform];
                return (
                  <button
                    key={message.id}
                    onClick={() => setSelectedId(message.id)}
                    className={cn(
                      "flex w-full items-start gap-3 border-b p-4 text-left last:border-0",
                      message.id === selectedId ? "bg-accent" : "hover:bg-accent/50",
                    )}
                  >
                    <Avatar>
                      <AvatarFallback>{message.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-sm">
                        <MsgIcon className="size-3.5 text-muted-foreground" />
                        <span className="truncate font-medium">{message.sender}</span>
                        {message.unread && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
                        <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                          {message.timestamp}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {message.preview}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        <Card className="flex min-w-0 flex-1 flex-col">
          <CardContent className="flex flex-1 flex-col gap-4 overflow-y-auto">
            <div className="flex items-center gap-2 border-b pb-3">
              <Icon className="size-4 text-muted-foreground" />
              <p className="font-semibold">{selected.sender}</p>
              <span className="text-xs text-muted-foreground">{selected.timestamp}</span>
            </div>

            <div className="rounded-lg border bg-muted/40 p-3 text-sm">
              <p className="mb-1 text-xs font-medium text-muted-foreground">Thread summary</p>
              {summaries[selectedId] ? (
                <p>{summaries[selectedId]}</p>
              ) : (
                <p className="text-muted-foreground">
                  {available
                    ? 'No summary yet — click "Summarize" below.'
                    : "Add an AI provider key in Settings to generate summaries."}
                </p>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-3">
              <div className="mr-auto max-w-[80%] rounded-lg bg-muted px-3 py-2 text-sm">
                {selected.preview}
              </div>
              {(sentReplies[selectedId] ?? []).map((reply, i) => (
                <div
                  key={i}
                  className="ml-auto max-w-[80%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
                >
                  {reply}
                </div>
              ))}
            </div>

            {aiError && <p className="text-sm text-destructive">{aiError}</p>}
          </CardContent>

          <div className="space-y-2 border-t p-4">
            <Textarea
              value={draft}
              onChange={(e) => setDrafts((prev) => ({ ...prev, [selectedId]: e.target.value }))}
              placeholder="Type a message..."
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSummarize}
                disabled={!available || aiLoading !== null}
              >
                {aiLoading === "summarize" ? "Summarizing..." : "Summarize"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDraft}
                disabled={!available || aiLoading !== null}
              >
                {aiLoading === "draft" ? "Drafting..." : "Draft with AI"}
              </Button>
              <Button size="sm" onClick={handleSend} disabled={!draft.trim()}>
                <Send /> Send
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </>
  );
}
