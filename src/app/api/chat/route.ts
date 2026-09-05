import { NextResponse } from "next/server";

import { callProvider, type ChatProvider, type ChatMessage } from "@/lib/llm";

export type { ChatProvider };

type ChatRequestBody = {
  provider: ChatProvider;
  apiKey: string;
  model: string;
  messages: ChatMessage[];
};

export async function POST(req: Request) {
  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { provider, apiKey, model, messages } = body;

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 400 });
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Missing messages" }, { status: 400 });
  }

  try {
    const content = await callProvider(provider, apiKey, model, messages);
    return NextResponse.json({ content });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
