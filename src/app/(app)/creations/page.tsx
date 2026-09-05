import { Topbar } from "@/components/topbar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { creations, statusLabel } from "@/data/creations";

const statusVariant = {
  live: "default",
  "in-progress": "secondary",
  archived: "outline",
} as const;

export default function CreationsPage() {
  return (
    <>
      <Topbar section="Dashboard" page="My Creations" />
      <main className="flex-1 space-y-6 p-6">
        <div className="flex justify-end">
          <Button>Add project</Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {creations.map((project) => (
            <Card key={project.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <CardTitle>{project.name}</CardTitle>
                <Badge variant={statusVariant[project.status]}>
                  {statusLabel[project.status]}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <CardDescription>{project.description}</CardDescription>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                {project.repoUrl && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={project.repoUrl}>Repo</a>
                  </Button>
                )}
                {project.liveUrl && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={project.liveUrl}>Live</a>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
