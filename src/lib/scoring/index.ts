import type { ScoringRepoInput, RepoScores, ScoredRepo } from "./types";
import { calcStaleScore } from "./stale";
import { calcOneDayScore } from "./oneDay";
import { calcNameShameScore } from "./nameShame";
import { calcMemorialScore } from "./memorial";
import { calcInitialCommitPortraitScore } from "./initialCommitPortrait";
import { classifyRepo } from "./classify";
import { generateReasons } from "./reasons";

export function scoreRepo(repo: ScoringRepoInput): ScoredRepo {
  const stale = calcStaleScore(repo);
  const oneDay = calcOneDayScore(repo);
  const nameShame = calcNameShameScore(repo);
  const memorial = calcMemorialScore(repo);
  const initialCommitPortrait = calcInitialCommitPortraitScore(repo);

  const total = Math.round(
    (stale + oneDay + nameShame + memorial + initialCommitPortrait) / 5
  );

  const scores: RepoScores = {
    stale,
    oneDay,
    nameShame,
    memorial,
    initialCommitPortrait,
    total,
  };

  const classification = classifyRepo(scores);
  const reasons = generateReasons(repo, scores, classification);

  return {
    repo,
    scores,
    classification,
    reasons,
  };
}

export function scoreAllRepos(repos: ScoringRepoInput[]): ScoredRepo[] {
  return repos.map(scoreRepo);
}

// Re-export types
export type {
  ScoringRepoInput,
  ScoredRepo,
  RepoScores,
  RepoClassification,
} from "./types";
