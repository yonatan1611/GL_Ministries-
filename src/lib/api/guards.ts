import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";
import { checkRateLimit, getClientIp, type RateLimitOptions } from "@/lib/security/rate-limit";
import { sanitizeObject } from "@/lib/security/sanitize";

/**
 * Shared request-handling pipeline for every `/api/*` route: rate limit
 * -> parse JSON -> sanitize -> validate. Each helper returns either the
 * thing the route needs, or a ready-to-return `NextResponse` for the
 * error case, so a route handler reads top-to-bottom without repeating
 * this boilerplate five times.
 */

/** Checks the sliding-window rate limit for this client IP + endpoint
 *  scope. Returns a 429 `NextResponse` (with `Retry-After`) if exceeded,
 *  or `null` if the request may proceed. */
export function rateLimitGuard(request: Request, scope: string, options: RateLimitOptions): NextResponse | null {
  const ip = getClientIp(request);
  const result = checkRateLimit(`${ip}:${scope}`, options);
  if (result.success) return null;

  const retryAfterSeconds = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));
  return NextResponse.json(
    { success: false, error: "Too many requests. Please try again shortly." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );
}

export type ParsedBody = { ok: true; body: unknown } | { ok: false; response: NextResponse };

/** Parses the request body as JSON, never throwing — a malformed body
 *  becomes a 400 response instead of an unhandled exception. */
export async function readJsonBody(request: Request): Promise<ParsedBody> {
  try {
    const body = await request.json();
    return { ok: true, body };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 }),
    };
  }
}

export type Validated<T> = { ok: true; data: T } | { ok: false; response: NextResponse };

/** Sanitizes top-level string fields, then validates against the
 *  provided Zod schema. On failure, returns a 400 with per-field issues. */
export function validateBody<T>(schema: ZodSchema<T>, body: unknown): Validated<T> {
  const sanitized =
    typeof body === "object" && body !== null && !Array.isArray(body)
      ? sanitizeObject(body as Record<string, unknown>)
      : body;

  const result = schema.safeParse(sanitized);
  if (!result.success) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Validation failed.",
          issues: result.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      ),
    };
  }
  return { ok: true, data: result.data };
}

/** Generic 500 — never leaks stack traces or internal error messages. */
export function serverErrorResponse(): NextResponse {
  return NextResponse.json(
    { success: false, error: "Something went wrong. Please try again." },
    { status: 500 }
  );
}
