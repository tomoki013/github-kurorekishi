export type SessionPayload = {
  githubUserId: string;
  login: string;
  avatarUrl: string;
  iat: number;
  exp: number;
};

export type OAuthStatePayload = {
  state: string;
  codeVerifier: string;
};

export const SESSION_MAX_AGE = 3600; // 1 hour in seconds
export const OAUTH_STATE_MAX_AGE = 600; // 10 minutes in seconds
export const SESSION_COOKIE = "__Host-session";
export const OAUTH_STATE_COOKIE = "__Host-oauth-state";

export function base64urlEncode(data: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function base64urlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const padding = (4 - (padded.length % 4)) % 4;
  const base64 = padded + "=".repeat(padding);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Timing-safe string comparison using XOR-based approach.
 * Prevents timing attacks by always iterating the full length (longer of the two).
 * Never short-circuits on length difference.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);
  // Use the longer length to avoid leaking length difference too early
  const len = Math.max(aBytes.length, bBytes.length);
  let result = aBytes.length ^ bBytes.length; // non-zero if lengths differ
  for (let i = 0; i < len; i++) {
    result |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
  }
  return result === 0;
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const keyMaterial = new TextEncoder().encode(secret);
  const key = await crypto.subtle.importKey(
    "raw",
    keyMaterial,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const dataBytes = new TextEncoder().encode(data);
  const signature = await crypto.subtle.sign("HMAC", key, dataBytes);
  return base64urlEncode(new Uint8Array(signature));
}

export async function createSignedValue(
  payload: object,
  secret: string
): Promise<string> {
  const json = JSON.stringify(payload);
  const encoded = base64urlEncode(new TextEncoder().encode(json));
  const sig = await hmacSign(encoded, secret);
  return `${encoded}.${sig}`;
}

export async function verifySignedValue<T>(
  value: string,
  secret: string
): Promise<T | null> {
  const dotIndex = value.lastIndexOf(".");
  if (dotIndex === -1) return null;

  const encoded = value.substring(0, dotIndex);
  const sig = value.substring(dotIndex + 1);

  const expectedSig = await hmacSign(encoded, secret);
  if (!timingSafeEqual(sig, expectedSig)) return null;

  try {
    const jsonBytes = base64urlDecode(encoded);
    const json = new TextDecoder().decode(jsonBytes);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}
