export type Creation = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  status: "live" | "in-progress" | "archived";
  repoUrl?: string;
  liveUrl?: string;
};

export const creations: Creation[] = [
  {
    id: "c1",
    name: "Personal Tools Dashboard",
    description: "This app — a unified hub for social, AI, dev tools, and projects.",
    tags: ["Next.js", "TypeScript", "Tailwind"],
    status: "in-progress",
  },
];
