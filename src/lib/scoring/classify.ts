import type { RepoScores, RepoClassification } from "./types";

export function classifyRepo(scores: RepoScores): RepoClassification {
  if (scores.memorial >= 70) return "供養済み";
  if (scores.initialCommitPortrait >= 100) return "Initial commitの遺影";
  if (scores.oneDay >= 75 && scores.nameShame >= 50) return "一日坊主型黒歴史";
  if (scores.stale >= 80) return "黒歴史級化石";
  if (scores.stale >= 60) return "古代遺跡";
  if (scores.stale >= 40) return "休眠中";
  return "現役っぽい";
}
