export type AiProvider = "claude" | "chatgpt" | "gemini" | "groq";

export const aiProviders: {
  id: AiProvider;
  name: string;
  connected: boolean;
}[] = [
  { id: "claude", name: "Claude", connected: false },
  { id: "chatgpt", name: "ChatGPT", connected: false },
  { id: "gemini", name: "Gemini", connected: false },
  { id: "groq", name: "Groq", connected: false },
];

export type Automation = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  lastRun: string | null;
};

export const automations: Automation[] = [
  {
    id: "a1",
    name: "Summarize new DMs",
    description: "Summarizes unread Instagram + LinkedIn messages every morning.",
    enabled: false,
    lastRun: null,
  },
  {
    id: "a2",
    name: "Draft replies",
    description: "Drafts a reply suggestion for unread messages using the selected model.",
    enabled: false,
    lastRun: null,
  },
];
