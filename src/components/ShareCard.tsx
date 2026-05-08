import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import type { ScoredRepo, RepoClassification } from "../lib/scoring/types";
import { useLanguage } from "../i18n";

type Props = {
  login: string;
  avatarUrl: string;
  repos: ScoredRepo[];
};

const CLASSIFICATION_EMOJI: Record<RepoClassification, string> = {
  現役っぽい: "💚",
  休眠中: "😴",
  古代遺跡: "🏛️",
  黒歴史級化石: "💀",
  一日坊主型黒歴史: "🌱",
  "Initial commitの遺影": "🪦",
  供養済み: "🕯️",
};

// State-based worst → best, then special types
const CLASSIFICATION_ORDER: RepoClassification[] = [
  "黒歴史級化石",
  "古代遺跡",
  "休眠中",
  "現役っぽい",
  "Initial commitの遺影",
  "一日坊主型黒歴史",
  "供養済み",
];

function countByClassification(
  repos: ScoredRepo[]
): Partial<Record<RepoClassification, number>> {
  const counts: Partial<Record<RepoClassification, number>> = {};
  for (const r of repos) {
    counts[r.classification] = (counts[r.classification] ?? 0) + 1;
  }
  return counts;
}

function canNativeShare(): boolean {
  // Only use native share sheet on touch devices (mobile/tablet).
  // Desktop share sheets don't reliably show X without the app installed.
  const isTouch = navigator.maxTouchPoints > 0 || "ontouchstart" in window;
  if (!isTouch || !navigator.canShare) return false;
  try {
    return navigator.canShare({ files: [new File([], "test.png", { type: "image/png" })] });
  } catch {
    return false;
  }
}

export function ShareCard({ login, avatarUrl, repos }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const counts = countByClassification(repos);

  const siteUrl = window.location.origin;
  const useNativeShare = canNativeShare();

  const handleShare = async () => {
    if (!cardRef.current) return;
    setLoading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      });

      if (useNativeShare) {
        const blob = await fetch(dataUrl).then((r) => r.blob());
        const file = new File([blob], "github-kurorekishi-result.png", { type: "image/png" });
        await navigator.share({
          files: [file],
          text: `${t.share.shareText(login)}\n${siteUrl}`,
        });
      } else {
        // Fallback: download PNG + open X
        // (window.open after await is fine on desktop — only mobile Safari blocks it)
        const link = document.createElement("a");
        link.download = "github-kurorekishi-result.png";
        link.href = dataUrl;
        link.click();
        const text = encodeURIComponent(t.share.shareText(login));
        window.open(
          `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(siteUrl)}`,
          "_blank",
          "noopener,noreferrer"
        );
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        alert(t.share.error);
      }
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Wrapper captures PNG — padding prevents shadow clipping */}
      <div
        ref={cardRef}
        style={{ padding: "20px", backgroundColor: "#ffffff", display: "inline-block", width: "100%" }}
      >
        <div
          className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg"
          style={{ fontFamily: "system-ui, sans-serif", maxWidth: "440px", margin: "0 auto" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <img
              src={avatarUrl}
              alt=""
              className="w-12 h-12 rounded-full border border-gray-200"
              crossOrigin="anonymous"
            />
            <div>
              <p className="font-bold text-gray-800">@{login}</p>
              <p className="text-xs text-gray-500">{t.share.reportTitle}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xl font-black text-gray-700">⛏️ GitHub黒歴史</p>
            </div>
          </div>

          <div className="text-sm text-gray-600 mb-3">
            {t.share.reposExcavated(repos.length)}
          </div>

          <div className="space-y-1.5">
            {CLASSIFICATION_ORDER.map((cls) => {
              const count = counts[cls];
              if (!count) return null;
              return (
                <div key={cls} className="flex items-center justify-between">
                  <span className="text-sm">
                    {CLASSIFICATION_EMOJI[cls]} {t.classifications[cls]}
                  </span>
                  <span className="text-sm font-bold text-gray-700">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">{t.share.privacyNotice}</p>
          </div>
        </div>
      </div>

      {/* Action button */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-900 transition-colors"
        >
          {t.share.title}
        </button>
      </div>

      {/* Share modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => !loading && setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-1">
              <p className="text-2xl">⛏️</p>
              <h2 className="font-black text-gray-800 text-lg">{t.share.title}</h2>
            </div>

            {useNativeShare ? (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600 space-y-2">
                {t.share.nativeShareSteps.map((step, i) => (
                  <p key={i}>{step}</p>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600 space-y-2">
                {t.share.desktopShareSteps.map((step, i) => (
                  <p key={i}>{step}</p>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40"
              >
                {t.share.cancel}
              </button>
              <button
                onClick={handleShare}
                disabled={loading}
                className="flex-1 py-2.5 bg-black text-white text-sm rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-40"
              >
                {loading ? t.share.generating : t.share.share}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
