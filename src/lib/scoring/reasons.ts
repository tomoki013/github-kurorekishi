import type {
  ScoringRepoInput,
  RepoScores,
  RepoClassification,
} from "./types";
import { activeDays, daysSince } from "./utils";

export function generateReasons(
  repo: ScoringRepoInput,
  scores: RepoScores,
  classification: RepoClassification
): string[] {
  const reasons: string[] = [];

  const staleDays = Math.floor(daysSince(repo.pushedAt ?? repo.updatedAt));
  const active = Math.floor(activeDays(repo.createdAt, repo.pushedAt));

  // Classification-specific reason
  switch (classification) {
    case "Initial commitの遺影":
      reasons.push(`Created and last pushed almost at the same time (gap: ${active} day${active === 1 ? "" : "s"})`);
      reasons.push(`Last pushed ${staleDays} day${staleDays === 1 ? "" : "s"} ago (ghost commit)`);
      break;
    case "供養済み":
      reasons.push("Archived (laid to rest)");
      break;
    case "一日坊主型黒歴史":
      reasons.push(`Created and last pushed almost at the same time (gap: ${active} day${active === 1 ? "" : "s"})`);
      break;
    case "黒歴史級化石":
    case "古代遺跡":
    case "休眠中":
      reasons.push(`Last pushed ${staleDays} day${staleDays === 1 ? "" : "s"} ago`);
      break;
    case "現役っぽい":
      if (staleDays < 30) {
        reasons.push(`Recently active (last pushed ${staleDays} day${staleDays === 1 ? "" : "s"} ago)`);
      }
      break;
  }

  // Additional reasons based on scores and metadata
  if (repo.archived && classification !== "供養済み") {
    reasons.push("Archived");
  }

  if (repo.fork) {
    reasons.push("Forked repository");
  }

  if (repo.stargazersCount === 0) {
    reasons.push("0 stars");
  } else if (repo.stargazersCount >= 10) {
    reasons.push(`${repo.stargazersCount} stars (active project)`);
  }

  if (!repo.description || repo.description.trim() === "") {
    reasons.push("No description");
  }

  if (scores.nameShame > 0) {
    reasons.push(`Temporary-looking name: ${repo.name}`);
  }

  if (repo.openIssuesCount > 0 && staleDays >= 365) {
    reasons.push(`${repo.openIssuesCount} open issue${repo.openIssuesCount === 1 ? "" : "s"} remaining`);
  }

  if (repo.language) {
    reasons.push(`Language: ${repo.language}`);
  }

  return reasons;
}
