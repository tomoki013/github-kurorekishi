import type { RepoClassification } from "../lib/scoring/types";

export type Language = "en" | "ja";

const en = {
  loading: "Loading...",
  langToggle: "日本語",

  top: {
    tagline1: "Excavate your public GitHub repos",
    tagline2: "and calculate their abandonment scores.",
    privacyHeading: "Privacy",
    privacyItems: [
      "Requests no GitHub OAuth scope (zero permissions)",
      "Never accesses private repos, email, source code, or README content",
      "Results are never stored (no database)",
      "GitHub access tokens are revoked immediately after use",
    ] as const,
    warningLabel: "Important:",
    warningText:
      'Verify that the GitHub authorization screen shows "Requested permissions: none".',
    cta: "Excavate with GitHub ⛏️",
    copyright: "© 2026 GitHub Graveyard Contributors — MIT License",
    securityLink: "Security & Privacy Policy",
    sourceLink: "Source Code",
  },

  result: {
    header: "GitHub Graveyard",
    excavating: "Excavating... ⛏️",
    publicRepos: (login: string) => `@${login}'s public repos`,
    reposUnit: "repos",
    excavationComplete: "Excavation complete 🎉",
    reExcavate: "Re-excavate",
    logout: "Log out",
    retry: "Retry",
    legendHeading: "Classification Criteria",
    legendClose: "▲ Close",
    legendOpen: "▼ Open",
    allReposHeading: "All Repositories",
    groupState: "Status",
    groupSpecial: "Special",
  },

  classifications: {
    "現役っぽい": "Seemingly Active",
    "休眠中": "Dormant",
    "古代遺跡": "Ancient Ruins",
    "黒歴史級化石": "Legendary Fossil",
    "一日坊主型黒歴史": "One-Day Wonder",
    "Initial commitの遺影": "Ghost Commit",
    "供養済み": "Laid to Rest",
  } as Record<RepoClassification, string>,

  classificationDescs: {
    "Initial commitの遺影": "Pushed once right after creation, abandoned for 1+ year",
    "黒歴史級化石": "Stale score ≥ 80",
    "一日坊主型黒歴史": "One-day score ≥ 75 AND name-shame score ≥ 50",
    "供養済み": "Archived (memorial score ≥ 70)",
    "古代遺跡": "Stale score 60–79",
    "休眠中": "Stale score 40–59",
    "現役っぽい": "Everything else",
  } as Record<RepoClassification, string>,

  share: {
    title: "Share",
    reportTitle: "Excavation Report",
    reposExcavated: (n: number) => `${n} repos excavated`,
    nativeShareSteps: [
      "① Result PNG will be generated",
      "② Share sheet will open",
      "③ Share with your favorite app",
    ] as const,
    desktopShareSteps: [
      "① PNG will be automatically downloaded",
      "② X's post screen will open",
      "③ Attach the PNG to your post and share",
    ] as const,
    cancel: "Cancel",
    share: "Share",
    generating: "Generating...",
    shareText: (login: string) =>
      `Excavated my GitHub graveyard ⛏️ @${login} #GitHubGraveyard`,
    privacyNotice: "No private repos, email, or source code accessed",
    error: "Failed to generate PNG.",
  },

  steps: {
    step1: "Verifying GitHub login status",
    step2: "Fetching public repository metadata only",
    step3: "Calculating stale & graveyard scores",
    step4: "Preparing result card",
    metadataNote:
      "Only public repo metadata is fetched. README content, source code, private repos, and email are never accessed.",
  },

  repoCard: {
    lastPushed: "Last push:",
    scores: "Scores:",
    stale: "Stale",
    oneDay: "One-Day",
    nameShame: "Name",
    memorial: "Memorial",
    ghost: "Ghost",
  },

  footer: {
    copyright: "© 2026 GitHub Graveyard Contributors — MIT License",
    securityLink: "Security & Privacy",
    githubLink: "GitHub",
  },

  security: {
    header: "GitHub Graveyard",
    headerSub: "Security & Privacy Policy",
    title: "Security & Privacy Policy",
    description:
      "An explanation of the security design and privacy practices of GitHub Graveyard.",

    whatWeAccess: "What We Access",
    whatWeAccessIntro: "We only access the following information from GitHub:",
    userInfoTitle: "User Info (via GitHub OAuth)",
    userInfoItems: [
      "User ID (numeric)",
      "Login name (username)",
      "Avatar image URL",
    ] as const,
    repoMetaTitle: "Public Repository Metadata (public API, app auth)",
    repoMetaItems: [
      "Repository name, description, URL",
      "Created at, last pushed at, updated at",
      "Archived flag, fork flag",
      "Language, star count, open issue count",
    ] as const,

    neverAccess: "What We Never Access",
    neverAccessItems: [
      "Private repositories",
      "Email address",
      "Source code or README content",
      "Commit, issue, or PR content",
      "Organization membership",
      "Followers or following",
      "Starred repositories",
    ] as const,

    oauthScope: "GitHub OAuth Scope",
    oauthScopeText1:
      'The "Requested permissions" on GitHub\'s authorization screen is',
    oauthScopeNone: "none (empty)",
    oauthScopeText2: ". We pass",
    oauthScopeText3: "and request no permissions whatsoever.",
    oauthScopeWarning:
      "If the scope shown is not empty, deny access immediately.",

    tokenHandling: "Access Token Handling",
    tokenHandlingItems: [
      "The access token is used only temporarily in memory during the OAuth callback",
      "After fetching user info, it is immediately revoked via the GitHub API",
      "The access token is never sent to the client",
      "The access token is never stored in a database or KV",
    ] as const,
    tokenNotePrefix:
      "Repositories are fetched without the user's access token. The server uses OAuth App",
    tokenNoteCode: "client_id:client_secret",
    tokenNoteSuffix:
      "for app authentication (rate limit mitigation). This identifies the app, not the user.",

    sessionDesign: "Session Design",
    sessionItem1Prefix: "Session cookies are HMAC-SHA256 signed in the format",
    sessionItem1Code: "base64url(JSON).signature",
    sessionItem1Suffix: "",
    sessionItem2Prefix: "Cookie name:",
    sessionItem2Code: "__Host-session",
    sessionItem2Suffix: "(HttpOnly, Secure, SameSite=Lax, Path=/)",
    sessionItem3: "Session expiry: 1 hour",
    sessionItem4: "Session contains only: user ID, login name, and avatar URL",

    pkce: "PKCE & OAuth Security",
    pkceItems: [
      "PKCE (Proof Key for Code Exchange) is implemented",
      "The OAuth state parameter is verified using an HMAC-SHA256 signed cookie with timing-safe comparison (XOR-based)",
      "Repository data is fetched via the public API after token revocation (unauthenticated)",
    ] as const,

    dataStorage: "Data Storage & Sharing",
    dataStorageItems: [
      "No database — results are never stored",
      "No KV (Key-Value Store)",
      "No shareable URLs — there are no result URLs",
      "No external analytics — no Google Analytics, etc.",
      "No AI — content is never sent to external AI services",
    ] as const,

    rateLimiting: "Rate Limiting",
    rateLimitingText1:
      "GitHub's public API endpoints have rate limits (unauthenticated: 60 req/hr). A 429 error is returned when the limit is reached.",
    rateLimitingText2:
      "The app also enforces the following rate limits (per minute):",
    rateLimitingItems: [
      "Excavation (/api/repos): 5 times per user",
      "Login initiation: 10 times per IP",
      "Callback: 10 times per IP",
    ] as const,

    sourceCode: "Source Code",
    sourceCodeText:
      "GitHub Graveyard is open source (MIT License). You can verify this security policy's implementation in the source code.",
    sourceCodeLink: "tomoki013/github-kurorekishi",

    backToTop: "Back to top",
  },

  errors: {
    rateLimit:
      "GitHub API rate limit reached. Please wait a moment and try again.",
    authRequired: "Authentication required. Please log in with GitHub.",
    serverError: "A server error occurred.",
    unexpected: "An unexpected error occurred.",
  },
} as const;

