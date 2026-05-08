# ⛏️ GitHub Graveyard (GitHub黒歴史)

A fun site that excavates your abandoned GitHub repositories.  
Using only public repository metadata, it classifies repos as fossils, one-day wonders, ghost commits, and more.

---

## What This App Does

1. Log in via GitHub OAuth (zero permissions requested)
2. Fetch minimal profile info (user ID, username, avatar URL only)
3. Fetch public repository metadata (public API + OAuth app auth for rate limit headroom)
4. Calculate stale scores and graveyard classifications
5. Generate a result image **in-browser** (never uploaded to the server)

---

## What We Never Access

- Private repositories
- Email address
- Source code or file contents
- README body text
- Commit history or commit content
- Issue or Pull Request content
- Organization membership
- Followers / following
- Starred repositories
- Branch lists

---

## What We Store

**Nothing.**

- No database
- No KV (Cloudflare KV)
- No saved results
- No server-side image storage
- No shareable URLs
- No external analytics (no Google Analytics, etc.)
- No AI

---

## GitHub OAuth Scope

**`scope=""` (empty)** — no permissions requested whatsoever.

GitHub's authorization screen will show **"This application will only read your public information"**.  
If any permissions are shown, abort the login immediately.

---

## Access Token Handling

- Used only during the OAuth callback to fetch user ID, username, and avatar URL
- Immediately revoked via `DELETE https://api.github.com/applications/{client_id}/token` after use
- Never written to any storage (DB, KV, disk)
- Never returned to the client

Repositories are fetched without the user's access token. The server uses the OAuth App's `client_id:client_secret` for app-level authentication (5,000 req/hr rate limit).

---

## Session

- A single short-lived cookie named `__Host-session` (HttpOnly, Secure, SameSite=Lax)
- The `__Host-` prefix enforces Secure, Path=/, and no Domain attribute
- Signed with **HMAC-SHA256** using the `SESSION_SECRET` environment variable
- **Expiry: 1 hour**
- Contains only: user ID, username, avatar URL

The OAuth `state` parameter is also protected by a signed cookie (`__Host-oauth-state`, 10-minute expiry).

---

## Image Sharing

- Result images (PNG) are generated **in-browser** using `html-to-image`
- Never sent to the server
- Users can download the PNG locally or share via the native share sheet (mobile) or X (desktop)

---

## Local Development

### Requirements

