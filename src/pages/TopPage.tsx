import { Link } from "react-router-dom";

export function TopPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-gray-100 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full space-y-8 text-center">
        {/* Hero */}
        <div className="space-y-3">
          <div className="text-5xl">⛏️</div>
          <h1 className="text-4xl font-black tracking-tight text-white">
            GitHub黒歴史
          </h1>

          <p className="text-gray-300 text-base leading-relaxed">
            あなたのGitHubに眠る公開リポジトリを発掘します。
            <br />
            黒歴史を発掘し、放置スコアを算定します。
          </p>
        </div>

        {/* Privacy notice */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 text-left space-y-2">
          <h2 className="text-sm font-bold text-green-400 uppercase tracking-wide">
            プライバシーについて
          </h2>
          <ul className="text-sm text-gray-300 space-y-1.5">
            <li className="flex gap-2">
              <span className="text-green-400 flex-shrink-0">✓</span>
              <span>
                GitHub OAuthの<strong>scopeを要求しません</strong>（権限：なし）
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-400 flex-shrink-0">✓</span>
              <span>
                private repository・email・source code・README本文は取得しません
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-400 flex-shrink-0">✓</span>
              <span>診断結果は保存しません（データベースなし）</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-400 flex-shrink-0">✓</span>
              <span>GitHubのアクセストークンは使用後すぐに破棄します</span>
            </li>
          </ul>
        </div>

        {/* Important instruction */}
        <div className="bg-yellow-900/40 border border-yellow-700/60 rounded-xl p-4 text-sm text-yellow-200">
          <span className="font-bold">確認してください：</span>{" "}
          GitHubの認可画面で「要求されている権限：なし」であることを確認してください。
        </div>

        {/* CTA Button */}
        <a
          href="/api/auth/github/start"
          className="block w-full py-4 px-6 bg-white text-gray-900 font-bold text-lg rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
        >
          GitHubで発掘する ⛏️
        </a>

        {/* Footer link */}
        <div className="text-sm">
          <Link
            to="/security"
            className="text-gray-500 hover:text-gray-300 underline transition-colors"
          >
            セキュリティ・プライバシーポリシー
          </Link>
        </div>
      </div>
    </div>
  );
}
