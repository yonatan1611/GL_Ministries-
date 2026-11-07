import { NextResponse } from "next/server";
import { prayerRequestSchema } from "@/lib/validations";
import { RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { rateLimitGuard, readJsonBody, serverErrorResponse, validateBody } from "@/lib/api/guards";
import { generateReferenceCode } from "@/lib/referenceCode";
import { HQ_EMAIL, DC_EMAIL } from "@/data/locations";
import { getPrayerArmyStats, incrementPrayerCount, insertPrayerRequest, listPublicPrayerRequests } from "@/lib/db";

/**
 * Global Prayer Army / "Prayer Requests" submissions, reachable from the
 * Top Bar, Hero, Navbar, and Footer via `GlobalPrayerModal`. Validates
 * with `prayerRequestSchema` and persists a real record
 * (`src/lib/db.ts`) so the live Prayer Army counter and public prayer
 * wall (`GET`, below) reflect every submission immediately.
 */
export async function POST(request: Request) {
  const limited = rateLimitGuard(request, "prayer", RATE_LIMIT_PRESETS.prayer);
  if (limited) return limited;

  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;

  try {
    const validated = validateBody(prayerRequestSchema, parsed.body);
    if (!validated.ok) return validated.response;
    const prayer = validated.data;

    const referenceId = generateReferenceCode("GLM-PRAYER");

    await insertPrayerRequest({
      fullName: prayer.fullName,
      email: prayer.email,
      phone: prayer.phone,
      category: prayer.category,
      requestText: prayer.prayerRequest,
      // `zod`'s `.default()` fields narrow back to `T | undefined` through
      // `validateBody`'s `ZodSchema<T>` generic (its input/output types
      // diverge for defaulted fields) even though a default guarantees
      // these are always defined at runtime — coerce explicitly.
      isConfidential: Boolean(prayer.isConfidential),
      joinedPrayerArmy: Boolean(prayer.joinPrayerArmy),
    });

    return NextResponse.json(
      {
        success: true,
        referenceId,
        message: "Your prayer request has been received. We are praying with you.",
        data: {
          referenceId,
          routedTo: [HQ_EMAIL, DC_EMAIL],
          category: prayer.category,
          isConfidential: prayer.isConfidential,
          wantsFollowUp: prayer.wantsFollowUp,
          joinPrayerArmy: prayer.joinPrayerArmy,
          submittedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch {
    return serverErrorResponse();
  }
}

/**
 * Public Global Prayer Army stats + the most recent non-confidential
 * requests, for the homepage "Take Your Place" panel's live counter
 * and prayer wall. Never includes a confidential submission — those
 * stay private to the pastoral team by design.
 */
export async function GET(request: Request) {
  const limited = rateLimitGuard(request, "prayer-stats", RATE_LIMIT_PRESETS.liveCounters);
  if (limited) return limited;

  try {
    const [stats, recent] = await Promise.all([getPrayerArmyStats(), listPublicPrayerRequests(6)]);

    return NextResponse.json(
      {
        success: true,
        message: "Prayer Army stats.",
        data: {
          ...stats,
          recentRequests: recent.map((p) => ({
            id: p.id,
            fullName: p.fullName,
            category: p.category,
            requestText: p.requestText,
            prayedCount: p.prayedCount,
            createdAt: p.createdAt,
          })),
        },
      },
      { status: 200 }
    );
  } catch {
    return serverErrorResponse();
  }
}

/** Public "🙏 I Prayed for This Request" tally — increments the given
 *  request's `prayedCount` by one. Anonymous and idempotent-adjacent
 *  (rate-limited rather than de-duplicated, same as a social "like"). */
export async function PATCH(request: Request) {
  const limited = rateLimitGuard(request, "prayer-increment", RATE_LIMIT_PRESETS.prayerIncrement);
  if (limited) return limited;

  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;

  try {
    const id = typeof parsed.body === "object" && parsed.body !== null ? (parsed.body as { id?: unknown }).id : null;
    if (typeof id !== "string" || id.length === 0) {
      return NextResponse.json({ success: false, error: "Missing prayer request id." }, { status: 400 });
    }

    const updated = await incrementPrayerCount(id);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Unknown prayer request." }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Thank you for praying.", data: { id: updated.id, prayedCount: updated.prayedCount } },
      { status: 200 }
    );
  } catch {
    return serverErrorResponse();
  }
}
