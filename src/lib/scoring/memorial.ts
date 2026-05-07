import type { ScoringRepoInput } from "./types";

export function calcMemorialScore(repo: ScoringRepoInput): number {
  if (repo.archived === true) return 100;
  return 0;
}
