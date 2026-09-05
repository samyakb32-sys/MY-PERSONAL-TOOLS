import { MessagesSquare, Bot, Rocket, FolderGit2, Camera, Briefcase, Check } from "lucide-react";

import { Topbar } from "@/components/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { socialMessages, type Platform } from "@/data/social";
import { aiProviders, automations } from "@/data/ai-providers";
import { devServices } from "@/data/dev-tools";
import { creations, statusLabel } from "@/data/creations";

const platformIcon: Record<Platform, typeof Camera> = {
  instagram: Camera,
  linkedin: Briefcase,
};

export default function Home() {
  const unreadCount = socialMessages.filter((m) => m.unread).length;
  const activeAutomations = automations.filter((a) => a.enabled).length;

  const tiles = [
    { label: "Unread Messages", value: unreadCount, icon: MessagesSquare },
    { label: "Active Automations", value: activeAutomations, icon: Bot },
    { label: "Recent Deploys", value: 0, icon: Rocket },
    { label: "Projects", value: creations.length, icon: FolderGit2 },
  ];

  return (
    <>
      <Topbar section="Dashboard" page="Overview" />
      <main className="flex-1 space-y-4 p-6">
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

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Social Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {socialMessages.map((message) => {
                const Icon = platformIcon[message.platform];
                return (
                  <div key={message.id} className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0">
                    <Avatar>
                      <AvatarFallback>{message.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2 text-sm">
                        <Icon className="size-3.5 text-muted-foreground" />
                        <span className="font-medium capitalize">{message.platform}</span>
                        <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                        {message.unread && <span className="size-1.5 rounded-full bg-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{message.preview}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Reply</Button>
                        <Button size="sm" variant="outline">Summarize</Button>
                        <Button size="sm" variant="outline">Draft with AI</Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Dev Operations Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {devServices.map((service) => (
                    <div key={service.id} className="rounded-md border p-3 text-center text-sm">
                      <p className="font-medium">{service.name}</p>
                      <p className="text-xs text-muted-foreground">{service.summary}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Overall health</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <span key={i} className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-primary">
                        <Check className="size-3" />
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Hub Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {aiProviders.map((provider) => (
                    <Badge key={provider.id} variant={provider.connected ? "default" : "outline"}>
                      {provider.name}
                    </Badge>
                  ))}
                </div>
                <div className="space-y-2">
                  {automations.map((automation) => (
                    <div key={automation.id} className="flex items-center justify-between text-sm">
                      <span>{automation.name}</span>
                      <Badge variant={automation.enabled ? "default" : "outline"}>
                        {automation.enabled ? "Active" : "Off"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Creations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {creations.map((project) => (
                <div key={project.id} className="space-y-2">
                  <div className="relative flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
                    <Badge className="absolute top-2 right-2">{statusLabel[project.status]}</Badge>
                    <FolderGit2 className="size-6 text-primary/60" />
                  </div>
                  <p className="text-sm font-medium">{project.name}</p>
                  <div className="flex flex-wrap gap-1">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
