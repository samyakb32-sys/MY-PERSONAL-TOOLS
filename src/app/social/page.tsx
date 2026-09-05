import { Camera, Briefcase } from "lucide-react";

import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { socialMessages, socialStats, type Platform } from "@/data/social";

const platformIcon: Record<Platform, typeof Camera> = {
  instagram: Camera,
  linkedin: Briefcase,
};

export default function SocialPage() {
  return (
    <>
      <Topbar section="Social" page="Unified Inbox" />
      <main className="flex-1 space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(Object.keys(socialStats) as Platform[]).map((platform) => {
            const Icon = platformIcon[platform];
            const stats = socialStats[platform];
            return (
              <Card key={platform}>
                <CardContent className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="size-5" />
                    <div>
                      <p className="font-medium capitalize">{platform}</p>
                      <p className="text-sm text-muted-foreground">
                        {stats.followers.toLocaleString()} followers
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{stats.unread} unread</Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="space-y-3">
          {socialMessages.map((message) => {
            const Icon = platformIcon[message.platform];
            return (
              <Card key={message.id}>
                <CardContent className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarFallback>{message.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{message.sender}</p>
                        <Icon className="size-3.5 text-muted-foreground" />
                        {message.unread && (
                          <span className="size-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {message.preview}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" variant="outline">
                      Summarize
                    </Button>
                    <Button size="sm" variant="outline">
                      Draft reply
                    </Button>
                    <Button size="sm">Reply</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </>
  );
}
