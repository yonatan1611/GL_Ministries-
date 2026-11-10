import { timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env.server";

/**
 * Authorization for Vercel Cron-triggered routes (`/api/cron/*`) —
 * distinct from the Admin Portal's cookie session (`adminAuth.ts`),
 * since a scheduled invocation has no browser session to present.
 *
 * Vercel automatically attaches `Authorization: Bearer <CRON_SECRET>`
 * to requests it sends for a `crons` entry in `vercel.json`, as long as
 * the `CRON_SECRET` environment variable is set on the project — see
 * https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs.
 * `CRON_SECRET` defaults to `""` (see `env.server.ts`), so this refuses
 * every request until an operator deliberately configures it; it never
 * falls open.
 */
export function verifyCronRequest(request: Request): boolean {
  if (!env.CRON_SECRET) return false;

  const header = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${env.CRON_SECRET}`;

  const headerBuf = Buffer.from(header, "utf-8");
  const expectedBuf = Buffer.from(expected, "utf-8");
  if (headerBuf.length !== expectedBuf.length) return false;
  return timingSafeEqual(headerBuf, expectedBuf);
}
