import { Link } from "react-router-dom";

export function SecurityPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-black text-gray-800 hover:text-gray-600"
          >
            <span>⛏️</span>
            <span>GitHub黒歴史</span>
          </Link>
          <span className="text-sm text-gray-500">
            セキュリティ・プライバシーポリシー
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900">
            セキュリティ・プライバシーポリシー
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            GitHub黒歴史 のセキュリティ設計とプライバシーに関する説明です。
          </p>
        </div>

        {/* What we access */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">
            取得する情報
          </h2>
          <p className="text-sm text-gray-600">
            GitHubから取得するのは以下の情報のみです：
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
            <h3 className="text-sm font-bold text-green-800">
              ユーザー情報（GitHub OAuth経由）
            </h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• ユーザーID（数値）</li>
              <li>• ログイン名（username）</li>
              <li>• アバター画像URL</li>
            </ul>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
            <h3 className="text-sm font-bold text-green-800">
              公開リポジトリのメタデータ（認証なし・公開API）
            </h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• リポジトリ名、説明文、URL</li>
              <li>• 作成日時、最終push日時、更新日時</li>
              <li>• archived フラグ、fork フラグ</li>
              <li>• 使用言語、star数、open issue数</li>
            </ul>
          </div>
        </section>

        {/* What we never access */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">
            絶対に取得しない情報
          </h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <ul className="text-sm text-red-700 space-y-1">
              <li>• private リポジトリ</li>
              <li>• メールアドレス</li>
              <li>• ソースコード・READMEの本文</li>
              <li>• コミット・issue・PRの本文</li>
              <li>• 所属Organization</li>
              <li>• フォロワー・フォロー中のユーザー</li>
              <li>• スターしたリポジトリ</li>
            </ul>
          </div>
        </section>

        {/* OAuth scope */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">
            GitHub OAuth スコープ
          </h2>
          <p className="text-sm text-gray-600">
            GitHubの認可画面で表示される「要求されている権限」は
            <strong>なし（空）</strong>
            です。
            <code className="bg-gray-100 px-1 rounded text-xs">scope=</code>{" "}
            で空文字列を指定しており、いかなる権限も要求しません。
          </p>
          <p className="text-sm text-gray-600">
            認可画面でscopeが空でないことが確認された場合は、直ちにアクセスを拒否してください。
          </p>
        </section>

        {/* Token handling */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">
            アクセストークンの扱い
          </h2>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex gap-2">
              <span className="text-green-500 flex-shrink-0 font-bold">✓</span>
              <span>
                アクセストークンはOAuthコールバック処理中にメモリ上で一時的に使用するのみです
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-500 flex-shrink-0 font-bold">✓</span>
              <span>
                ユーザー情報取得後、即座にGitHub APIでトークンを失効させます
                （<code className="bg-gray-100 px-1 rounded text-xs">
                  DELETE /applications/{"{client_id}"}/token
                </code>
                ）
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-500 flex-shrink-0 font-bold">✓</span>
              <span>アクセストークンはクライアントに送信しません</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-500 flex-shrink-0 font-bold">✓</span>
              <span>アクセストークンはデータベースやKVに保存しません</span>
            </li>
          </ul>
        </section>

        {/* Session design */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">
            セッションの設計
          </h2>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex gap-2">
              <span className="text-blue-500 flex-shrink-0">•</span>
              <span>
                セッションCookieはHMAC-SHA256で署名された
                <code className="bg-gray-100 px-1 rounded text-xs">
                  base64url(JSON).署名
                </code>
                形式です
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500 flex-shrink-0">•</span>
              <span>
                Cookie名は
                <code className="bg-gray-100 px-1 rounded text-xs">
                  __Host-session
                </code>
                （HttpOnly, Secure, SameSite=Lax, Path=/）
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500 flex-shrink-0">•</span>
              <span>セッションの有効期限は1時間です</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500 flex-shrink-0">•</span>
              <span>
                セッションに含まれる情報はユーザーID・ログイン名・アバターURLのみです
              </span>
            </li>
          </ul>
        </section>

        {/* PKCE */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">
            PKCEとOAuthセキュリティ
          </h2>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex gap-2">
              <span className="text-blue-500 flex-shrink-0">•</span>
              <span>
                PKCE（Proof Key for Code Exchange）を実装しています
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500 flex-shrink-0">•</span>
              <span>
                OAuthのstateパラメータはHMAC-SHA256で署名されたCookieと
                タイミングセーフな比較（XORベース）で検証します
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500 flex-shrink-0">•</span>
              <span>
                リポジトリデータの取得はトークン失効後に公開APIで行います（認証なし）
              </span>
            </li>
          </ul>
        </section>

        {/* No storage */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">
            データの保存・共有
          </h2>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex gap-2">
              <span className="text-green-500 flex-shrink-0 font-bold">✓</span>
              <span>データベースなし — 診断結果は一切保存しません</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-500 flex-shrink-0 font-bold">✓</span>
              <span>KV（Key-Value Store）なし</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-500 flex-shrink-0 font-bold">✓</span>
              <span>共有URLなし — 結果URLはありません</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-500 flex-shrink-0 font-bold">✓</span>
              <span>外部アナリティクスなし — Google Analytics等は使用しません</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-500 flex-shrink-0 font-bold">✓</span>
              <span>AIなし — コンテンツは外部AIサービスに送信しません</span>
            </li>
          </ul>
        </section>

        {/* Rate limiting */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">
            レート制限
          </h2>
          <p className="text-sm text-gray-600">
            GitHub APIの公開エンドポイントはレート制限があります（認証なし：60リクエスト/時間）。
            レート制限に達した場合は429エラーが返ります。
          </p>
          <p className="text-sm text-gray-600">
            アプリ側でも以下のレート制限を設けています（1分あたり）：
          </p>
          <ul className="text-sm text-gray-600 space-y-1 ml-4">
            <li>• 発掘（/api/repos）: ユーザーあたり5回</li>
            <li>• ログイン開始: IPあたり10回</li>
            <li>• コールバック: IPあたり10回</li>
          </ul>
        </section>

        {/* Source */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">
            ソースコード
          </h2>
          <p className="text-sm text-gray-600">
            GitHub黒歴史 はオープンソースです（MITライセンス）。
            このセキュリティポリシーの実装はソースコードで確認できます。
          </p>
          <a
            href="https://github.com/tomoki013/github-kurorekishi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            tomoki013/github-kurorekishi
          </a>
        </section>

        <div className="text-center pb-8">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            トップページに戻る
          </Link>
        </div>
      </main>
    </div>
  );
}
