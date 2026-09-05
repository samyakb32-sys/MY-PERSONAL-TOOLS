"use client";

import { Topbar } from "@/components/topbar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AiChat } from "@/components/ai-chat";
import { useSettings } from "@/lib/settings";
import { automations } from "@/data/ai-providers";

export default function AiHubPage() {
  const { loaded } = useSettings();

  if (!loaded) return null;

  return (
    <>
      <Topbar section="AI Hub" page="Model Workspace" />
      <main className="flex-1 p-6">
        <Tabs defaultValue="chat">
          <TabsList>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="automations">Automations</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-4">
            <AiChat />
          </TabsContent>

          <TabsContent value="automations" className="mt-4 space-y-3">
            {automations.map((automation) => (
              <Card key={automation.id}>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{automation.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {automation.description}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Last run: {automation.lastRun ?? "never"}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={automation.enabled ? "default" : "outline"}
                  >
                    {automation.enabled ? "Enabled" : "Enable"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
