import { NextResponse } from "next/server";
import { contactPrayerSchema } from "@/lib/validations";
import { RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { rateLimitGuard, readJsonBody, serverErrorResponse, validateBody } from "@/lib/api/guards";
import { generateReferenceCode } from "@/lib/referenceCode";
import { HQ_EMAIL, DC_EMAIL } from "@/data/locations";

/**
 * Prayer request / pastoral counseling / ministry-team / general
 * contact form. Validates with `contactPrayerSchema` and routes the
 * inquiry to the Addis Ababa HQ or Washington, D.C. office inbox.
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
