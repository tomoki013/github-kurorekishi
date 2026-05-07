import type { ScoredRepo, RepoClassification } from "../lib/scoring/types";

export type MeResponse = {
  id: string;
  login: string;
  avatarUrl: string;
};

export type ReposResponse = ScoredRepo[];

export type ClassificationSummary = Record<RepoClassification, number>;

export { type ScoredRepo, type RepoClassification };
