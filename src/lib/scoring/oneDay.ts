import type { ScoringRepoInput } from "./types";
import { SCORING_RULES } from "./rules";
import { activeDays } from "./utils";

const TEMP_NAME_KEYWORDS = [
  "test", "tmp", "temp", "demo", "sample", "practice",
  "untitled", "new-app", "my-app", "hoge", "foo", "bar",
] as const;

export function calcOneDayScore(repo: ScoringRepoInput): number {
  const active = activeDays(repo.createdAt, repo.pushedAt);
  const rules = SCORING_RULES.oneDay;

  let score = 0;

  if (active <= 1) {
    score += rules.activeDays1;
  } else if (active <= 3) {
    score += rules.activeDays3;
  } else if (active <= 7) {
    score += rules.activeDays7;
  }

  // No description bonus
  if (!repo.description || repo.description.trim() === "") {
    score += rules.noDescriptionBonus;
  }

  // Zero stars bonus
  if (repo.stargazersCount === 0) {
    score += rules.zeroStarBonus;
  }

  // Temporary name bonus
  const lowerName = repo.name.toLowerCase();
  const hasTemporaryName = TEMP_NAME_KEYWORDS.some(
    (kw) => lowerName === kw || lowerName.includes(kw)
  );
  if (hasTemporaryName) {
    score += rules.temporaryNameBonus;
  }

  // Penalties
  if (repo.archived) {
    score += rules.archivedPenalty;
  }
  if (repo.fork) {
    score += rules.forkPenalty;
  }

  return Math.min(100, Math.max(0, score));
}
