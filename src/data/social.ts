export type Platform = "instagram" | "linkedin";

export type SocialMessage = {
  id: string;
  platform: Platform;
  sender: string;
  avatar: string;
  preview: string;
  timestamp: string;
  unread: boolean;
};

export const socialStats: Record<Platform, { followers: number; unread: number }> = {
  instagram: { followers: 4231, unread: 3 },
  linkedin: { followers: 1876, unread: 1 },
};

export const socialMessages: SocialMessage[] = [
  {
    id: "1",
    platform: "instagram",
    sender: "priya.codes",
    avatar: "PC",
    preview: "Hey! Loved your last post about Next.js, do you have the repo link?",
    timestamp: "2m ago",
    unread: true,
  },
  {
    id: "2",
    platform: "linkedin",
    sender: "Arjun Mehta",
    avatar: "AM",
    preview: "Following up on the freelance project we discussed last week.",
    timestamp: "1h ago",
    unread: true,
  },
  {
    id: "3",
    platform: "instagram",
    sender: "dev.diaries",
    avatar: "DD",
    preview: "Would you be open to a collab post on personal dashboards?",
    timestamp: "3h ago",
    unread: true,
  },
  {
    id: "4",
    platform: "linkedin",
    sender: "TalentScout HR",
    avatar: "TS",
    preview: "We have an opening that matches your profile, interested?",
    timestamp: "1d ago",
    unread: false,
  },
];
