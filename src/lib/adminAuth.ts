import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { env } from "@/lib/env.server";

/**
 * Lightweight passcode gate for the Ministry Admin Portal
 * (`/[locale]/admin` + `/api/admin/*`). Not a full user-account system
 * — a single shared `ADMIN_PASSCODE` (default `2026`) the client gives
 * to pastoral/office staff, matching the brief's "demo PIN" design.
 *
 * The session cookie is an HMAC of a fixed payload keyed by the
 * passcode itself: valid only to someone who already knew the
 * passcode when it was issued, and worthless for forging a session
 * without knowing it (unlike a plain "logged_in=true" cookie).
 */

const ADMIN_COOKIE_NAME = "glm_admin_session";
const SESSION_PAYLOAD = "glm-admin-session-v1";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

function computeSessionToken(): string {
  return createHmac("sha256", env.ADMIN_PASSCODE).update(SESSION_PAYLOAD).digest("hex");
}

function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf-8");
  const bufB = Buffer.from(b, "utf-8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** Constant-time comparison against the configured passcode. */
export function verifyPasscode(candidate: string): boolean {
  return timingSafeStringEqual(candidate, env.ADMIN_PASSCODE);
}

export async function createAdminSession(): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_COOKIE_NAME, computeSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function destroyAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE_NAME);
}

/** Checked by every `/api/admin/*` route and the `/[locale]/admin`
 *  page itself before returning or mutating anything. */
export async function hasAdminSession(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;
  return timingSafeStringEqual(token, computeSessionToken());
}
