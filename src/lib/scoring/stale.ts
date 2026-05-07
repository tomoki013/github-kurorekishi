import type { ScoringRepoInput } from "./types";
import { SCORING_RULES } from "./rules";
import { daysSince } from "./utils";

export function calcStaleScore(repo: ScoringRepoInput): number {
  const staleDays = daysSince(repo.pushedAt ?? repo.updatedAt);
  const rules = SCORING_RULES.stale;

  let score = 0;

  if (staleDays >= 1000) {
    score += rules.days1000;
  } else if (staleDays >= 730) {
    score += rules.days730;
  } else if (staleDays >= 365) {
    score += rules.days365;
  } else if (staleDays >= 180) {
    score += rules.days180;
  } else if (staleDays >= 90) {
    score += rules.days90;
  }

  // Bonus: open issues and stale >= 365
  if (repo.openIssuesCount > 0 && staleDays >= 365) {
    score += rules.oldOpenIssuesBonus;
  }

  // Bonus: not archived and stale >= 365
  if (!repo.archived && staleDays >= 365) {
    score += rules.notArchivedOldBonus;
  }

  // Penalties
  if (repo.archived) {
    score += rules.archivedPenalty;
  }
  if (repo.fork) {
    score += rules.forkPenalty;
  }
  if (repo.stargazersCount >= 10) {
    score += rules.popularPenalty;
  }

  return Math.min(100, Math.max(0, score));
}
