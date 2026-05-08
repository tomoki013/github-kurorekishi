import type { ExcavationStatus } from "../hooks/useExcavation";
import { useLanguage } from "../i18n";

type Step = {
  status: ExcavationStatus;
  labelKey: "step1" | "step2" | "step3" | "step4";
};

const STEPS: Step[] = [
  { labelKey: "step1", status: "step1" },
  { labelKey: "step2", status: "step2" },
  { labelKey: "step3", status: "step3" },
  { labelKey: "step4", status: "step4" },
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
  const { t } = useLanguage();
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
                {t.steps[step.labelKey]}
              </span>
            </li>
          );
        })}
      </ol>

      <p className="mt-4 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded p-3">
        {t.steps.metadataNote}
      </p>
    </div>
  );
}
