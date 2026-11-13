import { NextResponse } from "next/server";
import { rateLimitGuard, readJsonBody, serverErrorResponse, validateBody } from "@/lib/api/guards";
import { RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { hasAdminSession } from "@/lib/adminAuth";
import { addNewsUpdate, deleteNewsUpdate, listNewsUpdates, updateNewsUpdate } from "@/lib/db";
import { newNewsHighlightSchema, updateNewsHighlightSchema } from "@/lib/validations";

/**
 * Live "Recent Updates & Highlights" list — every add/edit/pin/delete
 * made in the Admin Portal shows up on the homepage immediately. Public;
 * ordered with `isPinnedLeadStory` first, then newest first.
 */
export async function GET(request: Request) {
  const limited = rateLimitGuard(request, "updates-read", RATE_LIMIT_PRESETS.liveCounters);
  if (limited) return limited;

  try {
    const updates = await listNewsUpdates();
    return NextResponse.json(
      { success: true, message: "Church updates.", data: { updates } },
      { status: 200 }
    );
  } catch {
    return serverErrorResponse();
  }
}

/** Admin-only: publishes a new church update/highlight. Checking "Pin
 *  as #1 Lead Highlight Story" atomically unsets that flag on every
 *  other update first. */
export async function POST(request: Request) {
  const limited = rateLimitGuard(request, "admin-action", RATE_LIMIT_PRESETS.adminAction);
  if (limited) return limited;

  if (!(await hasAdminSession())) {
    return NextResponse.json({ success: false, error: "Not signed in." }, { status: 401 });
  }

  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;

  try {
    const validated = validateBody(newNewsHighlightSchema, parsed.body, ["contentEn", "contentAm"]);
    if (!validated.ok) return validated.response;

    const data = validated.data;
    const update = await addNewsUpdate({
      titleEn: data.titleEn,
      titleAm: data.titleAm || data.titleEn,
      category: data.category,
      summaryEn: data.summaryEn,
      summaryAm: data.summaryAm || data.summaryEn,
      contentEn: data.contentEn,
      contentAm: data.contentAm || data.contentEn,
      imageUrl: data.imageUrl,
      videoUrl: data.videoUrl || undefined,
      locationLabel: data.locationLabel,
      publishedDateLabel: data.publishedDateLabel,
      isPinnedLeadStory: Boolean(data.isPinnedLeadStory),
    });
    return NextResponse.json({ success: true, message: "Church update published.", data: update }, { status: 200 });
  } catch {
    return serverErrorResponse();
  }
}

/** Admin-only: edits an existing update, or toggles it as the #1 Lead
 *  Highlight Story. */
export async function PUT(request: Request) {
  const limited = rateLimitGuard(request, "admin-action", RATE_LIMIT_PRESETS.adminAction);
  if (limited) return limited;

  if (!(await hasAdminSession())) {
    return NextResponse.json({ success: false, error: "Not signed in." }, { status: 401 });
  }

  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;

  try {
    const validated = validateBody(updateNewsHighlightSchema, parsed.body, ["contentEn", "contentAm"]);
    if (!validated.ok) return validated.response;

    const { id, ...patch } = validated.data;
    const updated = await updateNewsUpdate(id, patch);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Unknown update." }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Update saved.", data: updated }, { status: 200 });
  } catch {
    return serverErrorResponse();
  }
}

/** Admin-only: deletes a church update by `id` (query param). */
export async function DELETE(request: Request) {
  const limited = rateLimitGuard(request, "admin-action", RATE_LIMIT_PRESETS.adminAction);
  if (limited) return limited;

  if (!(await hasAdminSession())) {
    return NextResponse.json({ success: false, error: "Not signed in." }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ success: false, error: "Missing update id." }, { status: 400 });
  }

  try {
    const deleted = await deleteNewsUpdate(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Unknown update." }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Update deleted." }, { status: 200 });
  } catch {
    return serverErrorResponse();
  }
}
