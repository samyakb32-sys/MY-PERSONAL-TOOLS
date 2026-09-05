import { Topbar } from "@/components/topbar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { aiProviders, automations } from "@/data/ai-providers";

export default function AiHubPage() {
  return (
    <>
      <Topbar title="AI Hub" />
      <main className="flex-1 p-6">
        <Tabs defaultValue="chat">
          <TabsList>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="automations">Automations</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              {aiProviders.map((provider) => (
                <Badge
                  key={provider.id}
                  variant={provider.connected ? "default" : "outline"}
                >
                  {provider.name} — {provider.connected ? "connected" : "not connected"}
                </Badge>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Chat</CardTitle>
                <CardDescription>
                  Connect a provider API key to start chatting.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-64 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                  No API key connected yet.
                </div>
              </CardContent>
            </Card>
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