- [pnpm](https://pnpm.io/) v9+
- [Node.js](https://nodejs.org/) v18+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Create a GitHub OAuth App

1. Open [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in:
   - **Application name**: `GitHub Graveyard (dev)`
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:8787/api/auth/github/callback`
4. Click **"Register application"**
5. Copy the **Client ID** and generate + copy the **Client Secret**

### 3. Create `.dev.vars` (already gitignored)

Create a `.dev.vars` file in the project root:

```
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
SESSION_SECRET=a_random_string_of_at_least_32_characters
GITHUB_REDIRECT_URI=http://localhost:8787/api/auth/github/callback
```

### 4. Start the development servers

**Terminal 1 — Vite frontend (port 5173)**:
```bash
pnpm run dev
```

**Terminal 2 — Wrangler Worker (port 8787)**:
```bash
pnpm run worker:dev
```

Open `http://localhost:5173` in your browser.

> Vite's dev server proxies `/api/*` requests to `http://localhost:8787`.

---

## Environment Variables

| Variable | Description |
|---|---|
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret |
| `SESSION_SECRET` | Random secret for HMAC-SHA256 signing (min. 32 characters) |
| `GITHUB_REDIRECT_URI` | OAuth callback URL (e.g. `https://{worker-name}.{subdomain}.workers.dev/api/auth/github/callback`) |

---

## Deploying to Cloudflare Workers

The `name` field in `wrangler.toml` determines the Worker name. After deployment the URL will be `https://{name}.{subdomain}.workers.dev`.

### 1. Create a production GitHub OAuth App

Set the **Authorization callback URL** to your production URL:
```
https://{worker-name}.{subdomain}.workers.dev/api/auth/github/callback
```

### 2. Register secrets

```bash
pnpm wrangler secret put GITHUB_CLIENT_ID
pnpm wrangler secret put GITHUB_CLIENT_SECRET
pnpm wrangler secret put SESSION_SECRET
pnpm wrangler secret put GITHUB_REDIRECT_URI
```

> On PowerShell, right-click to paste instead of Ctrl+V.

### 3. Deploy

```bash
pnpm run deploy
```

This runs: type check (`tsc --noEmit`) → frontend build (`vite build`) → deploy (`wrangler deploy`).

### Automatic Deployment via GitHub Actions

Pushing to the `main` branch triggers automatic deployment (`.github/workflows/deploy.yml`).

Register the following in **Settings → Secrets and variables → Actions**:

| Secret | Description |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token (created with the "Edit Cloudflare Workers" template) |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |

---

## Scoring System

Edit `src/lib/scoring/rules.ts` to adjust score thresholds and keywords.

Scoring is implemented as pure functions under `src/lib/scoring/`:

| File | Role |
|---|---|
| `types.ts` | Type definitions |
| `rules.ts` | Score constants and keyword lists |
| `utils.ts` | Date calculation utilities |
| `stale.ts` | Stale (abandonment) score |
| `oneDay.ts` | One-day-wonder score |
| `nameShame.ts` | Temporary-name score |
| `memorial.ts` | Archived (laid to rest) score |
| `initialCommitPortrait.ts` | Ghost commit detection |
| `classify.ts` | Classify repos by score |
| `reasons.ts` | Generate human-readable reason strings |
| `index.ts` | Entry point (exports `scoreAllRepos`) |

---

## "Ghost Commit" Detection

The Commits API is not used. Detection is estimated from **metadata only**.

A repo is classified as a ghost commit if all of the following are true:

1. Gap between `created_at` and `pushed_at` is **≤ 1 day**
2. **365+ days** have passed since `pushed_at`
3. `archived` is false
4. `fork` is false

---

## Classifications

| Classification | Condition |
|---|---|
| 🪦 Ghost Commit (Initial commitの遺影) | Pushed once right after creation, abandoned for 1+ year (excl. archived/forks) |
| 💀 Legendary Fossil (黒歴史級化石) | Stale score ≥ 80 |
| 🌱 One-Day Wonder (一日坊主型黒歴史) | One-day score ≥ 75 AND name-shame score ≥ 50 |
| 🕯️ Laid to Rest (供養済み) | Archived (memorial score ≥ 70) |
| 🏛️ Ancient Ruins (古代遺跡) | Stale score 60–79 |
| 😴 Dormant (休眠中) | Stale score 40–59 |
| 💚 Seemingly Active (現役っぽい) | Everything else |

---

## Rate Limiting

**GitHub API (OAuth app auth):** 5,000 requests/hr per OAuth app.  
The server uses `client_id:client_secret` — no user token — so the quota is shared across all users.

**App-side rate limits** (per minute):

| Endpoint | Limit |
|---|---|
| `/api/repos` (excavation) | 5 times per user |
| `/api/auth/github/start` | 10 times per IP |
| `/api/auth/github/callback` | 10 times per IP |
| `/api/me` | 60 times per IP |
| `/api/logout` | 20 times per IP |

---

## Security Policy

See the [/security](/security) page for full details.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vite + React 18 + TypeScript + Tailwind CSS |
| Backend | Cloudflare Workers + Hono |
| Auth | GitHub OAuth 2.0 + PKCE |
| Session | HMAC-SHA256 signed cookie |
| Image generation | html-to-image (client-side) |
| Package manager | pnpm |

---

## License

MIT License — Copyright (c) 2026 GitHub Graveyard Contributors

See [LICENSE](./LICENSE) for details.
