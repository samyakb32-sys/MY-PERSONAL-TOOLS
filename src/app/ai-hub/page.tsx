"use client";

import Link from "next/link";

import { Topbar } from "@/components/topbar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AiChat } from "@/components/ai-chat";
import { useSettings, type Settings } from "@/lib/settings";
import { automations } from "@/data/ai-providers";

const providerKeys: { id: string; name: string; keyField: keyof Settings }[] = [
  { id: "claude", name: "Claude", keyField: "claudeApiKey" },
  { id: "chatgpt", name: "ChatGPT", keyField: "openaiApiKey" },
  { id: "gemini", name: "Gemini", keyField: "geminiApiKey" },
  { id: "groq", name: "Groq", keyField: "groqApiKey" },
];

export default function AiHubPage() {
  const { settings, loaded } = useSettings();

  if (!loaded) return null;

  return (
    <>
      <Topbar section="AI Hub" page="Model Workspace" />
      <main className="flex flex-1 gap-4 overflow-hidden p-6">
        <div className="min-w-0 flex-1">
          <AiChat />
        </div>

        <div className="hidden w-72 shrink-0 space-y-4 xl:block">
          <Card>
            <CardHeader>
              <CardTitle>API Keys Settings</CardTitle>
              <CardDescription>Managed in Settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {providerKeys.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span>{p.name}</span>
                  <Badge variant={settings[p.keyField] ? "default" : "outline"}>
                    {settings[p.keyField] ? "Connected" : "Not connected"}
                  </Badge>
                </div>
              ))}
              <Button size="sm" variant="outline" className="w-full" asChild>
                <Link href="/settings">Manage keys</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Automations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {automations.map((automation) => (
                <div key={automation.id} className="space-y-1 border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{automation.name}</p>
                    <Button
                      size="sm"
                      variant={automation.enabled ? "default" : "outline"}
                    >
                      {automation.enabled ? "On" : "Off"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">{automation.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Last run: {automation.lastRun ?? "never"}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
