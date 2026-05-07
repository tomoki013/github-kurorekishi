import type { ScoringRepoInput } from "./types";
import { SCORING_RULES } from "./rules";
import { activeDays, daysSince } from "./utils";

/**
 * Detects repos that were created, had a single commit push (or no further pushes),
 * and then were abandoned for over a year. Uses metadata only — no commit API calls.
 */
export function calcInitialCommitPortraitScore(
  repo: ScoringRepoInput
): number {
  const rules = SCORING_RULES.initialCommitPortrait;

  const active = activeDays(repo.createdAt, repo.pushedAt);
  const sincePush = repo.pushedAt
    ? daysSince(repo.pushedAt)
    : daysSince(repo.createdAt);

  const meetsActiveDays = active <= rules.maxActiveDays;
  const meetsStaleness = sincePush >= rules.minDaysSincePush;
  const notArchived = !repo.archived;
  const notFork = !repo.fork;

  if (meetsActiveDays && meetsStaleness && notArchived && notFork) {
    return rules.score;
  }

  return 0;
}
