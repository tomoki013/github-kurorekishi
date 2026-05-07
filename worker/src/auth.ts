import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import {
  createSignedValue,
  verifySignedValue,
  timingSafeEqual,
  base64urlEncode,
  SESSION_MAX_AGE,
  OAUTH_STATE_MAX_AGE,
  SESSION_COOKIE,
  OAUTH_STATE_COOKIE,
} from "./session";
import type { SessionPayload, OAuthStatePayload } from "./session";

type Env = {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  SESSION_SECRET: string;
  GITHUB_REDIRECT_URI: string;
};

type GitHubTokenResponse = {
  access_token?: string;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
};

type GitHubUserRaw = Record<string, unknown>;

async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  // Input to SHA-256 is the ASCII bytes of the code_verifier string
  const verifierBytes = new TextEncoder().encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", verifierBytes);
  return base64urlEncode(new Uint8Array(digest));
}

export const authRouter = new Hono<{ Bindings: Env }>();

// GET /api/auth/github/start
authRouter.get("/github/start", async (c) => {
  const env = c.env;

  const state = crypto.randomUUID();
  const codeVerifierBytes = crypto.getRandomValues(new Uint8Array(32));
  const codeVerifier = base64urlEncode(codeVerifierBytes);
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  const oauthStatePayload: OAuthStatePayload = { state, codeVerifier };
  const signedStateCookie = await createSignedValue(
    oauthStatePayload,
    env.SESSION_SECRET
  );

  setCookie(c, OAUTH_STATE_COOKIE, signedStateCookie, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: OAUTH_STATE_MAX_AGE,
  });

  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: env.GITHUB_REDIRECT_URI,
    state,
    scope: "",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
  return c.redirect(authUrl, 302);
});

// GET /api/auth/github/callback
authRouter.get("/github/callback", async (c) => {
  const env = c.env;

  const code = c.req.query("code");
  const stateParam = c.req.query("state");

  if (!code || !stateParam) {
    return c.json({ error: "invalid_request" }, 400);
  }

  const stateCookieValue = getCookie(c, OAUTH_STATE_COOKIE);
  if (!stateCookieValue) {
    return c.json({ error: "invalid_request" }, 400);
  }

  const oauthState = await verifySignedValue<OAuthStatePayload>(
    stateCookieValue,
    env.SESSION_SECRET
  );
  if (!oauthState) {
    return c.json({ error: "invalid_request" }, 400);
  }

  // Timing-safe state comparison
  if (!timingSafeEqual(stateParam, oauthState.state)) {
    return c.json({ error: "invalid_request" }, 400);
  }

  // Exchange code for token using application/x-www-form-urlencoded
  let tokenResponse: GitHubTokenResponse;
  try {
    const tokenBody = new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: env.GITHUB_REDIRECT_URI,
      code_verifier: oauthState.codeVerifier,
    });

    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        "User-Agent": "GitHubKurorekishi/1.0",
      },
      body: tokenBody.toString(),
    });

    if (!tokenRes.ok) {
      return c.json({ error: "token_exchange_failed" }, 400);
    }

    tokenResponse = (await tokenRes.json()) as GitHubTokenResponse;
  } catch {
    return c.json({ error: "token_exchange_failed" }, 400);
  }

  if (tokenResponse.error || !tokenResponse.access_token) {
    return c.json({ error: "token_exchange_failed" }, 400);
  }

  // Validate scope: accept only empty string, null, or undefined
  const scope = tokenResponse.scope;
  if (scope !== undefined && scope !== null && scope !== "") {
    return c.json({ error: "unexpected_scope" }, 400);
  }

  const accessToken = tokenResponse.access_token;

  // Fetch user info — extract ONLY allowed fields
  let userId: number;
  let login: string;
  let avatarUrl: string;
  try {
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "GitHubKurorekishi/1.0",
        Accept: "application/vnd.github+json",
      },
    });

    if (!userRes.ok) {
      return c.json({ error: "user_fetch_failed" }, 400);
    }

    const rawUser = (await userRes.json()) as GitHubUserRaw;
    // Extract ONLY the three allowed fields
    userId = rawUser.id as number;
    login = rawUser.login as string;
    avatarUrl = rawUser.avatar_url as string;
  } catch {
    return c.json({ error: "user_fetch_failed" }, 400);
  }

  // Revoke the token (best-effort, non-blocking)
  try {
    const credentials = btoa(`${env.GITHUB_CLIENT_ID}:${env.GITHUB_CLIENT_SECRET}`);
    await fetch(
      `https://api.github.com/applications/${env.GITHUB_CLIENT_ID}/token`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
          "User-Agent": "GitHubKurorekishi/1.0",
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({ access_token: accessToken }),
      }
    );
  } catch {
    // Non-fatal — continue on failure
  }

  // Build session payload
  const now = Math.floor(Date.now() / 1000);
  const sessionPayload: SessionPayload = {
    githubUserId: String(userId),
    login,
    avatarUrl,
    iat: now,
    exp: now + SESSION_MAX_AGE,
  };

  const signedSession = await createSignedValue(sessionPayload, env.SESSION_SECRET);

  // Set session cookie
  setCookie(c, SESSION_COOKIE, signedSession, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  // Delete OAuth state cookie by setting Max-Age=0
  setCookie(c, OAUTH_STATE_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 0,
  });

  console.log(`Login successful for user: ${login}`);
  return c.redirect("/?login=success", 302);
});
