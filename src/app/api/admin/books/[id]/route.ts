import { NextResponse } from "next/server";
import { rateLimitGuard, readJsonBody, serverErrorResponse, validateBody } from "@/lib/api/guards";
import { RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { hasAdminSession } from "@/lib/adminAuth";
import { updateBook } from "@/lib/db";
import { updateBookSchema } from "@/lib/validations";

/** Admin-only: edits a book's print/PDF price or toggles it as the
 *  current Monthly Partner Offer. Every checkout, giving-portal
 *  banner, and PDF certificate reads the live catalog, so this takes
 *  effect immediately — no redeploy. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimitGuard(request, "admin-action", RATE_LIMIT_PRESETS.adminAction);
  if (limited) return limited;

  if (!(await hasAdminSession())) {
    return NextResponse.json({ success: false, error: "Not signed in." }, { status: 401 });
  }

  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;

  try {
    const validated = validateBody(updateBookSchema, parsed.body);
    if (!validated.ok) return validated.response;

    const { id } = await params;
    const updated = await updateBook(id, validated.data);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Unknown book." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Book updated.", data: updated }, { status: 200 });
  } catch {
    return serverErrorResponse();
  }
}
