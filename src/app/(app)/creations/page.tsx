"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { Topbar } from "@/components/topbar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { fetchCreations, addCreation, deleteCreation, type Creation, type CreationStatus } from "@/lib/creations";
import { creations as staticCreations, statusLabel } from "@/data/creations";

const statusVariant: Record<CreationStatus, "default" | "secondary" | "outline"> = {
  live: "default",
  "in-progress": "secondary",
  archived: "outline",
};

function emptyForm() {
  return { name: "", description: "", tags: "", status: "in-progress" as CreationStatus, repoUrl: "", liveUrl: "" };
}

export default function CreationsPage() {
  const { user, configured, loading: authLoading } = useAuth();
  const [creations, setCreations] = useState<Creation[]>(() =>
    configured
      ? []
      : staticCreations.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          tags: c.tags,
          status: c.status,
          repoUrl: c.repoUrl ?? null,
          liveUrl: c.liveUrl ?? null,
        })),
  );
  const [loading, setLoading] = useState(configured);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!configured || !user) return;
    let cancelled = false;
    fetchCreations(user.id)
      .then((data) => {
        if (!cancelled) setCreations(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [configured, user]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !form.name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const created = await addCreation(user.id, {
        name: form.name.trim(),
        description: form.description.trim(),
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        status: form.status,
        repoUrl: form.repoUrl.trim(),
        liveUrl: form.liveUrl.trim(),
      });
      setCreations((prev) => [created, ...prev]);
      setForm(emptyForm());
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setCreations((prev) => prev.filter((c) => c.id !== id));
    try {
      await deleteCreation(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  if (authLoading || loading) return null;

  return (
    <>
      <Topbar section="Dashboard" page="My Creations" />
      <main className="flex-1 space-y-6 p-6">
        <div className="flex justify-end">
          {configured ? (
            <Button onClick={() => setShowForm((v) => !v)}>
              {showForm ? "Cancel" : "Add project"}
            </Button>
          ) : (
            <Button disabled title="Sign in to add projects">
              Add project
            </Button>
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {showForm && (
          <Card>
            <CardContent>
              <form onSubmit={handleAdd} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={form.tags}
                    onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                    placeholder="Next.js, Tailwind"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="repoUrl">Repo URL</Label>
                  <Input
                    id="repoUrl"
                    value={form.repoUrl}
                    onChange={(e) => setForm((f) => ({ ...f, repoUrl: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="liveUrl">Live URL</Label>
                  <Input
                    id="liveUrl"
                    value={form.liveUrl}
                    onChange={(e) => setForm((f) => ({ ...f, liveUrl: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as CreationStatus }))}
                    className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs"
                  >
                    <option value="in-progress">In progress</option>
                    <option value="live">Live</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" disabled={saving || !form.name.trim()}>
                    {saving ? "Saving..." : "Save project"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {creations.map((project) => (
            <Card key={project.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <CardTitle>{project.name}</CardTitle>
                <div className="flex items-center gap-1.5">
                  <Badge variant={statusVariant[project.status]}>
                    {statusLabel[project.status]}
                  </Badge>
                  {configured && (
                    <button
                      onClick={() => handleDelete(project.id)}
                      aria-label="Delete project"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
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
