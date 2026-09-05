import { Topbar } from "@/components/topbar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { devServices } from "@/data/dev-tools";

export default function DevToolsPage() {
  const connectedCount = devServices.filter((s) => s.connected).length;

  return (
    <>
      <Topbar title="Dev Tools" />
      <main className="flex-1 space-y-6 p-6">
        <Card>
          <CardContent className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {connectedCount} of {devServices.length} services connected
            </p>
            <Badge variant={connectedCount === devServices.length ? "default" : "secondary"}>
              {connectedCount === devServices.length ? "All healthy" : "Action needed"}
            </Badge>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {devServices.map((service) => (
            <Card key={service.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{service.name}</CardTitle>
                <Badge variant={service.connected ? "default" : "outline"}>
                  {service.connected ? "Connected" : "Not connected"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <CardDescription>{service.summary}</CardDescription>
                <Button size="sm" variant="outline">
                  {service.connected ? "Manage" : "Connect"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
