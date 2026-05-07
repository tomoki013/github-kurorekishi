import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { authRouter } from "./auth";
import { getAndScoreRepos, RateLimitError } from "./repos";
import { verifySignedValue, SESSION_COOKIE } from "./session";
import type { SessionPayload } from "./session";

type Env = {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  SESSION_SECRET: string;
  GITHUB_REDIRECT_URI: string;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

// In-memory rate limit store (per Worker instance)
const rateLimitStore = new Map<string, RateLimitEntry>();

function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();

  // Periodic cleanup of expired entries
  if (rateLimitStore.size > 10000) {
    for (const [k, entry] of rateLimitStore.entries()) {
      if (now > entry.resetAt) {
        rateLimitStore.delete(k);
      }
    }
  }

  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}

function getClientIP(req: Request): string {
  return (
    req.headers.get("CF-Connecting-IP") ??
    req.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

const app = new Hono<{ Bindings: Env }>();

// Security headers middleware — apply to all routes
app.use("*", async (c, next) => {
  await next();
  c.res.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://avatars.githubusercontent.com; connect-src 'self'; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
  );
  c.res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  c.res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  c.res.headers.set("X-Content-Type-Options", "nosniff");
  c.res.headers.set("X-Frame-Options", "DENY");
});

// Rate limit: /api/auth/github/start — 10/60s per IP
app.use("/api/auth/github/start", async (c, next) => {
  const ip = getClientIP(c.req.raw);
  if (!checkRateLimit(`start:${ip}`, 10, 60_000)) {
    return c.json({ error: "rate_limited" }, 429);
  }
  return next();
});

// Rate limit: /api/auth/github/callback — 10/60s per IP
app.use("/api/auth/github/callback", async (c, next) => {
  const ip = getClientIP(c.req.raw);
  if (!checkRateLimit(`cb:${ip}`, 10, 60_000)) {
    return c.json({ error: "rate_limited" }, 429);
  }
  return next();
});

// Rate limit: /api/me — 60/60s per IP
app.use("/api/me", async (c, next) => {
  const ip = getClientIP(c.req.raw);
  if (!checkRateLimit(`me:${ip}`, 60, 60_000)) {
    return c.json({ error: "rate_limited" }, 429);
  }
  return next();
});

// Rate limit: /api/logout — 20/60s per IP
app.use("/api/logout", async (c, next) => {
  const ip = getClientIP(c.req.raw);
  if (!checkRateLimit(`logout:${ip}`, 20, 60_000)) {
    return c.json({ error: "rate_limited" }, 429);
  }
  return next();
});

// Mount auth routes (handles /api/auth/github/start and /api/auth/github/callback)
app.route("/api/auth", authRouter);

// GET /api/me — verify session, return user info
app.get("/api/me", async (c) => {
  const env = c.env;
  const sessionCookie = getCookie(c, SESSION_COOKIE);

  if (!sessionCookie) {
    return c.json({ error: "unauthorized" }, 401);
  }

  const session = await verifySignedValue<SessionPayload>(
    sessionCookie,
    env.SESSION_SECRET
  );

  if (!session) {
    return c.json({ error: "unauthorized" }, 401);
  }

  const now = Math.floor(Date.now() / 1000);
  if (session.exp < now) {
    return c.json({ error: "unauthorized" }, 401);
  }

  return c.json({
    id: session.githubUserId,
    login: session.login,
    avatarUrl: session.avatarUrl,
  });
});

// POST /api/logout — clear session cookie
app.post("/api/logout", (c) => {
  setCookie(c, SESSION_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 0,
  });
  return c.json({ ok: true });
});

// GET /api/repos — rate limit per user or IP, verify session, fetch and score repos
app.get("/api/repos", async (c) => {
  const env = c.env;
  const ip = getClientIP(c.req.raw);

  // Get session to extract userId for rate limiting
  const sessionCookie = getCookie(c, SESSION_COOKIE);
  let session: SessionPayload | null = null;

  if (sessionCookie) {
    const parsed = await verifySignedValue<SessionPayload>(
      sessionCookie,
      env.SESSION_SECRET
    );
    if (parsed) {
      const now = Math.floor(Date.now() / 1000);
      if (parsed.exp >= now) {
        session = parsed;
      }
    }
  }

  // Rate limit key: by userId if authenticated, by IP otherwise
  const rateLimitKey = session
    ? `repos:${session.githubUserId}`
    : `repos:ip:${ip}`;

  if (!checkRateLimit(rateLimitKey, 5, 60_000)) {
    return c.json({ error: "rate_limited" }, 429);
  }

  if (!session) {
    return c.json({ error: "unauthorized" }, 401);
  }

  try {
    const repos = await getAndScoreRepos(session.login);
    return c.json(repos);
  } catch (err) {
    if (err instanceof RateLimitError) {
      return c.json(
        {
          error: "rate_limited",
          message:
            "GitHub API rate limit exceeded. Please try again later.",
        },
        429
      );
    }
    return c.json({ error: "internal_error" }, 500);
  }
});

export default app;