const ja = {
  loading: "読み込み中...",
  langToggle: "English",

  top: {
    tagline1: "あなたのGitHubに眠る公開リポジトリを発掘します。",
    tagline2: "黒歴史を発掘し、放置スコアを算定します。",
    privacyHeading: "プライバシーについて",
    privacyItems: [
      "GitHub OAuthのscopeを要求しません（権限：なし）",
      "private repository・email・source code・README本文は取得しません",
      "診断結果は保存しません（データベースなし）",
      "GitHubのアクセストークンは使用後すぐに破棄します",
    ] as const,
    warningLabel: "確認してください：",
    warningText:
      "GitHubの認可画面で「要求されている権限：なし」であることを確認してください。",
    cta: "GitHubで発掘する ⛏️",
    copyright: "© 2026 GitHub黒歴史 Contributors — MIT License",
    securityLink: "セキュリティ・プライバシーポリシー",
    sourceLink: "ソースコード",
  },

  result: {
    header: "GitHub黒歴史",
    excavating: "発掘中... ⛏️",
    publicRepos: (login: string) => `@${login} の公開リポジトリ`,
    reposUnit: "件",
    excavationComplete: "黒歴史発掘 🎉",
    reExcavate: "再発掘",
    logout: "ログアウト",
    retry: "再試行",
    legendHeading: "分類の基準",
    legendClose: "▲ 閉じる",
    legendOpen: "▼ 開く",
    allReposHeading: "全リポジトリ一覧",
    groupState: "状態",
    groupSpecial: "特殊",
  },

  classifications: {
    "現役っぽい": "現役っぽい",
    "休眠中": "休眠中",
    "古代遺跡": "古代遺跡",
    "黒歴史級化石": "黒歴史級化石",
    "一日坊主型黒歴史": "一日坊主型黒歴史",
    "Initial commitの遺影": "Initial commitの遺影",
    "供養済み": "供養済み",
  } as Record<RepoClassification, string>,

  classificationDescs: {
    "Initial commitの遺影": "作成直後に1回pushされ、1年以上放置",
    "黒歴史級化石": "放置スコア 80以上",
    "一日坊主型黒歴史": "一日坊主スコア 75以上 かつ 仮置き名スコア 50以上",
    "供養済み": "archive済み（供養スコア 70以上）",
    "古代遺跡": "放置スコア 60〜79",
    "休眠中": "放置スコア 40〜59",
    "現役っぽい": "それ以外",
  } as Record<RepoClassification, string>,

  share: {
    title: "シェア",
    reportTitle: "発掘報告書",
    reposExcavated: (n: number) => `${n}件のリポジトリを発掘`,
    nativeShareSteps: [
      "① 発掘結果のPNGが生成されます",
      "② シェアシートが開きます",
      "③ お好きなアプリでシェアしてください",
    ] as const,
    desktopShareSteps: [
      "① PNGが自動でダウンロードされます",
      "② Xの投稿画面が開きます",
      "③ PNGを投稿に添付してシェアしてください",
    ] as const,
    cancel: "キャンセル",
    share: "シェアする",
    generating: "生成中...",
    shareText: (login: string) =>
      `GitHubの黒歴史を発掘しました ⛏️ @${login} #GitHub黒歴史`,
    privacyNotice: "private repo・email・source codeは取得していません",
    error: "PNG生成に失敗しました。",
  },

  steps: {
    step1: "GitHubログイン状態を確認しています",
    step2: "公開リポジトリのメタデータだけを取得しています",
    step3: "放置スコア・黒歴史スコアを計算しています",
    step4: "結果カードを準備しています",
    metadataNote:
      "取得しているのは公開repoのメタデータのみです。README本文・source code・private repo・emailは取得していません。",
  },

  repoCard: {
    lastPushed: "最終push:",
    scores: "スコア:",
    stale: "放置",
    oneDay: "一日坊主",
    nameShame: "命名恥",
    memorial: "供養",
    ghost: "遺影",
  },

  footer: {
    copyright: "© 2026 GitHub黒歴史 Contributors — MIT License",
    securityLink: "セキュリティ・プライバシー",
    githubLink: "GitHub",
  },

  security: {
    header: "GitHub黒歴史",
    headerSub: "セキュリティ・プライバシーポリシー",
    title: "セキュリティ・プライバシーポリシー",
    description: "GitHub黒歴史 のセキュリティ設計とプライバシーに関する説明です。",

    whatWeAccess: "取得する情報",
    whatWeAccessIntro: "GitHubから取得するのは以下の情報のみです：",
    userInfoTitle: "ユーザー情報（GitHub OAuth経由）",
    userInfoItems: [
      "ユーザーID（数値）",
      "ログイン名（username）",
      "アバター画像URL",
    ] as const,
    repoMetaTitle: "公開リポジトリのメタデータ（公開API・アプリ認証）",
    repoMetaItems: [
      "リポジトリ名、説明文、URL",
      "作成日時、最終push日時、更新日時",
      "archived フラグ、fork フラグ",
      "使用言語、star数、open issue数",
    ] as const,

    neverAccess: "絶対に取得しない情報",
    neverAccessItems: [
      "private リポジトリ",
      "メールアドレス",
      "ソースコード・READMEの本文",
      "コミット・issue・PRの本文",
      "所属Organization",
      "フォロワー・フォロー中のユーザー",
      "スターしたリポジトリ",
    ] as const,

    oauthScope: "GitHub OAuth スコープ",
    oauthScopeText1: "GitHubの認可画面で表示される「要求されている権限」は",
    oauthScopeNone: "なし（空）",
    oauthScopeText2: "です。",
    oauthScopeText3: "で空文字列を指定しており、いかなる権限も要求しません。",
    oauthScopeWarning:
      "認可画面でscopeが空でないことが確認された場合は、直ちにアクセスを拒否してください。",

    tokenHandling: "アクセストークンの扱い",
    tokenHandlingItems: [
      "アクセストークンはOAuthコールバック処理中にメモリ上で一時的に使用するのみです",
      "ユーザー情報取得後、即座にGitHub APIでトークンを失効させます",
      "アクセストークンはクライアントに送信しません",
      "アクセストークンはデータベースやKVに保存しません",
    ] as const,
    tokenNotePrefix:
      "リポジトリの取得にはユーザーのアクセストークンを使用しません。サーバーサイドでOAuth Appの",
    tokenNoteCode: "client_id:client_secret",
    tokenNoteSuffix:
      "をアプリ認証として使用しています（レートリミット対策）。これはユーザーの認証情報ではなく、アプリ自身の識別情報です。",

    sessionDesign: "セッションの設計",
    sessionItem1Prefix: "セッションCookieはHMAC-SHA256で署名された",
    sessionItem1Code: "base64url(JSON).署名",
    sessionItem1Suffix: "形式です",
    sessionItem2Prefix: "Cookie名は",
    sessionItem2Code: "__Host-session",
    sessionItem2Suffix: "（HttpOnly, Secure, SameSite=Lax, Path=/）",
    sessionItem3: "セッションの有効期限は1時間です",
    sessionItem4:
      "セッションに含まれる情報はユーザーID・ログイン名・アバターURLのみです",

    pkce: "PKCEとOAuthセキュリティ",
    pkceItems: [
      "PKCE（Proof Key for Code Exchange）を実装しています",
      "OAuthのstateパラメータはHMAC-SHA256で署名されたCookieとタイミングセーフな比較（XORベース）で検証します",
      "リポジトリデータの取得はトークン失効後に公開APIで行います（認証なし）",
    ] as const,

    dataStorage: "データの保存・共有",
    dataStorageItems: [
      "データベースなし — 診断結果は一切保存しません",
      "KV（Key-Value Store）なし",
      "共有URLなし — 結果URLはありません",
      "外部アナリティクスなし — Google Analytics等は使用しません",
      "AIなし — コンテンツは外部AIサービスに送信しません",
    ] as const,

    rateLimiting: "レート制限",
    rateLimitingText1:
      "GitHub APIの公開エンドポイントはレート制限があります（認証なし：60リクエスト/時間）。レート制限に達した場合は429エラーが返ります。",
    rateLimitingText2: "アプリ側でも以下のレート制限を設けています（1分あたり）：",
    rateLimitingItems: [
      "発掘（/api/repos）: ユーザーあたり5回",
      "ログイン開始: IPあたり10回",
      "コールバック: IPあたり10回",
    ] as const,

    sourceCode: "ソースコード",
    sourceCodeText:
      "GitHub黒歴史 はオープンソースです（MITライセンス）。このセキュリティポリシーの実装はソースコードで確認できます。",
    sourceCodeLink: "tomoki013/github-kurorekishi",

    backToTop: "トップページに戻る",
  },

  errors: {
    rateLimit:
      "GitHub APIのレート制限に達しました。しばらく待ってから再試行してください。",
    authRequired: "認証が必要です。GitHubでログインしてください。",
    serverError: "サーバーエラーが発生しました。",
    unexpected: "予期しないエラーが発生しました。",
  },
} as const;

export const translations = { en, ja } as const;
export type Translations = typeof en;
