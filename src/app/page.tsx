import { MessagesSquare, Bot, Rocket, FolderGit2 } from "lucide-react";

import { Topbar } from "@/components/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { socialMessages } from "@/data/social";
import { automations } from "@/data/ai-providers";
import { creations } from "@/data/creations";

export default function Home() {
  const unreadCount = socialMessages.filter((m) => m.unread).length;
  const activeAutomations = automations.filter((a) => a.enabled).length;

  const tiles = [
    {
      label: "Unread messages",
      value: unreadCount,
      icon: MessagesSquare,
    },
    {
      label: "Active automations",
      value: activeAutomations,
      icon: Bot,
    },
    {
      label: "Recent deploys",
      value: 0,
      icon: Rocket,
    },
    {
      label: "Projects",
      value: creations.length,
      icon: FolderGit2,
    },
  ];

  return (
    <>
      <Topbar title="Home" />
      <main className="flex-1 space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <Card key={tile.label}>
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {tile.label}
                  </CardTitle>
                  <Icon className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{tile.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Latest project</CardTitle>
          </CardHeader>
          <CardContent>
            {creations[0] ? (
              <p className="text-sm text-muted-foreground">
                {creations[0].name} — {creations[0].description}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No projects added yet.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
