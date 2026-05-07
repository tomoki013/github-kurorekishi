import { useRef } from "react";
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

async function downloadPng(element: HTMLElement): Promise<void> {
  const dataUrl = await toPng(element, {
    cacheBust: true,
    backgroundColor: "#ffffff",
    pixelRatio: 2,
  });

  const link = document.createElement("a");
  link.download = "github-kurorekishi-result.png";
  link.href = dataUrl;
  link.click();
}

export function ShareCard({ login, avatarUrl, repos }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
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

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      await downloadPng(cardRef.current);
    } catch (err) {
      console.error("PNG generation failed:", err);
      alert("PNG生成に失敗しました。");
    }
  };

  return (
    <div className="space-y-3">
      {/* The visual card for PNG export */}
      <div
        ref={cardRef}
        className="bg-white border-2 border-gray-200 rounded-xl p-6 max-w-md mx-auto shadow-lg"
        style={{ fontFamily: "system-ui, sans-serif" }}
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

        <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400 text-center">
          GitHub黒歴史 — private repo・email・source codeは取得していません
        </div>
      </div>

      {/* Action button */}
      <div className="flex justify-center">
        <button
          onClick={handleDownload}
          className="px-5 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
        >
          PNG保存
        </button>
      </div>
    </div>
  );
}
