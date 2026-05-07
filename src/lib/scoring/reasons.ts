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
      reasons.push(
        `作成日と最終push日がほぼ同じ（差: ${active}日）`
      );
      reasons.push(`最終pushから ${staleDays} 日が経過（遺影化）`);
      break;
    case "供養済み":
      reasons.push("archiveされている（供養済み）");
      break;
    case "一日坊主型黒歴史":
      reasons.push(
        `作成日と最終push日がほぼ同じ（差: ${active}日）`
      );
      break;
    case "黒歴史級化石":
    case "古代遺跡":
    case "休眠中":
      reasons.push(`最終pushから ${staleDays} 日が経過`);
      break;
    case "現役っぽい":
      if (staleDays < 30) {
        reasons.push(`最近アクティブ（最終push: ${staleDays}日前）`);
      }
      break;
  }

  // Additional reasons based on scores and metadata
  if (repo.archived && classification !== "供養済み") {
    reasons.push("archiveされている");
  }

  if (repo.fork) {
    reasons.push("forkリポジトリ");
  }

  if (repo.stargazersCount === 0) {
    reasons.push("starsが0個");
  } else if (repo.stargazersCount >= 10) {
    reasons.push(`starsが${repo.stargazersCount}個（活発なプロジェクト）`);
  }

  if (!repo.description || repo.description.trim() === "") {
    reasons.push("descriptionがない");
  }

  if (scores.nameShame > 0) {
    reasons.push(`repo名が一時的な命名: ${repo.name}`);
  }

  if (repo.openIssuesCount > 0 && staleDays >= 365) {
    reasons.push(`open issueが ${repo.openIssuesCount} 件残っている`);
  }

  if (repo.language) {
    reasons.push(`言語: ${repo.language}`);
  }

  return reasons;
}
