import { NextResponse } from "next/server";

export type ChatProvider = "claude" | "chatgpt" | "gemini" | "groq";

type ChatMessage = { role: "user" | "assistant"; content: string };

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
    switch (provider) {
      case "claude":
        return NextResponse.json({ content: await callClaude(apiKey, model, messages) });
      case "chatgpt":
        return NextResponse.json({
          content: await callOpenAiCompatible(
            "https://api.openai.com/v1/chat/completions",
            apiKey,
            model,
            messages,
          ),
        });
      case "groq":
        return NextResponse.json({
          content: await callOpenAiCompatible(
            "https://api.groq.com/openai/v1/chat/completions",
            apiKey,
            model,
            messages,
          ),
        });
      case "gemini":
        return NextResponse.json({ content: await callGemini(apiKey, model, messages) });
      default:
        return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

async function callClaude(apiKey: string, model: string, messages: ChatMessage[]) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message ?? `Claude API error ${res.status}`);
  }
  return data.content?.[0]?.text ?? "";
}

async function callOpenAiCompatible(
  url: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ model, messages }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message ?? `API error ${res.status}`);
  }
  return data.choices?.[0]?.message?.content ?? "";
}

async function callGemini(apiKey: string, model: string, messages: ChatMessage[]) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
      }),
    },
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message ?? `Gemini API error ${res.status}`);
  }
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}
