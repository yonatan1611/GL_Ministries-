import { NextResponse } from "next/server";
import { rateLimitGuard, readJsonBody, serverErrorResponse, validateBody } from "@/lib/api/guards";
import { RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { hasAdminSession } from "@/lib/adminAuth";
import { deleteSermon, findSermonByYoutubeId, insertSermon, listSermons, updateSermon } from "@/lib/db";
import { newSermonSchema, updateSermonSchema } from "@/lib/validations";
import { extractYoutubeVideoId, fetchYoutubeOEmbed } from "@/lib/youtube";
import { slugify } from "@/lib/utils";

/**
 * Live sermon catalog — the curated `SERMONS` plus anything added
 * through the Admin Portal (one-click YouTube sync or manual add).
 * `GET` is public (the sermons page reads it); `POST` (manual add) is
 * admin-only.
 */
export async function GET(request: Request) {
  const limited = rateLimitGuard(request, "sermons-read", RATE_LIMIT_PRESETS.liveCounters);
  if (limited) return limited;

  try {
    const sermons = await listSermons();
    return NextResponse.json({ success: true, message: "Sermon catalog.", data: { sermons } }, { status: 200 });
  } catch {
    return serverErrorResponse();
  }
}

/** Admin-only: adds one sermon by YouTube URL/ID. Missing title/
 *  speaker are filled in from YouTube's own oEmbed metadata rather
 *  than requiring the office to retype what's already on the video. */
export async function POST(request: Request) {
  const limited = rateLimitGuard(request, "admin-action", RATE_LIMIT_PRESETS.adminAction);
  if (limited) return limited;

  if (!(await hasAdminSession())) {
    return NextResponse.json({ success: false, error: "Not signed in." }, { status: 401 });
  }

  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;

  try {
    const validated = validateBody(newSermonSchema, parsed.body);
    if (!validated.ok) return validated.response;
    const input = validated.data;

    const youtubeId = extractYoutubeVideoId(input.youtubeUrlOrId);
    if (!youtubeId) {
      return NextResponse.json(
        { success: false, error: "Couldn't read a YouTube video id from that URL." },
        { status: 400 }
      );
    }

    const existing = await findSermonByYoutubeId(youtubeId);
    if (existing) {
      return NextResponse.json({ success: false, error: "This video is already in the catalog." }, { status: 409 });
    }

    let titleEn = input.titleEn;
    let speakerEn = input.speakerEn;
    if (!titleEn || !speakerEn) {
      const oEmbed = await fetchYoutubeOEmbed(youtubeId);
      titleEn = titleEn || oEmbed?.title || "Untitled Teaching";
      speakerEn = speakerEn || oEmbed?.authorName || "Gospel Light Ministries";
    }

    const sermon = await insertSermon({
      slug: slugify(titleEn),
      titleEn,
      titleAm: input.titleAm || titleEn,
      speakerEn,
      speakerAm: input.speakerAm || speakerEn,
      // See the note in /api/prayer — `.default()` fields narrow back
      // to `T | undefined` through validateBody's generic.
      topic: input.topic ?? "New Upload",
      channelSource: input.channelSource ?? "DC",
      yearLabel: input.yearLabel || String(new Date().getFullYear()),
      youtubeId,
      summaryEn: input.summaryEn || "",
      summaryAm: input.summaryAm || "",
    });

    return NextResponse.json({ success: true, message: "Sermon added.", data: sermon }, { status: 200 });
  } catch {
    return serverErrorResponse();
  }
}

/** Admin-only: edits an existing sermon's details (title, speaker,
 *  topic, channel, scripture, summary) or toggles its homepage
 *  "featured" flag. */
export async function PUT(request: Request) {
  const limited = rateLimitGuard(request, "admin-action", RATE_LIMIT_PRESETS.adminAction);
  if (limited) return limited;

  if (!(await hasAdminSession())) {
    return NextResponse.json({ success: false, error: "Not signed in." }, { status: 401 });
  }

  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;

  try {
    const validated = validateBody(updateSermonSchema, parsed.body);
    if (!validated.ok) return validated.response;

    const { id, ...patch } = validated.data;
    const updated = await updateSermon(id, patch);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Unknown sermon." }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Sermon updated.", data: updated }, { status: 200 });
  } catch {
    return serverErrorResponse();
  }
}

/** Admin-only: removes a sermon from the catalog by `id` (query param). */
export async function DELETE(request: Request) {
  const limited = rateLimitGuard(request, "admin-action", RATE_LIMIT_PRESETS.adminAction);
  if (limited) return limited;

  if (!(await hasAdminSession())) {
    return NextResponse.json({ success: false, error: "Not signed in." }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ success: false, error: "Missing sermon id." }, { status: 400 });
  }

  try {
    const deleted = await deleteSermon(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Unknown sermon." }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Sermon deleted." }, { status: 200 });
  } catch {
    return serverErrorResponse();
  }
}
