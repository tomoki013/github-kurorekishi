# GitHub黒歴史 — Claude向け開発ガイド

## パッケージマネージャー

**pnpm のみ使用すること。** npm や yarn は使わない。

## よく使うコマンド

```bash
pnpm install              # 依存関係インストール
pnpm run dev              # Vite フロントエンド（ポート5173）
pnpm run worker:dev       # Wrangler Worker（ポート8787）
pnpm run build            # 型チェック + フロントエンドビルド
pnpm run deploy           # ビルド + Cloudflare Workers へデプロイ
```

## README.md の更新（必須ルール）

**以下のいずれかを変更したときは、必ず README.md も同じコミットで更新すること:**

- API エンドポイントの追加・削除・変更
- レート制限の数値変更
- 環境変数の追加・削除
- GitHub API の認証方式変更（認証なし / OAuthアプリ認証 / トークン認証）
- アクセストークンの扱い方変更
- セッション設計の変更（Cookie名・有効期限・署名方式）
- 分類ロジックの変更（`src/lib/scoring/` 配下）
- 取得するデータ項目の変更
- 画像シェア機能の変更
- 技術スタックの変更
- ライセンス表記の変更

README と実装が乖離すると、セキュリティポリシーとして公開している内容が嘘になるため特に注意。

## プロジェクト構成

```
src/                    # フロントエンド（Vite + React）
  components/           # 共通コンポーネント
  hooks/                # カスタムフック
  lib/scoring/          # スコア計算（純粋関数）
  pages/                # ページコンポーネント
  types/                # 型定義

worker/src/             # Cloudflare Workers バックエンド（Hono）
  index.ts              # ルーティング・レート制限・ミドルウェア
  auth.ts               # GitHub OAuth フロー
  repos.ts              # リポジトリ取得・スコアリング呼び出し
  session.ts            # HMAC-SHA256 署名 Cookie
```

## セキュリティ上の注意

- GitHub API へのリクエストには `client_id:client_secret` Basic 認証を使用（ユーザートークン不使用）
- アクセストークンはコールバック処理中のみメモリ上に存在し、使用後即失効させる
- セッション Cookie は `__Host-` プレフィックス付き（HttpOnly・Secure・SameSite=Lax）
- フロントエンドにトークンや秘密情報を渡さない
- リポジトリオブジェクトから必要フィールドのみ明示的に抽出する（スプレッドしない）
