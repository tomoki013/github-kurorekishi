import type { ExcavationStatus } from "../hooks/useExcavation";

type Step = {
  label: string;
  status: ExcavationStatus;
};

const STEPS: Step[] = [
  { label: "GitHubログイン状態を確認しています", status: "step1" },
  {
    label: "公開リポジトリのメタデータだけを取得しています",
    status: "step2",
  },
  { label: "放置スコア・黒歴史スコアを計算しています", status: "step3" },
  { label: "結果カードを準備しています", status: "step4" },
];

const STATUS_ORDER: ExcavationStatus[] = [
  "idle",
  "step1",
  "step2",
  "step3",
  "step4",
  "done",
  "error",
];

function getStepIndex(status: ExcavationStatus): number {
  return STATUS_ORDER.indexOf(status);
}

type Props = {
  status: ExcavationStatus;
};

export function StepProgress({ status }: Props) {
  const currentIdx = getStepIndex(status);

  return (
    <div className="w-full max-w-lg mx-auto">
      <ol className="space-y-3">
        {STEPS.map((step, i) => {
          const stepIdx = i + 1; // step1 = idx 1
          const isActive = STATUS_ORDER[currentIdx] === step.status;
          const isDone = currentIdx > stepIdx;

          return (
            <li key={step.status} className="flex items-center gap-3">
              <span
                className={`
                  flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold
                  ${isDone ? "bg-green-500 text-white" : ""}
                  ${isActive ? "bg-yellow-400 text-gray-900 animate-pulse" : ""}
                  ${!isDone && !isActive ? "bg-gray-200 text-gray-400" : ""}
                `}
              >
                {isDone ? "✓" : i + 1}
              </span>
              <span
                className={`text-sm ${
                  isActive
                    ? "text-yellow-600 font-semibold"
                    : isDone
                    ? "text-green-700"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>

      <p className="mt-4 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded p-3">
        取得しているのは公開repoのメタデータのみです。README本文・source
        code・private repo・emailは取得していません。
      </p>
    </div>
  );
}
