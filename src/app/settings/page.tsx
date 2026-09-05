"use client";

import { useState } from "react";

import { Topbar } from "@/components/topbar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSettings, type Settings } from "@/lib/settings";

type Field = {
  key: keyof Settings;
  label: string;
  placeholder: string;
  helpUrl: string;
};

const groups: { title: string; description: string; fields: Field[] }[] = [
  {
    title: "GitHub",
    description: "Used to show your repos and recent activity.",
    fields: [
      {
        key: "githubToken",
        label: "Personal access token",
        placeholder: "ghp_...",
        helpUrl: "https://github.com/settings/tokens",
      },
    ],
  },
  {
    title: "Vercel",
    description: "Used to show your projects and deployments.",
    fields: [
      {
        key: "vercelToken",
        label: "Access token",
        placeholder: "vercel token",
        helpUrl: "https://vercel.com/account/tokens",
      },
    ],
  },
  {
    title: "Supabase",
    description: "Used to show your Supabase projects.",
    fields: [
      {
        key: "supabaseAccessToken",
        label: "Personal access token",
        placeholder: "sbp_...",
        helpUrl: "https://supabase.com/dashboard/account/tokens",
      },
    ],
  },
  {
    title: "Firebase",
    description: "Stored for reference; live stats need a service account and are not fetched yet.",
    fields: [
      {
        key: "firebaseProjectId",
        label: "Project ID",
        placeholder: "my-firebase-project",
        helpUrl: "https://console.firebase.google.com/",
      },
    ],
  },
  {
    title: "AI providers",
    description: "API keys are only stored in your browser and sent directly to each provider when you chat.",
    fields: [
      {
        key: "claudeApiKey",
        label: "Claude (Anthropic) API key",
        placeholder: "sk-ant-...",
        helpUrl: "https://console.anthropic.com/settings/keys",
      },
      {
        key: "openaiApiKey",
        label: "ChatGPT (OpenAI) API key",
        placeholder: "sk-...",
        helpUrl: "https://platform.openai.com/api-keys",
      },
      {
        key: "geminiApiKey",
        label: "Gemini (Google AI) API key",
        placeholder: "AIza...",
        helpUrl: "https://aistudio.google.com/apikey",
      },
      {
        key: "groqApiKey",
        label: "Groq API key",
        placeholder: "gsk_...",
        helpUrl: "https://console.groq.com/keys",
      },
    ],
  },
];

export default function SettingsPage() {
  const { settings, update, loaded } = useSettings();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  if (!loaded) return null;

  return (
    <>
      <Topbar title="Settings" />
      <main className="flex-1 space-y-6 p-6">
        <p className="text-sm text-muted-foreground">
          All keys below are stored only in this browser&apos;s local storage
          — nothing is sent to a server except directly to the provider
          each key belongs to.
        </p>

        {groups.map((group) => (
          <Card key={group.title}>
            <CardHeader>
              <CardTitle>{group.title}</CardTitle>
              <CardDescription>{group.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {group.fields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label htmlFor={field.key}>
                    {field.label}{" "}
                    <a
                      href={field.helpUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-normal text-muted-foreground underline"
                    >
                      get one
                    </a>
                  </Label>
                  <Input
                    id={field.key}
                    type="password"
                    autoComplete="off"
                    placeholder={field.placeholder}
                    value={settings[field.key]}
                    onChange={(e) => {
                      update({ [field.key]: e.target.value });
                      setSavedAt(Date.now());
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              update({ ...settings });
              setSavedAt(Date.now());
            }}
          >
            Save
          </Button>
          {savedAt && (
            <span className="text-xs text-muted-foreground">Saved</span>
          )}
        </div>
      </main>
    </>
  );
}
