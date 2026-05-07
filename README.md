# ⛏️ GitHub黒歴史

GitHubに眠る放置リポジトリを発掘するネタサイト。  
公開リポジトリのメタデータだけを使って、黒歴史・放置・一日坊主を判定します。

---

## このアプリがやること

1. GitHub OAuth でログイン（権限：なし）
2. 公開プロフィールの最小情報を取得（ユーザーID・ユーザー名・アバター画像のみ）
3. 公開リポジトリのメタデータを取得（非認証APIを使用、アクセストークン不要）
4. 放置スコア・黒歴史スコアを計算
5. 結果画像を**ブラウザ内で**生成（サーバーにはアップロードしない）

---

## 取得しないもの

- private リポジトリ
- メールアドレス
- ソースコード・ファイルの中身
- README の本文
- コミットの中身・履歴
- Issue の中身
- Pull Request の中身
- Organization 情報
- フォロワー・フォロー
- スター済みリポジトリ
- ブランチ一覧

---

## 保存するもの

**何もありません。**

- データベースなし
- KV（Cloudflare KV）なし
- 診断結果の保存なし
- サーバーへの画像保存なし
- 共有URLなし
- 外部アナリティクスなし（Google Analyticsなど）
- AIなし

---

## GitHub OAuth スコープ

**`scope=""` （空）** — 権限を一切要求しません。

GitHub の認可画面には **「このアプリケーションはパブリックな情報のみを読み取ります」** と表示されます。  
もし何らかの権限が表示された場合は、ログインを中止してください。

---

## アクセストークンの扱い

- OAuth コールバック時にユーザーのID・ユーザー名・アバターURLを取得するためだけに使用
- 取得後すぐに `DELETE https://api.github.com/applications/{client_id}/token` で**失効**させる
- ストレージ（DB・KV・ディスク）には**保存しない**
- クライアントには**返さない**

---

## セッション

- `__Host-session` という名前の短命 Cookie のみ（HttpOnly・Secure・SameSite=Lax）
- `__Host-` プレフィックスにより Secure・Path=/・Domain 属性なし が強制される
- `SESSION_SECRET` 環境変数を使って **HMAC-SHA256 で署名**
- **有効期限：1時間**
- 含む情報：ユーザーID・ユーザー名・アバターURL のみ

OAuth の state パラメータも署名済み Cookie（`__Host-oauth-state`・有効期限10分）で保護しています。

---

## 画像シェア

- 結果画像（PNG）は `html-to-image` を使って**ブラウザ内で生成**
- サーバーには**送信しない**
- 保存後、X（Twitter）に手動で添付してシェアできます

---

## ローカル開発

### 必要なもの

