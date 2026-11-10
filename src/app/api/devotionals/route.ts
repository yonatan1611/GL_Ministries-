import { NextResponse } from "next/server";
import { rateLimitGuard, readJsonBody, serverErrorResponse, validateBody } from "@/lib/api/guards";
import { RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { hasAdminSession } from "@/lib/adminAuth";
import { addDevotional, deleteDevotional, listDevotionals, setFeaturedDevotional, updateDevotional } from "@/lib/db";
import { newDevotionalSchema, updateDevotionalSchema } from "@/lib/validations";

/**
 * Live Daily Scripture Devotional list — every add/edit/feature/delete
 * made in the Admin Portal shows up here immediately. Public; the
 * homepage "Today's Key Scripture" panel reads from it instead of a
 * static import, with the `isFeaturedToday` entry always sorted first.
 */
export async function GET(request: Request) {
  const limited = rateLimitGuard(request, "devotionals-read", RATE_LIMIT_PRESETS.liveCounters);
  if (limited) return limited;

  try {
    const devotionals = await listDevotionals();
    return NextResponse.json(
      { success: true, message: "Daily Scripture devotionals.", data: { devotionals } },
      { status: 200 }
    );
  } catch {
    return serverErrorResponse();
  }
}

/** Admin-only: publishes a new devotional. Checking "Set immediately
 *  as Today's Key Scripture" atomically unsets that flag on every
 *  other entry, so the homepage always shows exactly one. */
export async function POST(request: Request) {
  const limited = rateLimitGuard(request, "admin-action", RATE_LIMIT_PRESETS.adminAction);
  if (limited) return limited;

  if (!(await hasAdminSession())) {
    return NextResponse.json({ success: false, error: "Not signed in." }, { status: 401 });
  }

  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;

  try {
    const validated = validateBody(newDevotionalSchema, parsed.body);
    if (!validated.ok) return validated.response;

    const devotional = await addDevotional({
      ...validated.data,
      titleEn: validated.data.titleEn ?? "",
      titleAm: validated.data.titleAm ?? "",
      scriptureRefAm: validated.data.scriptureRefAm ?? "",
      verseTextAm: validated.data.verseTextAm ?? "",
      reflectionAm: validated.data.reflectionAm ?? "",
      prayerDeclarationAm: validated.data.prayerDeclarationAm ?? "",
      authorEn: validated.data.authorEn || "Apostle Daniel Makonnen",
      authorAm: validated.data.authorAm || "ሐዋሪያው ዳንኤል መኮንን",
      isFeaturedToday: Boolean(validated.data.isFeaturedToday),
    });
    return NextResponse.json({ success: true, message: "Devotional published.", data: devotional }, { status: 200 });
  } catch {
    return serverErrorResponse();
  }
}

/** Admin-only: edits an existing devotional's text, or toggles it as
 *  Today's Key Scripture. Pass `{ id }` alone with `isFeaturedToday:
 *  true` to use this as the "Set as Today's Active Scripture" action. */
export async function PUT(request: Request) {
  const limited = rateLimitGuard(request, "admin-action", RATE_LIMIT_PRESETS.adminAction);
  if (limited) return limited;

  if (!(await hasAdminSession())) {
    return NextResponse.json({ success: false, error: "Not signed in." }, { status: 401 });
  }

  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;

  try {
    const validated = validateBody(updateDevotionalSchema, parsed.body);
    if (!validated.ok) return validated.response;

    const { id, ...patch } = validated.data;
    const isFeaturedOnlyToggle = Object.keys(patch).length === 1 && "isFeaturedToday" in patch;
    const updated = isFeaturedOnlyToggle && patch.isFeaturedToday
      ? await setFeaturedDevotional(id)
      : await updateDevotional(id, patch);

    if (!updated) {
      return NextResponse.json({ success: false, error: "Unknown devotional." }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Devotional updated.", data: updated }, { status: 200 });
  } catch {
    return serverErrorResponse();
  }
}

/** Admin-only: deletes a devotional by `id` (query param). Refuses to
 *  remove the last remaining entry. */
export async function DELETE(request: Request) {
  const limited = rateLimitGuard(request, "admin-action", RATE_LIMIT_PRESETS.adminAction);
  if (limited) return limited;

  if (!(await hasAdminSession())) {
    return NextResponse.json({ success: false, error: "Not signed in." }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ success: false, error: "Missing devotional id." }, { status: 400 });
  }

  try {
    const deleted = await deleteDevotional(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Unknown devotional, or it's the only one left." },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, message: "Devotional deleted." }, { status: 200 });
  } catch {
    return serverErrorResponse();
  }
}
