import type { ScoredRepo } from "../../src/lib/scoring/types";
import type { ScoringRepoInput } from "../../src/lib/scoring/types";
import { scoreAllRepos } from "../../src/lib/scoring/index";

export class RateLimitError extends Error {
  constructor() {
    super("GitHub API rate limit exceeded");
    this.name = "RateLimitError";
  }
}

async function fetchReposPage(
  login: string,
  page: number,
  clientId: string,
  clientSecret: string
): Promise<{ repos: ScoringRepoInput[]; rateLimitRemaining: string | null }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const url = `https://api.github.com/users/${encodeURIComponent(login)}/repos?type=public&per_page=100&page=${page}`;
    // Use OAuth App credentials (client_id:client_secret) for 5000 req/hour instead of 60 req/hour
    const credentials = btoa(`${clientId}:${clientSecret}`);
    const res = await fetch(url, {
      headers: {
        "User-Agent": "GitHubKurorekishi/1.0",
        Accept: "application/vnd.github+json",
        Authorization: `Basic ${credentials}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.status === 403 || res.status === 429) {
      throw new RateLimitError();
    }

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status}`);
    }

    const rateLimitRemaining = res.headers.get("X-RateLimit-Remaining");
    if (rateLimitRemaining === "0") {
      throw new RateLimitError();
    }

    const raw = (await res.json()) as Array<Record<string, unknown>>;

    // Explicitly extract ONLY the allowed fields — never spread the full repo object
    const repos: ScoringRepoInput[] = raw.map((repo) => ({
      name: String(repo.name ?? ""),
      description: repo.description ? String(repo.description) : null,
      htmlUrl: String(repo.html_url ?? ""),
      createdAt: String(repo.created_at ?? ""),
      pushedAt: repo.pushed_at ? String(repo.pushed_at) : null,
      updatedAt: String(repo.updated_at ?? ""),
      archived: Boolean(repo.archived),
      fork: Boolean(repo.fork),
      language: repo.language ? String(repo.language) : null,
      stargazersCount: Number(repo.stargazers_count ?? 0),
      openIssuesCount: Number(repo.open_issues_count ?? 0),
    }));

    return { repos, rateLimitRemaining };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export async function getAndScoreRepos(
  login: string,
  clientId: string,
  clientSecret: string
): Promise<ScoredRepo[]> {
  const { repos: page1, rateLimitRemaining } = await fetchReposPage(login, 1, clientId, clientSecret);

  let allRepos = page1;

  // If page 1 returned 100 items, fetch page 2 (max 2 pages)
  if (page1.length === 100) {
    if (rateLimitRemaining === "0") {
      throw new RateLimitError();
    }
    try {
      const { repos: page2 } = await fetchReposPage(login, 2, clientId, clientSecret);
      allRepos = [...page1, ...page2];
    } catch (err) {
      if (err instanceof RateLimitError) throw err;
      // If page 2 fails for other reasons, continue with page 1 only
    }
  }

  const scored = scoreAllRepos(allRepos);

  // Sort: "Initial commitの遺影" and "供養済み" first, then by total score descending
  scored.sort((a, b) => {
    const aPriority =
      a.classification === "Initial commitの遺影" ||
      a.classification === "供養済み"
        ? 1
        : 0;
    const bPriority =
      b.classification === "Initial commitの遺影" ||
      b.classification === "供養済み"
        ? 1
        : 0;
    if (aPriority !== bPriority) return bPriority - aPriority;
    return b.scores.total - a.scores.total;
  });

  return scored;
}
