import { NextResponse } from "next/server";
import { rateLimitGuard, readJsonBody, serverErrorResponse, validateBody } from "@/lib/api/guards";
import { RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { getEventRegisteredCounts, insertEvent, listEvents } from "@/lib/db";
import { hasAdminSession } from "@/lib/adminAuth";
import { newEventSchema } from "@/lib/validations";

/**
 * Live event list + registered counts, for the homepage Upcoming
 * Events cards. `events` is the dynamic source of truth (seeded once
 * from `UPCOMING_EVENTS_2026`, editable through the Admin Portal) —
 * `counts` is the "X registered" badge, derived from real RSVPs.
 */
export async function GET(request: Request) {
  const limited = rateLimitGuard(request, "events-read", RATE_LIMIT_PRESETS.liveCounters);
  if (limited) return limited;

  try {
    const [events, counts] = await Promise.all([listEvents(), getEventRegisteredCounts()]);
    return NextResponse.json(
      { success: true, message: "Upcoming events.", data: { events, counts } },
      { status: 200 }
    );
  } catch {
    return serverErrorResponse();
  }
}

/** Admin-only: adds a new upcoming event, which appears on the
 *  homepage immediately (next `GET /api/events` poll) and becomes a
 *  valid RSVP target right away. */
export async function POST(request: Request) {
  const limited = rateLimitGuard(request, "admin-action", RATE_LIMIT_PRESETS.adminAction);
  if (limited) return limited;

  if (!(await hasAdminSession())) {
    return NextResponse.json({ success: false, error: "Not signed in." }, { status: 401 });
  }

  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;

  try {
    const validated = validateBody(newEventSchema, parsed.body);
    if (!validated.ok) return validated.response;

    // See the note in `/api/prayer` — `.default()` fields narrow back
    // to `T | undefined` through `validateBody`'s generic even though a
    // default guarantees they're always defined at runtime.
    const event = await insertEvent({
      ...validated.data,
      isLiveStreamed: Boolean(validated.data.isLiveStreamed),
    });
    return NextResponse.json({ success: true, message: "Event added.", data: event }, { status: 200 });
  } catch {
    return serverErrorResponse();
  }
}
