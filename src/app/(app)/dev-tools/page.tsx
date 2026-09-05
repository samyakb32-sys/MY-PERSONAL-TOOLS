"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Check, Database, Cloud, Server, Network } from "lucide-react";

import { Topbar } from "@/components/topbar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/settings";
import { fetchGithubRepos, fetchGithubUser, type GithubRepo, type GithubUser } from "@/lib/github";

const healthCategories = [
  { label: "Database", icon: Database },
  { label: "APIs", icon: Cloud },
  { label: "Infrastructure", icon: Server },
  { label: "Network", icon: Network },
];

function ConnectPrompt() {
  return (
    <Button size="sm" variant="outline" asChild>
      <Link href="/settings">Connect in Settings</Link>
    </Button>
  );
}

function RecentEvents({ items }: { items: string[] }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">Recent Events</p>
      <ul className="space-y-1 text-sm">
        {items.map((item, i) => (
          <li key={i} className="truncate text-muted-foreground before:mr-2 before:content-['•']">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ServiceShell({
  name,
  status,
  summary,
  loading,
  error,
  children,
}: {
  name: string;
  status: string;
  summary?: string;
  loading: boolean;
  error: string | null;
  children?: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{name}</CardTitle>
        <Badge variant={error ? "destructive" : "default"}>{error ? "Error" : status}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading && <CardDescription>Loading...</CardDescription>}
        {error && <CardDescription className="text-destructive">{error}</CardDescription>}
        {!loading && !error && summary && <CardDescription>{summary}</CardDescription>}
        {!loading && !error && children}
      </CardContent>
    </Card>
  );
}

function GithubCard({ token }: { token: string }) {
  const [user, setUser] = useState<GithubUser | null>(null);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchGithubUser(token), fetchGithubRepos(token)])
      .then(([u, r]) => {
        if (cancelled) return;
        setUser(u);
        setRepos(r);
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
  }, [token]);

  return (
    <ServiceShell
      name="GitHub"
      status="Connected"
      summary={user ? `${user.login} — ${user.public_repos} public repos` : undefined}
      loading={loading}
      error={error}
    >
      {repos.length > 0 && (
        <RecentEvents
          items={repos.map((r) => `Updated ${r.name} · ${r.open_issues_count} open issues`)}
        />
      )}
    </ServiceShell>
  );
}

type VercelData = {
  user: { username: string };
  projects: { id: string; name: string; latestUrl: string | null; latestState: string | null }[];
};

function VercelCard({ token }: { token: string }) {
  const [data, setData] = useState<VercelData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/vercel", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? `Error ${res.status}`);
        if (!cancelled) setData(json);
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
  }, [token]);

  return (
    <ServiceShell
      name="Vercel"
      status="Healthy"
      summary={data ? data.user.username : undefined}
      loading={loading}
      error={error}
    >
      {data && data.projects.length > 0 && (
        <RecentEvents
          items={data.projects.map((p) => `${p.name} · ${p.latestState ?? "no deploys"}`)}
        />
      )}
    </ServiceShell>
  );
}

type SupabaseData = {
  projects: { id: string; name: string; region: string; status: string }[];
};

function SupabaseCard({ token }: { token: string }) {
  const [data, setData] = useState<SupabaseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/supabase", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? `Error ${res.status}`);
        if (!cancelled) setData(json);
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
  }, [token]);

  return (
    <ServiceShell name="Supabase" status="Healthy" loading={loading} error={error}>
      {data && data.projects.length > 0 && (
        <RecentEvents items={data.projects.map((p) => `${p.name} · ${p.region} · ${p.status}`)} />
      )}
    </ServiceShell>
  );
}

function NotConnectedCard({ name, summary }: { name: string; summary: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{name}</CardTitle>
        <Badge variant="outline">Not connected</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <CardDescription>{summary}</CardDescription>
        <ConnectPrompt />
      </CardContent>
    </Card>
  );
}

export default function DevToolsPage() {
  const { settings, loaded } = useSettings();

  if (!loaded) return null;

  const connectedCount = [
    settings.githubToken,
    settings.vercelToken,
    settings.supabaseAccessToken,
    settings.firebaseProjectId,
  ].filter(Boolean).length;

  return (
    <>
      <Topbar section="Dev Tools" page="Services Status" />
      <main className="flex-1 space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Overall health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {healthCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <div
                    key={cat.label}
                    className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center"
                  >
                    <Icon className="size-5 text-muted-foreground" />
                    <span className="text-sm font-medium">{cat.label}</span>
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Check className="size-3" />
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {connectedCount} of 4 services connected
            </p>
            <Badge variant={connectedCount === 4 ? "default" : "secondary"}>
              {connectedCount === 4 ? "All healthy" : "Action needed"}
            </Badge>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {settings.githubToken ? (
            <GithubCard token={settings.githubToken} />
          ) : (
            <NotConnectedCard
              name="GitHub"
              summary="Add a personal access token to see your repos and activity."
            />
          )}

          {settings.vercelToken ? (
            <VercelCard token={settings.vercelToken} />
          ) : (
            <NotConnectedCard
              name="Vercel"
              summary="Add an access token to see your projects and deployments."
            />
          )}

          {settings.supabaseAccessToken ? (
            <SupabaseCard token={settings.supabaseAccessToken} />
          ) : (
            <NotConnectedCard
              name="Supabase"
              summary="Add a personal access token to see your projects."
            />
          )}

          <NotConnectedCard
            name="Firebase"
            summary={
              settings.firebaseProjectId
                ? `Project "${settings.firebaseProjectId}" saved. Live stats need a service account and aren't fetched yet.`
                : "Add your project ID for reference."
            }
          />
        </div>
      </main>
    </>
  );
}
