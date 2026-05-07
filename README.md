# ⛏️ Gitcheology — GitHub考古学

A GitHub archaeology joke site that excavates your abandoned public repositories, calculates their "neglect score" and "dark history score", and generates a shareable result image — all without accessing any sensitive data.

> GitHubに眠る放置リポジトリを発掘するネタサイト。

---

## What this app does

1. Signs in with GitHub OAuth (scope = empty — no permissions requested)
2. Reads your **public profile** (minimum): user ID, username, avatar URL only
3. Reads **public repository metadata** for your account (unauthenticated API, no auth token used)
4. Calculates joke scores: neglect score, one-day-wonder score, name shame score, memorial score, initial commit portrait score
5. Generates a shareable result image **locally in your browser** — never uploaded to any server

---

## What this app NEVER accesses

- Private repositories
- Email addresses
- Source code or file contents
- README body
- Commit body or history
- Issue body
- Pull request body
- Organizations
- Followers / Following
- Starred repositories
- Branch list

---

## What this app stores

**Nothing.**

- No database
- No key-value store (no Cloudflare KV)
- No diagnosis history
- No generated images on server
- No sharing URLs
- No external analytics (no Google Analytics, etc.)
- No AI services

---

## GitHub OAuth Scope

**`scope=""` (empty string).** No permissions are requested.

The GitHub authorization page will show **"No permissions requested."**

If you see any scope listed on the authorization page, deny access immediately.

---

## Token handling

- The GitHub access token is used **only briefly** during the OAuth callback to verify your identity
- It is **revoked immediately** after fetching your user ID, username, and avatar URL via `DELETE https://api.github.com/applications/{client_id}/token`
- It is **never saved** to any storage (database, KV, disk)
- It is **never sent to the client**

---

## Session

- Short-lived **HttpOnly Secure SameSite=Lax** cookie only
- Cookie name: `__Host-session` (the `__Host-` prefix enforces Secure, Path=/, no Domain attribute)
- Signed with **HMAC-SHA256** using the `SESSION_SECRET` environment variable
- **1-hour expiry**
- Contains only: user ID, username, avatar URL

The OAuth state parameter is also protected with a signed cookie (`__Host-oauth-state`, 10-minute expiry).

---

## Image sharing

- The result image (PNG) is **generated locally in your browser** using `html-to-image`
- The image is **never uploaded** to our server
- After saving the PNG, attach it manually when sharing on X (Twitter)

---

## Local development

### Prerequisites

- [pnpm](https://pnpm.io/) v9+
- [Node.js](https://nodejs.org/) v18+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in:
   - **Application name**: `Gitcheology (dev)`
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:8787/api/auth/github/callback`
4. Click **"Register application"**
5. Note your **Client ID** and generate a **Client Secret**

### 3. Set secrets for local development

Create a `.dev.vars` file in the project root (this file is gitignored):

```
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
SESSION_SECRET=your_random_secret_at_least_32_characters_long
GITHUB_REDIRECT_URI=http://localhost:8787/api/auth/github/callback
```

### 4. Start development servers

Open **two terminals**:

**Terminal 1 — Vite frontend (port 5173)**:
```bash
pnpm run dev
```

**Terminal 2 — Wrangler worker (port 8787)**:
```bash
pnpm run worker:dev
```

Open your browser at `http://localhost:5173`.

> The Vite dev server proxies `/api/*` requests to `http://localhost:8787`.

---

## Environment variables

| Variable | Description |
|---|---|
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret |
| `SESSION_SECRET` | Random secret for HMAC-SHA256 signing (minimum 32 characters) |
| `GITHUB_REDIRECT_URI` | OAuth callback URL (e.g. `https://gitcheology.dev/api/auth/github/callback`) |

---

## Deploy to Cloudflare

### 1. Create a production GitHub OAuth App

Set the **Authorization callback URL** to your production domain:
```
https://your-worker.workers.dev/api/auth/github/callback
```

### 2. Set secrets via Wrangler

```bash
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
wrangler secret put SESSION_SECRET
wrangler secret put GITHUB_REDIRECT_URI
```

### 3. Deploy

```bash
pnpm run deploy
```

This runs `tsc --noEmit` (type check), `vite build` (frontend), then `wrangler deploy` (worker + assets).

---

## Modifying scoring

Edit `src/lib/scoring/rules.ts` to adjust score thresholds and penalties.

The scoring logic is implemented as pure functions in `src/lib/scoring/`:

| File | Description |
|---|---|
| `rules.ts` | All scoring constants and keyword lists |
| `stale.ts` | Calculates how long-neglected a repo is |
| `oneDay.ts` | Calculates one-day-wonder score |
| `nameShame.ts` | Penalizes placeholder repo names |
| `memorial.ts` | Score for archived repos |
| `initialCommitPortrait.ts` | Detects repos abandoned after initial commit |
| `classify.ts` | Classifies repos into categories |
| `reasons.ts` | Generates human-readable Japanese reason strings |

---

## "Initial commitの遺影" detection

This classification is determined **using metadata only** — no commit API is called.

Conditions (all must be true):
1. `created_at` and `pushed_at` differ by **1 day or less** (active days ≤ 1)
2. `pushed_at` is **365 or more days** in the past
3. Not `archived`
4. Not a `fork`

This is a metadata-based estimate. A repo that was pushed to once soon after creation and then never touched again qualifies.

---

## Classifications

| Classification | Description |
|---|---|
| 🪦 Initial commitの遺影 | Created and pushed within 1 day, abandoned for 1+ year (not archived, not fork) |
| 💀 黒歴史級化石 | Stale score ≥ 80 |
| 🌱 一日坊主型黒歴史 | One-day score ≥ 75 AND name shame score ≥ 50 |
| 🕯️ 供養済み | Archived (memorial score ≥ 70) |
| 🏛️ 古代遺跡 | Stale score 60–79 |
| 😴 休眠中 | Stale score 40–59 |
| 💚 現役っぽい | Everything else |

---

## Rate limiting

**GitHub API (unauthenticated):** 60 requests per hour per IP address.

Note: Cloudflare Worker outbound IPs are shared among many users, so the effective rate limit per individual may be lower than 60/hour. If you hit a 429, wait a few minutes and try again.

**App-level rate limits** (per minute):

| Endpoint | Limit |
|---|---|
| `/api/repos` (excavation) | 5 per user |
| `/api/auth/github/start` | 10 per IP |
| `/api/auth/github/callback` | 10 per IP |
| `/api/me` | 60 per IP |
| `/api/logout` | 20 per IP |

Frontend double-click prevention is also implemented in `useExcavation`.

---

## Security policy

See [/security](/security) for the full security and privacy policy, including:
- OAuth scope details
- Token revocation process
- Session cookie design
- PKCE implementation
- What data is and is not accessed

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Vite + React 18 + TypeScript + Tailwind CSS |
| Backend | Cloudflare Workers + Hono |
| Auth | GitHub OAuth 2.0 with PKCE |
| Session | HMAC-SHA256 signed cookie |
| Image generation | html-to-image (client-side) |
| Package manager | pnpm |

---

## License

MIT License — Copyright (c) 2025 Gitcheology Contributors

See [LICENSE](./LICENSE) for full text.
