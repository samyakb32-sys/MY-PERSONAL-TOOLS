export type Creation = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  status: "live" | "in-progress" | "archived";
  repoUrl?: string;
  liveUrl?: string;
};

export const statusLabel: Record<Creation["status"], string> = {
  live: "Live",
  "in-progress": "WIP",
  archived: "Built",
};

export const creations: Creation[] = [
  {
    id: "c1",
    name: "ARIXIA Dashboard",
    description: "This app — a unified hub for social, AI, dev tools, and projects.",
    tags: ["Next.js", "Tailwind", "shadcn/ui"],
    status: "in-progress",
  },
  {
    id: "c2",
    name: "Gen-Art Generator",
    description: "Generative art playground with seeded randomness.",
    tags: ["Next.js", "Tailwind", "AI"],
    status: "live",
  },
  {
    id: "c3",
    name: "DevStats",
    description: "Personal dev activity tracker.",
    tags: ["Next.js", "Tailwind"],
    status: "archived",
  },
  {
    id: "c4",
    name: "DataViz",
    description: "Small charting toolkit experiments.",
    tags: ["React", "shadcn/ui", "AI"],
    status: "in-progress",
  },
];
