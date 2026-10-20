import { NextResponse } from "next/server";

import { callProvider, type ChatProvider, type ChatMessage } from "@/lib/llm";
import { authenticateRequest } from "@/lib/api-auth";
import { rateLimit, callerKey } from "@/lib/rate-limit";

export type { ChatProvider };

const PROVIDERS: ChatProvider[] = ["claude", "chatgpt", "gemini", "groq"];
const MAX_MESSAGES = 100;
const MAX_TOTAL_CHARS = 200_000;

type ValidatedBody = {
  provider: ChatProvider;
  apiKey: string;
  model: string;
  messages: ChatMessage[];
};

function validate(body: unknown): { ok: true; value: ValidatedBody } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) return { ok: false, error: "Body must be an object" };
  const { provider, apiKey, model, messages } = body as Record<string, unknown>;

  if (typeof provider !== "string" || !PROVIDERS.includes(provider as ChatProvider)) {
    return { ok: false, error: "Unknown provider" };
  }
  if (typeof apiKey !== "string" || apiKey.trim() === "") {
    return { ok: false, error: "Missing API key" };
  }
  if (typeof model !== "string" || model.trim() === "") {
    return { ok: false, error: "Missing model" };
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return { ok: false, error: "Missing messages" };
  }
  if (messages.length > MAX_MESSAGES) {
    return { ok: false, error: `Too many messages (max ${MAX_MESSAGES})` };
  }

  let totalChars = 0;
  for (const message of messages) {
    if (typeof message !== "object" || message === null) {
      return { ok: false, error: "Each message must be an object" };
    }
    const { role, content } = message as Record<string, unknown>;
    if (role !== "user" && role !== "assistant") {
      return { ok: false, error: "Message role must be 'user' or 'assistant'" };
    }
    if (typeof content !== "string") {
      return { ok: false, error: "Message content must be a string" };
    }
    totalChars += content.length;
  }
  if (totalChars > MAX_TOTAL_CHARS) {
    return { ok: false, error: `Conversation too long (max ${MAX_TOTAL_CHARS} characters)` };
  }

  return {
    ok: true,
    value: {
      provider: provider as ChatProvider,
      apiKey,
      model,
      messages: messages as ChatMessage[],
    },
  };
}

export async function POST(req: Request) {
  const caller = await authenticateRequest();
  if (!caller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = rateLimit(`chat:${callerKey(req, caller.userId)}`, 30, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validated = validate(body);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { provider, apiKey, model, messages } = validated.value;

  try {
    const content = await callProvider(provider, apiKey, model, messages);
    return NextResponse.json({ content });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
