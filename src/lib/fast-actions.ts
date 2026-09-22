/**
 * Local handlers for tasks Jev classifies as "fast" - executed directly in
 * the browser with no LLM call. Jev only gates the decision; it doesn't
 * perform the action itself. A task with no matching handler here falls
 * through to the complex/LLM path even if Jev called it "fast".
 */
export type FastAction =
  | { kind: "navigate"; route: string; label: string }
  | { kind: "info"; text: string };

const ROUTES: { pattern: RegExp; route: string; label: string }[] = [
  { pattern: /\b(dev ?tools?)\b/i, route: "/dev-tools", label: "Dev Tools" },
  { pattern: /\b(creations?|portfolio)\b/i, route: "/creations", label: "My Creations" },
  { pattern: /\b(settings?)\b/i, route: "/settings", label: "Settings" },
  { pattern: /\b(social|inbox|dm|messages?)\b/i, route: "/social", label: "Social" },
  { pattern: /\b(ai ?hub|chat)\b/i, route: "/ai-hub", label: "AI Hub" },
  { pattern: /\b(home|dashboard)\b/i, route: "/", label: "Home" },
];

export function matchFastAction(task: string): FastAction | null {
  const trimmed = task.trim();

  if (/^(open|go to|navigate to|show)\b/i.test(trimmed)) {
    const match = ROUTES.find((r) => r.pattern.test(trimmed));
    if (match) return { kind: "navigate", route: match.route, label: match.label };
  }

  if (/^what('?s| is) the time\b/i.test(trimmed)) {
    return { kind: "info", text: `It's ${new Date().toLocaleTimeString()}.` };
  }
  if (/^what('?s| is) the date\b/i.test(trimmed)) {
    return { kind: "info", text: `Today is ${new Date().toLocaleDateString()}.` };
  }

  return null;
}
