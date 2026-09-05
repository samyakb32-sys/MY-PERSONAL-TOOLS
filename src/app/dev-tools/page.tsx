"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Topbar } from "@/components/topbar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/settings";
import { fetchGithubRepos, fetchGithubUser, type GithubRepo, type GithubUser } from "@/lib/github";

function ConnectPrompt() {
  return (
    <Button size="sm" variant="outline" asChild>
      <Link href="/settings">Connect in Settings</Link>
    </Button>
  );
}

function ServiceShell({
  name,
  loading,
  error,
  children,
}: {
  name: string;
  loading: boolean;
  error: string | null;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{name}</CardTitle>
        <Badge variant={error ? "destructive" : "default"}>
          {error ? "Error" : "Connected"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading && <CardDescription>Loading...</CardDescription>}
        {error && <CardDescription className="text-destructive">{error}</CardDescription>}
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
    <ServiceShell name="GitHub" loading={loading} error={error}>
      {user && (
        <CardDescription>
          {user.login} — {user.public_repos} public repos
        </CardDescription>
      )}
      {repos.length > 0 && (
        <ul className="space-y-1.5 text-sm">
          {repos.map((repo) => (
            <li key={repo.id} className="flex items-center justify-between gap-2">
              <a href={repo.html_url} target="_blank" rel="noreferrer" className="truncate underline">
                {repo.name}
              </a>
              <span className="shrink-0 text-xs text-muted-foreground">
                {repo.open_issues_count} open issues
              </span>
            </li>
          ))}
        </ul>
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
    <ServiceShell name="Vercel" loading={loading} error={error}>
      {data && (
        <>
          <CardDescription>{data.user.username}</CardDescription>
          <ul className="space-y-1.5 text-sm">
            {data.projects.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2">
                <span className="truncate">{p.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {p.latestState ?? "no deploys"}
                </span>
              </li>
            ))}
          </ul>
        </>
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
    <ServiceShell name="Supabase" loading={loading} error={error}>
      {data && (
        <ul className="space-y-1.5 text-sm">
          {data.projects.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2">
              <span className="truncate">{p.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {p.region} · {p.status}
              </span>
            </li>
          ))}
        </ul>
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
      <Topbar title="Dev Tools" />
      <main className="flex-1 space-y-6 p-6">
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