- [pnpm](https://pnpm.io/) v9+
- [Node.js](https://nodejs.org/) v18+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

### 1. 依存関係をインストール

```bash
pnpm install
```

### 2. GitHub OAuth App を作成

1. [GitHub Developer Settings](https://github.com/settings/developers) を開く
2. **「New OAuth App」** をクリック
3. 以下を入力:
   - **Application name**: `GitHub黒歴史 (dev)`
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:8787/api/auth/github/callback`
4. **「Register application」** をクリック
5. **Client ID** をコピーし、**Client Secret** を生成してコピー

### 3. `.dev.vars` を作成（gitignore 済み）

プロジェクトルートに `.dev.vars` ファイルを作成:

```
GITHUB_CLIENT_ID=ここにClient IDを貼る
GITHUB_CLIENT_SECRET=ここにClient Secretを貼る
SESSION_SECRET=32文字以上のランダムな文字列
GITHUB_REDIRECT_URI=http://localhost:8787/api/auth/github/callback
```

### 4. 開発サーバーを起動

**ターミナル1 — Vite フロントエンド（ポート5173）**:
```bash
pnpm run dev
```

**ターミナル2 — Wrangler Worker（ポート8787）**:
```bash
pnpm run worker:dev
```

ブラウザで `http://localhost:5173` を開く。

> Vite の dev server が `/api/*` リクエストを `http://localhost:8787` にプロキシします。

---

## 環境変数

| 変数名 | 説明 |
|---|---|
| `GITHUB_CLIENT_ID` | GitHub OAuth App の Client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App の Client Secret |
| `SESSION_SECRET` | HMAC-SHA256 署名用のランダムな秘密鍵（32文字以上） |
| `GITHUB_REDIRECT_URI` | OAuth コールバック URL（例：`https://{worker-name}.{subdomain}.workers.dev/api/auth/github/callback`） |

---

## Cloudflare Workers へのデプロイ

`wrangler.toml` の `name` フィールドがデプロイ先の Worker 名になります。デプロイ後の URL は `https://{name}.{subdomain}.workers.dev` です。

### 1. 本番用 GitHub OAuth App を作成

**Authorization callback URL** を本番の URL に設定:
```
https://{worker-name}.{subdomain}.workers.dev/api/auth/github/callback
```

### 2. シークレットを登録

```bash
pnpm wrangler secret put GITHUB_CLIENT_ID
pnpm wrangler secret put GITHUB_CLIENT_SECRET
pnpm wrangler secret put SESSION_SECRET
pnpm wrangler secret put GITHUB_REDIRECT_URI
```

### 3. デプロイ

```bash
pnpm run deploy
```

型チェック（`tsc --noEmit`）→ フロントエンドビルド（`vite build`）→ デプロイ（`wrangler deploy`）の順に実行されます。

### GitHub Actions による自動デプロイ

`main` ブランチに push すると自動でデプロイされます（`.github/workflows/deploy.yml`）。

リポジトリの **Settings → Secrets and variables → Actions** に以下を登録:

| Secret 名 | 説明 |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API トークン（Edit Cloudflare Workers テンプレートで作成） |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare アカウント ID |

---

## スコア計算の変更方法

`src/lib/scoring/rules.ts` を編集してスコアの閾値やキーワードを調整できます。

スコア計算は `src/lib/scoring/` 配下の純粋関数として実装されています:

| ファイル | 役割 |
|---|---|
| `rules.ts` | スコア定数・キーワード一覧 |
| `stale.ts` | 放置スコアの計算 |
| `oneDay.ts` | 一日坊主スコアの計算 |
| `nameShame.ts` | 仮置き名スコアの計算 |
| `memorial.ts` | 供養済み（archive）スコアの計算 |
| `initialCommitPortrait.ts` | Initial commitの遺影 判定 |
| `classify.ts` | スコアからカテゴリに分類 |
| `reasons.ts` | 判定理由の文字列生成 |

---

## 「Initial commitの遺影」の判定条件

コミットAPIは使用しません。**メタデータのみ**で推定判定します。

以下の条件をすべて満たす場合に判定:

1. `created_at` と `pushed_at` の差が **1日以内**
2. `pushed_at` から **365日以上** 経過している
3. `archived` が false
4. `fork` が false

---

## 分類一覧

| 分類 | 判定条件 |
|---|---|
| 🪦 Initial commitの遺影 | 作成直後に1回pushされ、1年以上放置（archive・forkを除く） |
| 💀 黒歴史級化石 | 放置スコア ≥ 80 |
| 🌱 一日坊主型黒歴史 | 一日坊主スコア ≥ 75 かつ 仮置き名スコア ≥ 50 |
| 🕯️ 供養済み | archive済み（供養スコア ≥ 70） |
| 🏛️ 古代遺跡 | 放置スコア 60〜79 |
| 😴 休眠中 | 放置スコア 40〜59 |
| 💚 現役っぽい | それ以外 |

---

## レート制限

**GitHub API（非認証）:** IPアドレスあたり60リクエスト/時間。

Cloudflare Workers の外部送信IPはユーザー間で共有されるため、実際の制限は60回/時間より少ない場合があります。429エラーが出た場合は数分待ってから再試行してください。

**アプリ内レート制限**（1分あたり）:

| エンドポイント | 制限 |
|---|---|
| `/api/repos`（発掘） | ユーザーあたり5回 |
| `/api/auth/github/start` | IPあたり10回 |
| `/api/auth/github/callback` | IPあたり10回 |
| `/api/me` | IPあたり60回 |
| `/api/logout` | IPあたり20回 |

---

## セキュリティポリシー

詳細は [/security](/security) ページを参照してください。

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | Vite + React 18 + TypeScript + Tailwind CSS |
| バックエンド | Cloudflare Workers + Hono |
| 認証 | GitHub OAuth 2.0 + PKCE |
| セッション | HMAC-SHA256 署名済み Cookie |
| 画像生成 | html-to-image（クライアントサイド） |
| パッケージマネージャー | pnpm |

---

## ライセンス

MIT License — Copyright (c) 2025 GitHub黒歴史 Contributors

詳細は [LICENSE](./LICENSE) を参照してください。
