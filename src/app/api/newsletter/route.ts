import { NextResponse } from "next/server";
import { newsletterSchema } from "@/lib/validations";
import { RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { rateLimitGuard, readJsonBody, serverErrorResponse, validateBody } from "@/lib/api/guards";
import { generateReferenceCode } from "@/lib/referenceCode";
import { upsertSubscriber } from "@/lib/db";

/**
 * Newsletter signup. Validates with `newsletterSchema`, persists a
 * real subscriber record (`src/lib/db.ts` — upserted by email/phone so
 * re-subscribing updates preferences instead of duplicating), and
 * returns a clean, single confirmation — replacing the legacy
 * `/subscribe` page that rendered success and error strings
 * simultaneously.
 */
export async function POST(request: Request) {
  const limited = rateLimitGuard(request, "newsletter", RATE_LIMIT_PRESETS.newsletter);
  if (limited) return limited;

  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;

  try {
    const validated = validateBody(newsletterSchema, parsed.body);
    if (!validated.ok) return validated.response;
    const subscription = validated.data;

    const referenceId = generateReferenceCode("GLM-NEWS");

    await upsertSubscriber({
      firstName: subscription.firstName,
      lastName: subscription.lastName,
      email: subscription.email,
      phone: subscription.phone,
      emailOptIn: subscription.channel === "email",
      smsOptIn: subscription.channel !== "email",
    });

    return NextResponse.json(
      {
        success: true,
        referenceId,
        message: "Thank you for subscribing!",
        data: {
          referenceId,
          channel: subscription.channel,
          firstName: subscription.firstName,
          lastName: subscription.lastName,
          email: subscription.email,
          phone: subscription.phone,
          preferredLanguage: subscription.preferredLanguage,
          subscribedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch {
    return serverErrorResponse();
  }
}
