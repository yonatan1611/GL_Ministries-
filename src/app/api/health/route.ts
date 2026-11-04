import { NextResponse } from "next/server";

/** Lightweight liveness check for uptime monitoring and deploy verification. */
export async function GET() {
  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
}
