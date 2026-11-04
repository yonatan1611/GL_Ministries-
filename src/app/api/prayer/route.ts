import { NextResponse } from "next/server";
import { prayerRequestSchema } from "@/lib/validations";
import { RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { rateLimitGuard, readJsonBody, serverErrorResponse, validateBody } from "@/lib/api/guards";
import { generateReferenceCode } from "@/lib/referenceCode";
import { HQ_EMAIL, DC_EMAIL } from "@/data/locations";

/**
 * Global Prayer Army / "Prayer Requests" submissions, reachable from the
 * Top Bar, Hero, Navbar, and Footer via `GlobalPrayerModal`. Validates
 * with `prayerRequestSchema`. Every request is prayed over by the Aware
 * HQ intercessory team regardless of office; `joinPrayerArmy` opts the
 * requester into the ongoing network rather than a one-time prayer.
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
