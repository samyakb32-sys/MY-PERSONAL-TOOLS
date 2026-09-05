export type GithubRepo = {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  private: boolean;
  updated_at: string;
  open_issues_count: number;
};

export type GithubUser = {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  public_repos: number;
};

async function githubFetch<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (!res.ok) {
    throw new Error(`GitHub API error ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

export function fetchGithubUser(token: string) {
  return githubFetch<GithubUser>("/user", token);
}

export function fetchGithubRepos(token: string) {
  return githubFetch<GithubRepo[]>(
    "/user/repos?sort=updated&per_page=5",
    token,
  );
}
