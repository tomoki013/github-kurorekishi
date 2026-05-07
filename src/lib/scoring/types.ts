export type ScoringRepoInput = {
  name: string;
  description: string | null;
  htmlUrl: string;
  createdAt: string;
  pushedAt: string | null;
  updatedAt: string;
  archived: boolean;
  fork: boolean;
  language: string | null;
  stargazersCount: number;
  openIssuesCount: number;
};

export type RepoScores = {
  stale: number;
  oneDay: number;
  nameShame: number;
  memorial: number;
  initialCommitPortrait: number;
  total: number;
};

export type RepoClassification =
  | "現役っぽい"
  | "休眠中"
  | "古代遺跡"
  | "黒歴史級化石"
  | "一日坊主型黒歴史"
  | "Initial commitの遺影"
  | "供養済み";

export type ScoredRepo = {
  repo: ScoringRepoInput;
  scores: RepoScores;
  classification: RepoClassification;
  reasons: string[];
};
