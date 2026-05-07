import { useEffect } from "react";
import type { MeResponse } from "../types/api";
import { useExcavation } from "../hooks/useExcavation";
import { StepProgress } from "../components/StepProgress";
import { RepoCard } from "../components/RepoCard";
import { ShareCard } from "../components/ShareCard";
import type { RepoClassification } from "../lib/scoring/types";

type Props = {
  user: MeResponse;
  onLogout: () => void;
};

const CLASSIFICATION_ORDER: RepoClassification[] = [
  "Initial commitの遺影",
  "黒歴史級化石",
  "一日坊主型黒歴史",
  "供養済み",
  "古代遺跡",
  "休眠中",
  "現役っぽい",
];

const CLASSIFICATION_EMOJI: Record<RepoClassification, string> = {
  現役っぽい: "💚",
  休眠中: "😴",
  古代遺跡: "🏛️",
  黒歴史級化石: "💀",
  一日坊主型黒歴史: "🌱",
  "Initial commitの遺影": "🪦",
  供養済み: "🕯️",
};

export function ResultPage({ user, onLogout }: Props) {
  const { excavate, repos, status, error } = useExcavation();

  const isLoading =
    status === "step1" ||
    status === "step2" ||
    status === "step3" ||
    status === "step4";

  // Auto-start excavation on mount
  useEffect(() => {
    excavate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const classificationCounts =
    repos.length > 0
      ? CLASSIFICATION_ORDER.reduce(
          (acc, cls) => {
            const count = repos.filter((r) => r.classification === cls).length;
            if (count > 0) acc[cls] = count;
            return acc;
          },
          {} as Partial<Record<RepoClassification, number>>
        )
      : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⛏️</span>
            <span className="font-black text-gray-800">GitHub黒歴史</span>
          </div>
          <div className="flex items-center gap-3">
            <img
              src={user.avatarUrl}
              alt=""
              className="w-7 h-7 rounded-full border border-gray-200"
            />
            <span className="text-sm text-gray-600">@{user.login}</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-700 text-center">
              発掘中... ⛏️
            </h2>
            <StepProgress status={status} />
          </div>
        )}

        {/* Error state */}
        {status === "error" && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center space-y-3">
            <p className="text-red-700 font-semibold">{error}</p>
            <button
              onClick={() => excavate()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
            >
              再試行
            </button>
          </div>
        )}

        {/* Done state */}
        {status === "done" && repos.length >= 0 && (
          <>
            <div className="text-center space-y-1">
              <h1 className="text-3xl font-black text-gray-800">発掘完了 🎉</h1>
              <p className="text-gray-500">
                ようこそ、
                <span className="font-bold text-gray-700">@{user.login}</span>
              </p>
              <p className="text-lg font-semibold text-gray-700">
                調査した公開リポジトリ:{" "}
                <span className="text-2xl font-black">{repos.length}</span> 件
              </p>
            </div>

            {/* Classification summary */}
            {classificationCounts && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-2">
                <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">
                  発掘サマリー
                </h2>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {CLASSIFICATION_ORDER.map((cls) => {
                    const count = classificationCounts[cls];
                    if (!count) return null;
                    return (
                      <div
                        key={cls}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span>{CLASSIFICATION_EMOJI[cls]}</span>
                        <span className="text-gray-700">{cls}</span>
                        <span className="ml-auto font-bold text-gray-800">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Share card */}
            <ShareCard
              login={user.login}
              avatarUrl={user.avatarUrl}
              repos={repos}
            />

            {/* Repo cards */}
            {repos.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-bold text-gray-700">全リポジトリ一覧</h2>
                {repos.map((scoredRepo) => (
                  <RepoCard
                    key={scoredRepo.repo.name}
                    scoredRepo={scoredRepo}
                  />
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 justify-center pb-8">
              <button
                onClick={() => excavate()}
                className="px-5 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 font-semibold text-sm"
              >
                もう一度発掘する
              </button>
              <button
                onClick={onLogout}
                className="px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-sm"
              >
                ログアウト
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
