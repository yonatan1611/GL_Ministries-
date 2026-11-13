import { NextResponse } from "next/server";
import { rateLimitGuard, readJsonBody, serverErrorResponse, validateBody } from "@/lib/api/guards";
import { RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { hasAdminSession } from "@/lib/adminAuth";
import { getSiteSettings, listImpactStats, updateImpactStat, updateSiteSettings } from "@/lib/db";
import { updateImpactStatSchema, updateSiteSettingsSchema } from "@/lib/validations";

/**
 * Site-wide settings the Admin Portal can edit without a code change:
 * the Hero banner announcement (title/subtitle/featured video) and the
 * "Storytelling by the Numbers" impact figures (Section 5). Public
 * read — both feed server-rendered homepage sections.
 */
export async function GET(request: Request) {
  const limited = rateLimitGuard(request, "settings-read", RATE_LIMIT_PRESETS.liveCounters);
  if (limited) return limited;

  try {
    const [siteSettings, impactStats] = await Promise.all([getSiteSettings(), listImpactStats()]);
    return NextResponse.json(
      { success: true, message: "Site settings.", data: { siteSettings, impactStats } },
      { status: 200 }
    );
  } catch {
    return serverErrorResponse();
  }
}

/** Admin-only: updates the Hero announcement banner fields, an impact
 *  stat, or both in one request (whichever keys are present). */
export async function PUT(request: Request) {
  const limited = rateLimitGuard(request, "admin-action", RATE_LIMIT_PRESETS.adminAction);
  if (limited) return limited;

  if (!(await hasAdminSession())) {
    return NextResponse.json({ success: false, error: "Not signed in." }, { status: 401 });
  }

  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;
  const body = parsed.body as Record<string, unknown>;

  try {
    const results: { siteSettings?: unknown; impactStat?: unknown } = {};

    if (body.siteSettings) {
      const validated = validateBody(updateSiteSettingsSchema, body.siteSettings);
      if (!validated.ok) return validated.response;
      results.siteSettings = await updateSiteSettings(validated.data);
    }

    if (body.impactStat) {
      const validated = validateBody(updateImpactStatSchema, body.impactStat);
      if (!validated.ok) return validated.response;
      const { id, ...patch } = validated.data;
      const updated = await updateImpactStat(id, patch);
      if (!updated) {
        return NextResponse.json({ success: false, error: "Unknown impact stat." }, { status: 404 });
      }
      results.impactStat = updated;
    }

    if (!body.siteSettings && !body.impactStat) {
      return NextResponse.json(
        { success: false, error: "Provide siteSettings and/or impactStat to update." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: "Settings updated.", data: results }, { status: 200 });
  } catch {
    return serverErrorResponse();
  }
}
