import { useEffect, useState } from "react";
import type { MeResponse } from "../types/api";
import { useExcavation } from "../hooks/useExcavation";
import { StepProgress } from "../components/StepProgress";
import { RepoCard } from "../components/RepoCard";
import { ShareCard } from "../components/ShareCard";
import { Footer } from "../components/Footer";
import type { RepoClassification } from "../lib/scoring/types";
import { useLanguage } from "../i18n";

type Props = {
  user: MeResponse;
  onLogout: () => void;
};

// State-based: ordered worst → best
const STATE_CLASSIFICATIONS: RepoClassification[] = [
  "黒歴史級化石",
  "古代遺跡",
  "休眠中",
  "現役っぽい",
];

// Special single-characteristic types
const SPECIAL_CLASSIFICATIONS: RepoClassification[] = [
  "Initial commitの遺影",
  "一日坊主型黒歴史",
  "供養済み",
];

const ALL_CLASSIFICATIONS = [...STATE_CLASSIFICATIONS, ...SPECIAL_CLASSIFICATIONS];

const CLASSIFICATION_EMOJI: Record<RepoClassification, string> = {
  現役っぽい: "💚",
  休眠中: "😴",
  古代遺跡: "🏛️",
  黒歴史級化石: "💀",
  一日坊主型黒歴史: "🌱",
  "Initial commitの遺影": "🪦",
  供養済み: "🕯️",
};

const CLASSIFICATION_COLOR: Record<RepoClassification, string> = {
  現役っぽい: "bg-green-50 border-green-200 text-green-800",
  休眠中: "bg-yellow-50 border-yellow-200 text-yellow-800",
  古代遺跡: "bg-orange-50 border-orange-200 text-orange-800",
  黒歴史級化石: "bg-red-50 border-red-200 text-red-800",
  一日坊主型黒歴史: "bg-pink-50 border-pink-200 text-pink-800",
  "Initial commitの遺影": "bg-purple-50 border-purple-200 text-purple-800",
  供養済み: "bg-gray-50 border-gray-200 text-gray-600",
};

