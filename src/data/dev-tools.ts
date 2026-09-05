export type DevService = "github" | "supabase" | "vercel" | "firebase";

export const devServices: {
  id: DevService;
  name: string;
  connected: boolean;
  summary: string;
}[] = [
  { id: "github", name: "GitHub", connected: false, summary: "Not connected" },
  { id: "supabase", name: "Supabase", connected: false, summary: "Not connected" },
  { id: "vercel", name: "Vercel", connected: false, summary: "Not connected" },
  { id: "firebase", name: "Firebase", connected: false, summary: "Not connected" },
];
