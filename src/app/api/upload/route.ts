import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { rateLimitGuard, serverErrorResponse } from "@/lib/api/guards";
import { RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { hasAdminSession } from "@/lib/adminAuth";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "books");

function sanitizeFilenameStem(name: string): string {
  const stem = name.replace(/\.[^.]+$/, "");
  const cleaned = stem.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return cleaned.slice(0, 60) || "cover";
}

/**
 * Admin-only book cover upload: accepts a single image file
 * (`multipart/form-data`, field name `file`) up to 5 MB, and writes it
 * to `public/uploads/books/<timestamp>-<name>.<ext>` so the Admin
 * Portal gets an instant, self-hosted image URL with no external
 * image host required.
 *
 * On a read-only filesystem (e.g. a deployed serverless function,
 * where `public/` is immutable build output rather than a writable
 * disk) the write fails every time, so this falls back to returning
 * the file as a `data:` URI instead. That still gives the admin a
 * working, instantly-previewable cover; it just lives inline in the
 * record's `data` column in Postgres (see `src/lib/db.ts`) rather than
 * as a standalone static file.
 */
export async function POST(request: Request) {
  const limited = rateLimitGuard(request, "admin-action", RATE_LIMIT_PRESETS.adminAction);
  if (limited) return limited;

  if (!(await hasAdminSession())) {
    return NextResponse.json({ success: false, error: "Not signed in." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid upload." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: "No file provided." }, { status: 400 });
  }

  const extension = ALLOWED_MIME_TYPES[file.type];
  if (!extension) {
    return NextResponse.json(
      { success: false, error: "Only JPG, PNG, or WEBP images are allowed." },
      { status: 400 }
    );
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ success: false, error: "Image must be 5 MB or smaller." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${randomUUID().slice(0, 8)}-${sanitizeFilenameStem(file.name)}.${extension}`;

    try {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);
      return NextResponse.json({ success: true, imageUrl: `/uploads/books/${filename}` }, { status: 200 });
    } catch (writeError) {
      console.error("[upload] Filesystem write failed, falling back to a data URI.", writeError);
      const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;
      return NextResponse.json({ success: true, imageUrl: dataUri }, { status: 200 });
    }
  } catch {
    return serverErrorResponse();
  }
}