function ClassificationBadge({
  cls,
  count,
}: {
  cls: RepoClassification;
  count: number;
}) {
  const { t } = useLanguage();
  return (
    <div
      className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm ${CLASSIFICATION_COLOR[cls]}`}
    >
      <span>
        {CLASSIFICATION_EMOJI[cls]} {t.classifications[cls]}
      </span>
      <span className="font-bold ml-2">{count}</span>
    </div>
  );
}

function GroupLabel({ label }: { label: string }) {
  return (
    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider col-span-full mt-1 first:mt-0">
      {label}
    </p>
  );
}

export function ResultPage({ user, onLogout }: Props) {
  const { excavate, repos, status, error } = useExcavation();
  const [legendOpen, setLegendOpen] = useState(false);
  const { t, toggle } = useLanguage();

  const isLoading =
    status === "step1" ||
    status === "step2" ||
    status === "step3" ||
    status === "step4";

  useEffect(() => {
    excavate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const classificationCounts =
    repos.length > 0
      ? ALL_CLASSIFICATIONS.reduce(
          (acc, cls) => {
            const count = repos.filter((r) => r.classification === cls).length;
            if (count > 0) acc[cls] = count;
            return acc;
          },
          {} as Partial<Record<RepoClassification, number>>
        )
      : null;

  const stateRepos = repos.filter((r) =>
    STATE_CLASSIFICATIONS.includes(r.classification)
  );
  const specialRepos = repos.filter((r) =>
    SPECIAL_CLASSIFICATIONS.includes(r.classification)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2 mr-auto">
            <span className="text-xl">⛏️</span>
            <span className="font-black text-gray-800">{t.result.header}</span>
          </div>
          <img
            src={user.avatarUrl}
            alt=""
            className="w-7 h-7 rounded-full border border-gray-200"
          />
          <span className="text-sm text-gray-600 hidden sm:inline">
            @{user.login}
          </span>
          {status === "done" && (
            <button
              onClick={() => excavate()}
              className="text-sm px-3 py-1.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {t.result.reExcavate}
            </button>
          )}
          <button
            onClick={toggle}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors border border-gray-200 rounded px-2 py-1"
          >
            {t.langToggle}
          </button>
          <button
            onClick={onLogout}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            {t.result.logout}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto w-full px-4 py-8 space-y-6 flex-1">
        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4 pt-8">
            <h2 className="text-xl font-bold text-gray-700 text-center">
              {t.result.excavating}
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
              {t.result.retry}
            </button>
          </div>
        )}

        {/* Done state */}
        {status === "done" && repos.length >= 0 && (
          <>
            {/* Hero summary */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="text-center mb-5">
                <p className="text-gray-500 text-sm">
                  {t.result.publicRepos(user.login)}
                </p>
                <p className="text-5xl font-black text-gray-800 mt-1">
                  {repos.length}
                  <span className="text-2xl text-gray-400 font-normal ml-1">
                    {t.result.reposUnit}
                  </span>
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {t.result.excavationComplete}
                </p>
              </div>

              {classificationCounts && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* State group */}
                  <GroupLabel label={t.result.groupState} />
                  {STATE_CLASSIFICATIONS.map((cls) => {
                    const count = classificationCounts[cls];
                    if (!count) return null;
                    return <ClassificationBadge key={cls} cls={cls} count={count} />;
                  })}

                  {/* Special group — only render if any exist */}
                  {SPECIAL_CLASSIFICATIONS.some((cls) => classificationCounts[cls]) && (
                    <>
                      <GroupLabel label={t.result.groupSpecial} />
                      {SPECIAL_CLASSIFICATIONS.map((cls) => {
                        const count = classificationCounts[cls];
                        if (!count) return null;
                        return <ClassificationBadge key={cls} cls={cls} count={count} />;
                      })}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Classification legend */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setLegendOpen((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span>{t.result.legendHeading}</span>
                <span className="text-gray-400 text-xs">
                  {legendOpen ? t.result.legendClose : t.result.legendOpen}
                </span>
              </button>
              {legendOpen && (
                <div className="border-t border-gray-100">
                  {/* State group */}
                  <div className="px-5 pt-3 pb-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {t.result.groupState}
                    </p>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {STATE_CLASSIFICATIONS.map((cls) => (
                      <div key={cls} className="flex items-start gap-3 px-5 py-3">
                        <span
                          className={`flex-shrink-0 text-xs font-bold px-2 py-1 rounded-full border ${CLASSIFICATION_COLOR[cls]}`}
                        >
                          {CLASSIFICATION_EMOJI[cls]} {t.classifications[cls]}
                        </span>
                        <span className="text-xs text-gray-500 pt-1">
                          {t.classificationDescs[cls]}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Special group */}
                  <div className="border-t border-gray-200 px-5 pt-3 pb-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {t.result.groupSpecial}
                    </p>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {SPECIAL_CLASSIFICATIONS.map((cls) => (
                      <div key={cls} className="flex items-start gap-3 px-5 py-3">
                        <span
                          className={`flex-shrink-0 text-xs font-bold px-2 py-1 rounded-full border ${CLASSIFICATION_COLOR[cls]}`}
                        >
                          {CLASSIFICATION_EMOJI[cls]} {t.classifications[cls]}
                        </span>
                        <span className="text-xs text-gray-500 pt-1">
                          {t.classificationDescs[cls]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Share card */}
            <ShareCard
              login={user.login}
              avatarUrl={user.avatarUrl}
              repos={repos}
            />

            {/* Repo list — state repos first, then special */}
            {repos.length > 0 && (
              <div className="space-y-4">
                <h2 className="font-bold text-gray-600 text-sm uppercase tracking-wide">
                  {t.result.allReposHeading}
                </h2>

                {stateRepos.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {t.result.groupState}
                    </p>
                    {stateRepos.map((scoredRepo) => (
                      <RepoCard
                        key={scoredRepo.repo.name}
                        scoredRepo={scoredRepo}
                      />
                    ))}
                  </div>
                )}

                {specialRepos.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {t.result.groupSpecial}
                    </p>
                    {specialRepos.map((scoredRepo) => (
                      <RepoCard
                        key={scoredRepo.repo.name}
                        scoredRepo={scoredRepo}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
