import { useState, useRef, useCallback } from "react";
import type { ScoredRepo } from "../types/api";

export type ExcavationStatus =
  | "idle"
  | "step1" // ログイン確認
  | "step2" // リポジトリ取得
  | "step3" // スコア計算
  | "step4" // 結果準備
  | "done"
  | "error";

export function useExcavation(): {
  excavate: () => void;
  cancel: () => void;
  repos: ScoredRepo[];
  status: ExcavationStatus;
  error: string | null;
} {
  const [repos, setRepos] = useState<ScoredRepo[]>([]);
  const [status, setStatus] = useState<ExcavationStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const isRunningRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    isRunningRef.current = false;
    setStatus("idle");
  }, []);

  const excavate = useCallback(() => {
    // Prevent double-click / double invocation
    if (isRunningRef.current) return;
    isRunningRef.current = true;

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setError(null);
    setRepos([]);

    async function run() {
      try {
        // Step 1: Confirm auth status
        setStatus("step1");
        await new Promise<void>((resolve) => setTimeout(resolve, 400));

        if (controller.signal.aborted) return;

        // Step 2: Fetch repo metadata
        setStatus("step2");

        const res = await fetch("/api/repos", {
          signal: controller.signal,
        });

        if (!res.ok) {
          if (res.status === 429) {
            throw new Error(
              "GitHub APIのレート制限に達しました。しばらく待ってから再試行してください。"
            );
          }
          if (res.status === 401) {
            throw new Error("認証が必要です。GitHubでログインしてください。");
          }
          const body = (await res.json().catch(() => ({
            error: "unknown",
          }))) as { error?: string };
          throw new Error(body.error ?? "サーバーエラーが発生しました。");
        }

        // Step 3: Scoring (server-side, simulate progress)
        setStatus("step3");
        await new Promise<void>((resolve) => setTimeout(resolve, 600));

        if (controller.signal.aborted) return;

        // Parse the response — worker returns ScoredRepo[] directly
        const data = (await res.json()) as ScoredRepo[];

        // Step 4: Prepare result card
        setStatus("step4");
        await new Promise<void>((resolve) => setTimeout(resolve, 400));

        if (controller.signal.aborted) return;

        setRepos(data);
        setStatus("done");
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          setStatus("idle");
          return;
        }
        const message =
          err instanceof Error
            ? err.message
            : "予期しないエラーが発生しました。";
        setError(message);
        setStatus("error");
      } finally {
        isRunningRef.current = false;
      }
    }

    run();
  }, []);

  return { excavate, cancel, repos, status, error };
}
