import { NextResponse } from "next/server";
import { rateLimitGuard, readJsonBody, serverErrorResponse, validateBody } from "@/lib/api/guards";
import { RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { hasAdminSession } from "@/lib/adminAuth";
import { addLocation, deleteLocation, listLocations, updateLocation } from "@/lib/db";
import { newLocationSchema, updateLocationSchema } from "@/lib/validations";

/**
 * Live branch directory — every service-time/contact edit or new
 * branch added in the Admin Portal shows up here immediately. Public;
 * `/[locale]/locations` reads from it instead of the static `LOCATIONS`
 * import.
 */
export async function GET(request: Request) {
  const limited = rateLimitGuard(request, "locations-read", RATE_LIMIT_PRESETS.liveCounters);
  if (limited) return limited;

  try {
    const locations = await listLocations();
    return NextResponse.json({ success: true, message: "Branch directory.", data: { locations } }, { status: 200 });
  } catch {
    return serverErrorResponse();
  }
}

/** Admin-only: adds a new branch to the directory. */
export async function POST(request: Request) {
  const limited = rateLimitGuard(request, "admin-action", RATE_LIMIT_PRESETS.adminAction);
  if (limited) return limited;

  if (!(await hasAdminSession())) {
    return NextResponse.json({ success: false, error: "Not signed in." }, { status: 401 });
  }

  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;

  try {
    const validated = validateBody(newLocationSchema, parsed.body);
    if (!validated.ok) return validated.response;

    const data = validated.data;
    const location = await addLocation({
      synod: data.synod,
      nameEn: data.nameEn,
      nameAm: data.nameAm || data.nameEn,
      city: data.city,
      type: data.type,
      detailsEn: data.detailsEn ?? "",
      detailsAm: data.detailsAm ?? "",
      address: data.address,
      phone: data.phone,
      email: data.email,
      serviceTimesEn: data.serviceTimesEn,
      serviceTimesAm: data.serviceTimesAm || data.serviceTimesEn,
    });
    return NextResponse.json({ success: true, message: "Branch added.", data: location }, { status: 200 });
  } catch {
    return serverErrorResponse();
  }
}

/** Admin-only: updates an existing branch's details. */
export async function PUT(request: Request) {
  const limited = rateLimitGuard(request, "admin-action", RATE_LIMIT_PRESETS.adminAction);
  if (limited) return limited;

  if (!(await hasAdminSession())) {
    return NextResponse.json({ success: false, error: "Not signed in." }, { status: 401 });
  }

  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;

  try {
    const validated = validateBody(updateLocationSchema, parsed.body);
    if (!validated.ok) return validated.response;

    const { id, ...patch } = validated.data;
    const updated = await updateLocation(id, patch);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Unknown branch." }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Branch updated.", data: updated }, { status: 200 });
  } catch {
    return serverErrorResponse();
  }
}

/** Admin-only: removes a branch from the directory by `id` (query param). */
export async function DELETE(request: Request) {
  const limited = rateLimitGuard(request, "admin-action", RATE_LIMIT_PRESETS.adminAction);
  if (limited) return limited;

  if (!(await hasAdminSession())) {
    return NextResponse.json({ success: false, error: "Not signed in." }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ success: false, error: "Missing branch id." }, { status: 400 });
  }

  try {
    const deleted = await deleteLocation(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Unknown branch." }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Branch deleted." }, { status: 200 });
  } catch {
    return serverErrorResponse();
  }
}
