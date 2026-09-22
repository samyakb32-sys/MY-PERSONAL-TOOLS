export type ChatProvider = "claude" | "chatgpt" | "gemini" | "groq";
export type ChatMessage = { role: "user" | "assistant"; content: string };

export async function callProvider(
  provider: ChatProvider,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
): Promise<string> {
  switch (provider) {
    case "claude":
      return callClaude(apiKey, model, messages);
    case "chatgpt":
      return callOpenAiCompatible("https://api.openai.com/v1/chat/completions", apiKey, model, messages);
    case "groq":
      return callOpenAiCompatible("https://api.groq.com/openai/v1/chat/completions", apiKey, model, messages);
    case "gemini":
      return callGemini(apiKey, model, messages);
    default:
      throw new Error("Unknown provider");
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
