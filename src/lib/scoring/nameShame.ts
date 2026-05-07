import type { ScoringRepoInput } from "./types";
import { SCORING_RULES } from "./rules";

export function calcNameShameScore(repo: ScoringRepoInput): number {
  const lowerName = repo.name.toLowerCase();
  const keywords = SCORING_RULES.nameShameKeywords;

  let matchCount = 0;
  for (const kw of keywords) {
    // Check as substring or exact word boundary match
    if (lowerName === kw || lowerName.includes(kw)) {
      matchCount++;
    }
  }

  if (matchCount === 0) return 0;

  // Scale: 1 match = 50, 2+ matches = 80, 3+ = 100
  if (matchCount >= 3) return 100;
  if (matchCount >= 2) return 80;
  return 50;
}
