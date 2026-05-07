import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import type { ScoredRepo, RepoClassification } from "../lib/scoring/types";

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

function countByClassification(
  repos: ScoredRepo[]
): Partial<Record<RepoClassification, number>> {
  const counts: Partial<Record<RepoClassification, number>> = {};
  for (const r of repos) {
    counts[r.classification] = (counts[r.classification] ?? 0) + 1;
  }
  return counts;
}

async function generatePngDataUrl(element: HTMLElement): Promise<string> {
  return toPng(element, {
    cacheBust: true,
    backgroundColor: "#ffffff",
    pixelRatio: 2,
  });
}

function downloadPngFromDataUrl(dataUrl: string): void {
  const link = document.createElement("a");
  link.download = "github-kurorekishi-result.png";
  link.href = dataUrl;
  link.click();
}

function canNativeShare(): boolean {
  if (!navigator.canShare) return false;
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
  const counts = countByClassification(repos);

  const classifications: RepoClassification[] = [
    "Initial commitの遺影",
    "黒歴史級化石",
    "一日坊主型黒歴史",
    "供養済み",
    "古代遺跡",
    "休眠中",
    "現役っぽい",
  ];

  const siteUrl = window.location.origin;

  const isMobileShare = canNativeShare();

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await generatePngDataUrl(cardRef.current);
      downloadPngFromDataUrl(dataUrl);
    } catch {
      alert("PNG生成に失敗しました。");
    }
  };

  const handleXShare = async () => {
    if (!cardRef.current) return;
    setLoading(true);
    try {
      const dataUrl = await generatePngDataUrl(cardRef.current);

      if (isMobileShare) {
        // Mobile: use native share sheet (photos/X/LINE etc.)
        const blob = await fetch(dataUrl).then((r) => r.blob());
        const file = new File([blob], "github-kurorekishi-result.png", { type: "image/png" });
        await navigator.share({
          files: [file],
          text: `GitHubの黒歴史を発掘しました ⛏️ @${login} #GitHub黒歴史\n${siteUrl}`,
        });
      } else {
        // Desktop: Safari fix — window.open must be called synchronously before any await.
        // So we await PNG first, then open X (desktop popups aren't blocked the same way).
        downloadPngFromDataUrl(dataUrl);
        const text = encodeURIComponent(
          `GitHubの黒歴史を発掘しました ⛏️ @${login} #GitHub黒歴史`
        );
        window.open(
          `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(siteUrl)}`,
          "_blank",
          "noopener,noreferrer"
        );
      }
    } catch (err) {
      // navigator.share throws AbortError if user cancels — not an error
      if (err instanceof Error && err.name !== "AbortError") {
        alert("PNG生成に失敗しました。");
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
              <p className="text-xs text-gray-500">発掘報告書</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xl font-black text-gray-700">⛏️ GitHub黒歴史</p>
            </div>
          </div>

          <div className="text-sm text-gray-600 mb-3">
            <span className="font-bold text-gray-800">{repos.length}</span>{" "}
            件のリポジトリを発掘
          </div>

          <div className="space-y-1.5">
            {classifications.map((cls) => {
              const count = counts[cls];
              if (!count) return null;
              return (
                <div key={cls} className="flex items-center justify-between">
                  <span className="text-sm">
                    {CLASSIFICATION_EMOJI[cls]} {cls}
                  </span>
                  <span className="text-sm font-bold text-gray-700">
                    {count}件
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              private repo・email・source codeは取得していません
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={handleDownload}
          className="px-5 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
        >
          PNG保存
        </button>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-1.5"
        >
          <span className="font-bold text-base leading-none">𝕏</span>
          <span>でシェア</span>
        </button>
      </div>

      {/* X share modal */}
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
              <h2 className="font-black text-gray-800 text-lg">Xでシェア</h2>
            </div>
            {isMobileShare ? (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600 space-y-2">
                <p>① PNGが生成されます</p>
                <p>② シェアシートが開きます</p>
                <p>③ XやLINEなどお好きなアプリでシェアできます</p>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600 space-y-2">
                <p>① PNGが自動でダウンロードされます</p>
                <p>② Xの投稿画面が開きます</p>
                <p>③ ダウンロードしたPNGを投稿に添付してシェアしてください</p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40"
              >
                キャンセル
              </button>
              <button
                onClick={handleXShare}
                disabled={loading}
                className="flex-1 py-2.5 bg-black text-white text-sm rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <span>保存中...</span>
                ) : (
                  <>
                    <span className="font-bold">𝕏</span>
                    <span>を開く</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
