export const SESSION_COOKIE = "docuhub_ai_session";

type SessionPayload = {
  uid: string;
  exp: number; // unix seconds
};

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  // btoa is available in Edge; in Node it's also available in recent versions
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecodeToBytes(s: string): Uint8Array {
  const base64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

async function hmacSha256Base64Url(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return base64UrlEncode(new Uint8Array(sig));
}

export async function signSessionCookieValue(
  userId: string,
  opts?: { ttlSeconds?: number; nowMs?: number; secret?: string },
): Promise<string> {
  const ttlSeconds = opts?.ttlSeconds ?? 60 * 60 * 24 * 30; // 30 days
  const nowMs = opts?.nowMs ?? Date.now();
  const secret = opts?.secret ?? process.env.AUTH_COOKIE_SECRET ?? "";
  if (!secret) {
    throw new Error("Missing AUTH_COOKIE_SECRET");
  }

  const payload: SessionPayload = {
    uid: userId,
    exp: Math.floor(nowMs / 1000) + ttlSeconds,
  };
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = await hmacSha256Base64Url(secret, payloadB64);
  return `${payloadB64}.${sig}`;
}

export async function verifySessionCookieValue(
  value: string | null | undefined,
  opts?: { nowMs?: number; secret?: string },
): Promise<SessionPayload | null> {
  if (!value) return null;
  const secret = opts?.secret ?? process.env.AUTH_COOKIE_SECRET ?? "";
  if (!secret) return null;

  const [payloadB64, sig] = value.split(".", 2);
  if (!payloadB64 || !sig) return null;

  const expected = await hmacSha256Base64Url(secret, payloadB64);
  if (!constantTimeEqual(expected, sig)) return null;

  try {
    const bytes = base64UrlDecodeToBytes(payloadB64);
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json) as SessionPayload;
    if (!parsed?.uid || typeof parsed.uid !== "string") return null;
    if (!parsed?.exp || typeof parsed.exp !== "number") return null;
    const nowSec = Math.floor((opts?.nowMs ?? Date.now()) / 1000);
    if (parsed.exp <= nowSec) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function getAuthedUserIdFromCookieValue(
  value: string | null | undefined,
): Promise<string | null> {
  const payload = await verifySessionCookieValue(value);
  return payload?.uid ?? null;
}


