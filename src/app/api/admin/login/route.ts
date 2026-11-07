import { NextResponse } from "next/server";
import { rateLimitGuard, readJsonBody, serverErrorResponse } from "@/lib/api/guards";
import { RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { createAdminSession, verifyPasscode } from "@/lib/adminAuth";

/** Verifies the Admin Portal passcode and, on success, sets a signed
 *  session cookie. Tightly rate-limited — see `RATE_LIMIT_PRESETS.adminLogin`. */
export async function POST(request: Request) {
  const limited = rateLimitGuard(request, "admin-login", RATE_LIMIT_PRESETS.adminLogin);
  if (limited) return limited;

  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;

  try {
    const passcode =
      typeof parsed.body === "object" && parsed.body !== null
        ? (parsed.body as { passcode?: unknown }).passcode
        : null;

    if (typeof passcode !== "string" || !verifyPasscode(passcode)) {
      return NextResponse.json({ success: false, error: "Incorrect passcode." }, { status: 401 });
    }

    await createAdminSession();
    return NextResponse.json({ success: true, message: "Signed in." }, { status: 200 });
  } catch {
    return serverErrorResponse();
  }
}
