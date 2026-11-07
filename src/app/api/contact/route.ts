import { NextResponse } from "next/server";
import { contactPrayerSchema } from "@/lib/validations";
import { RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { rateLimitGuard, readJsonBody, serverErrorResponse, validateBody } from "@/lib/api/guards";
import { generateReferenceCode } from "@/lib/referenceCode";
import { HQ_EMAIL, DC_EMAIL } from "@/data/locations";
import { insertRsvp } from "@/lib/db";

/**
 * Prayer request / pastoral counseling / ministry-team / general
 * contact form (also backs the "Plan Your Visit" CTA, submitted as a
 * General Inquiry). Validates with `contactPrayerSchema`, routes the
 * inquiry to the Addis Ababa HQ or Washington, D.C. office inbox, and
 * persists a real record so it's visible in the Admin Portal.
 */
export async function POST(request: Request) {
  const limited = rateLimitGuard(request, "contact", RATE_LIMIT_PRESETS.contact);
  if (limited) return limited;

  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;

  try {
    const validated = validateBody(contactPrayerSchema, parsed.body);
    if (!validated.ok) return validated.response;
    const inquiry = validated.data;

    const routedTo = inquiry.targetOffice === "addis@glministries.org" ? HQ_EMAIL : DC_EMAIL;
    const referenceId = generateReferenceCode("GLM-MSG");

    await insertRsvp({
      kind: "contact-inquiry",
      fullName: inquiry.fullName,
      email: inquiry.email,
      phone: inquiry.phone,
      details: { inquiryType: inquiry.inquiryType, targetOffice: inquiry.targetOffice, message: inquiry.message },
    });

    return NextResponse.json(
      {
        success: true,
        referenceId,
        message: "Thank you — our pastoral team will be in touch soon.",
        data: {
          referenceId,
          inquiryType: inquiry.inquiryType,
          routedTo,
          fullName: inquiry.fullName,
          email: inquiry.email,
          submittedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch {
    return serverErrorResponse();
  }
}
