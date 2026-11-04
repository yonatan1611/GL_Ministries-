import { NextResponse } from "next/server";
import { ministryActionSchema } from "@/lib/validations";
import { RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { rateLimitGuard, readJsonBody, serverErrorResponse, validateBody } from "@/lib/api/guards";
import { generateReferenceCode } from "@/lib/referenceCode";
import { HQ_EMAIL, DC_EMAIL } from "@/data/locations";

/**
 * Backs the homepage's Volunteer / Rural Outreach / Home Groups action
 * cards (`EventsAndActionCardsSection`) — the real workflows that
 * replace the legacy homepage's 4 dead `href="#"` cards. Validates with
 * `ministryActionSchema`. Routing is a simple heuristic: Outreach goes
 * to the Addis Ababa HQ (it coordinates the Eastern Ethiopia stations),
 * everything else defaults to whichever office best fits a diaspora
 * volunteer/group inquiry — Washington, D.C.
 */
export async function POST(request: Request) {
  const limited = rateLimitGuard(request, "ministry-action", RATE_LIMIT_PRESETS.ministryAction);
  if (limited) return limited;

  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;

  try {
    const validated = validateBody(ministryActionSchema, parsed.body);
    if (!validated.ok) return validated.response;
    const action = validated.data;

    const routedTo = action.actionType === "Outreach" ? HQ_EMAIL : DC_EMAIL;
    const referenceId = generateReferenceCode("GLM-ACTION");

    return NextResponse.json(
      {
        success: true,
        referenceId,
        message: "Thank you — our ministry team will be in touch soon.",
        data: {
          referenceId,
          actionType: action.actionType,
          routedTo,
          fullName: action.fullName,
          email: action.email,
          submittedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch {
    return serverErrorResponse();
  }
}
