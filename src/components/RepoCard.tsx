import type { ScoredRepo, RepoClassification } from "../lib/scoring/types";

type ClassificationStyle = {
  bg: string;
  text: string;
  border: string;
};

const CLASSIFICATION_STYLES: Record<RepoClassification, ClassificationStyle> =
  {
    現役っぽい: {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-300",
    },
    休眠中: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      border: "border-yellow-300",
    },
    古代遺跡: {
      bg: "bg-orange-100",
      text: "text-orange-800",
      border: "border-orange-300",
    },
    黒歴史級化石: {
      bg: "bg-red-100",
      text: "text-red-800",
      border: "border-red-300",
    },
    一日坊主型黒歴史: {
      bg: "bg-pink-100",
      text: "text-pink-800",
      border: "border-pink-300",
    },
    "Initial commitの遺影": {
      bg: "bg-purple-100",
      text: "text-purple-800",
      border: "border-purple-300",
    },
    供養済み: {
      bg: "bg-gray-100",
      text: "text-gray-600",
      border: "border-gray-300",
    },
  };

type Props = {
  scoredRepo: ScoredRepo;
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function RepoCard({ scoredRepo }: Props) {
  const { repo, scores, classification, reasons } = scoredRepo;
  const style = CLASSIFICATION_STYLES[classification];

  const lastPushed = repo.pushedAt ?? repo.updatedAt;

  return (
    <div
      className={`rounded-lg border ${style.border} bg-white shadow-sm p-4 space-y-3`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {/* Repo name as plain text — no link, no dangerouslySetInnerHTML */}
          <h3 className="font-mono font-semibold text-gray-800 truncate text-sm">
            {repo.name}
          </h3>
          {repo.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
              {repo.description}
            </p>
          )}
        </div>
        <span
          className={`flex-shrink-0 text-xs font-bold px-2 py-1 rounded-full ${style.bg} ${style.text}`}
        >
          {classification}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span>最終push: {formatDate(lastPushed)}</span>
        {repo.language && <span>{repo.language}</span>}
        {repo.stargazersCount > 0 && (
          <span>★ {repo.stargazersCount}</span>
        )}
        {repo.archived && (
          <span className="text-gray-400 font-medium">archived</span>
        )}
        {repo.fork && <span className="text-gray-400">fork</span>}
      </div>

      <div className="flex gap-2 flex-wrap text-xs">
        <span className="text-gray-400">スコア:</span>
        <span className="text-red-600">放置: {scores.stale}</span>
        <span className="text-pink-600">一日坊主: {scores.oneDay}</span>
        <span className="text-orange-600">命名恥: {scores.nameShame}</span>
        {scores.memorial > 0 && (
          <span className="text-gray-600">供養: {scores.memorial}</span>
        )}
        {scores.initialCommitPortrait > 0 && (
          <span className="text-purple-600">
            遺影: {scores.initialCommitPortrait}
          </span>
        )}
      </div>

      {reasons.length > 0 && (
        <ul className="text-xs text-gray-600 space-y-0.5 border-t border-gray-100 pt-2">
          {reasons.map((reason, i) => (
            // reason is a plain string from our scoring logic — safe to render as text
            <li key={i} className="flex gap-1">
              <span className="text-gray-400 flex-shrink-0">•</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
