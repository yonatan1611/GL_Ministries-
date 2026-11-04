import { NextResponse } from "next/server";
import { rsvpSchema } from "@/lib/validations";
import { RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { rateLimitGuard, readJsonBody, serverErrorResponse, validateBody } from "@/lib/api/guards";
import { generateReferenceCode } from "@/lib/referenceCode";
import { UPCOMING_EVENTS_2026 } from "@/data/ministry-content";

/** Event RSVP. Validates with `rsvpSchema` and confirms against a real
 *  upcoming event before returning a registration confirmation. */
export async function POST(request: Request) {
  const limited = rateLimitGuard(request, "event-rsvp", RATE_LIMIT_PRESETS.eventRsvp);
  if (limited) return limited;

  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;

  try {
    const validated = validateBody(rsvpSchema, parsed.body);
    if (!validated.ok) return validated.response;
    const rsvp = validated.data;

    const event = UPCOMING_EVENTS_2026.find((candidate) => candidate.id === rsvp.eventId);
    if (!event) {
      return NextResponse.json({ success: false, error: "Unknown event reference." }, { status: 400 });
    }

    const referenceId = generateReferenceCode("GLM-RSVP");

    return NextResponse.json(
      {
        success: true,
        referenceId,
        message: `You're registered for ${event.titleEn}.`,
        data: {
          referenceId,
          eventId: event.id,
          eventTitleEn: event.titleEn,
          eventTitleAm: event.titleAm,
          dateRangeEn: event.dateRangeEn,
          locationEn: event.locationEn,
          attendanceMode: rsvp.attendanceMode,
          fullName: rsvp.fullName,
          email: rsvp.email,
          submittedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch {
    return serverErrorResponse();
  }
}
