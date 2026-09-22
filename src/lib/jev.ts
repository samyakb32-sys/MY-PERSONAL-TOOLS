export type TaskCategory = "fast" | "complex";

export type JevDecision = {
  category: TaskCategory;
  confidence: number;
  latencyMs: number;
  source: "jev" | "heuristic";
};

const GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/chat/completions";
const GATEWAY_MODEL = "typesafe-ai/jev";
const GATEWAY_TIMEOUT_MS = 3000;

/**
 * Routine-task keywords for the mock/fallback classifier, mirroring the
 * heuristic used in the standalone jev-test prototype. Used whenever the
 * AI_GATEWAY_API_KEY isn't set, or a live Jev call fails - the routing
 * decision must never block on the classifier being unavailable.
 */
const FAST_PATTERN =
  /^(open|check|show|list|go to|navigate|toggle|enable|disable|log ?out|log ?in|what('?s| is) the (time|date))\b/i;

function heuristicClassify(task: string, startedAt: number): JevDecision {
  const isFast = FAST_PATTERN.test(task.trim());
  return {
    category: isFast ? "fast" : "complex",
    confidence: 0.6,
    latencyMs: Date.now() - startedAt,
    source: "heuristic",
  };
}

/**
 * Classifies a task as "fast" (routine, no reasoning needed - safe to
 * execute directly or skip a big LLM call) or "complex" (needs reasoning
 * or generation - escalate to a full model). Calls Jev (TypeSafe AI)
 * through the Vercel AI Gateway when configured; Jev's exact response
 * schema (typed Choice/Score/Noul) isn't confirmed yet from docs alone,
 * so the reply is parsed loosely and any failure falls back to the
 * keyword heuristic rather than surfacing an error.
 */
export async function classifyTask(task: string): Promise<JevDecision> {
  const startedAt = Date.now();
  const apiKey = process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) return heuristicClassify(task, startedAt);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GATEWAY_TIMEOUT_MS);
    const res = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: GATEWAY_MODEL,
        messages: [
          {
            role: "user",
            content:
              `Classify the following task as exactly one word, "fast" or "complex". ` +
              `"fast" means routine/simple with no reasoning or generation required. ` +
              `"complex" means it needs reasoning, generation, or judgment.\n\nTask: ${task}`,
          },
        ],
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!res.ok) return heuristicClassify(task, startedAt);

    const data = await res.json();
    const text: unknown = data?.choices?.[0]?.message?.content ?? data?.choice ?? data?.category;
    const normalized = typeof text === "string" ? text.trim().toLowerCase() : "";

    if (normalized.includes("fast")) {
      return { category: "fast", confidence: 0.9, latencyMs: Date.now() - startedAt, source: "jev" };
    }
    if (normalized.includes("complex")) {
      return { category: "complex", confidence: 0.9, latencyMs: Date.now() - startedAt, source: "jev" };
    }
    return heuristicClassify(task, startedAt);
  } catch {
    return heuristicClassify(task, startedAt);
  }
}
