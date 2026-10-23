import { env } from "./env";

export const PASS_COOKIE = "club_pass";
export const MEMBER_COOKIE = "club_member";
export const ADMIN_COOKIE = "club_admin";

export const COOKIE_MAX_AGE = 60 * 60 * 24 * 90;

const encoder = new TextEncoder();

async function hmac(key: string, data: string) {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data));
  return Buffer.from(signature).toString("base64url");
}

export function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// The pass and admin keys include their password, so changing a password
// invalidates every cookie issued under the old one.
const keys = {
  pass: () => `${env.sessionSecret}:pass:${env.sitePassword}`,
  member: () => `${env.sessionSecret}:member`,
  admin: () => `${env.sessionSecret}:admin:${env.adminPassword}`,
};

type Kind = keyof typeof keys;

export async function sign(kind: Kind, payload: string) {
  return `${payload}.${await hmac(keys[kind](), payload)}`;
}

/** Returns the payload when the token is valid, otherwise null. */
export async function verify(kind: Kind, token: string | undefined) {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const expected = await hmac(keys[kind](), payload);
  return safeEqual(token.slice(dot + 1), expected) ? payload : null;
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: COOKIE_MAX_AGE,
};
