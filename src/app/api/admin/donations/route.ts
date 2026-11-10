import { NextResponse } from "next/server";
import { rateLimitGuard, readJsonBody, serverErrorResponse, validateBody } from "@/lib/api/guards";
import { RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { hasAdminSession } from "@/lib/adminAuth";
import { insertManualDonation, updateDonation } from "@/lib/db";
import { manualDonationSchema, updateDonationStatusSchema } from "@/lib/validations";
import { generateReferenceCode } from "@/lib/referenceCode";

/**
 * Admin-only Stewardship Ledger actions: logging an offline/manual gift
 * (a mailed check, a wire transfer, cash counted after a Sunday
 * offering) directly into the same unified ledger `/api/give` writes
 * to, pre-marked `completed` since staff are recording money already
 * in hand.
 */
export async function POST(request: Request) {
  const limited = rateLimitGuard(request, "admin-action", RATE_LIMIT_PRESETS.adminAction);
  if (limited) return limited;

  if (!(await hasAdminSession())) {
    return NextResponse.json({ success: false, error: "Not signed in." }, { status: 401 });
  }

  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;

  try {
    const validated = validateBody(manualDonationSchema, parsed.body);
    if (!validated.ok) return validated.response;
    const data = validated.data;

    const donation = await insertManualDonation({
      referenceCode: generateReferenceCode("GLM"),
      donorName: data.donorName,
      donorEmail: data.donorEmail,
      amountUsd: data.amountUsd,
      frequency: data.frequency,
      fund: data.fund,
      paymentMethod: data.paymentMethod,
      prayerNote: data.prayerNote,
    });
    return NextResponse.json({ success: true, message: "Manual gift recorded.", data: donation }, { status: 200 });
  } catch {
    return serverErrorResponse();
  }
}

/** Admin-only: toggles a donation between `pending` and `completed` —
 *  e.g. when a mailed check referenced in a "pending" record actually
 *  arrives at the office. */
export async function PATCH(request: Request) {
  const limited = rateLimitGuard(request, "admin-action", RATE_LIMIT_PRESETS.adminAction);
  if (limited) return limited;

  if (!(await hasAdminSession())) {
    return NextResponse.json({ success: false, error: "Not signed in." }, { status: 401 });
  }

  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;

  try {
    const validated = validateBody(updateDonationStatusSchema, parsed.body);
    if (!validated.ok) return validated.response;

    const { id, status } = validated.data;
    const updated = await updateDonation(
      { id },
      { status, completedAt: status === "completed" ? new Date().toISOString() : undefined }
    );
    if (!updated) {
      return NextResponse.json({ success: false, error: "Unknown donation." }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Donation status updated.", data: updated }, { status: 200 });
  } catch {
    return serverErrorResponse();
  }
}
