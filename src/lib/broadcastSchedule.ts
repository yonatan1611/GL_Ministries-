/**
 * Timezone-aware weekly broadcast schedule for the two live services
 * (Aware International HQ in Addis Ababa, EAT / UTC+3; the Washington,
 * D.C. Sanctuary, EST / UTC-5) — drives the Live Broadcast tab's
 * "LIVE NOW" badge and next-service countdown on `/[locale]/sermons`.
 *
 * Each broadcast's wall-clock day/time is fixed; we never need the
 * visitor's own timezone because we always reason in UTC and shift by a
 * fixed offset, sidestepping DST entirely (the ministry's own published
 * schedule already states fixed EAT/EST labels, not local-DST-aware
 * ones).
 */

export interface BroadcastWindow {
  key: "hq-sunday" | "hq-wednesday" | "dc-sunday" | "dc-wednesday";
  /** 0 = Sunday ... 6 = Saturday, in the broadcast's own local timezone. */
  dayOfWeek: number;
  startHour: number;
  startMinute: number;
  durationMinutes: number;
  /** Fixed UTC offset in hours (e.g. +3 for EAT, -5 for EST). */
  utcOffsetHours: number;
}

export const BROADCAST_WINDOWS: BroadcastWindow[] = [
  { key: "hq-sunday", dayOfWeek: 0, startHour: 9, startMinute: 0, durationMinutes: 210, utcOffsetHours: 3 },
  { key: "hq-wednesday", dayOfWeek: 3, startHour: 17, startMinute: 30, durationMinutes: 90, utcOffsetHours: 3 },
  { key: "dc-sunday", dayOfWeek: 0, startHour: 10, startMinute: 0, durationMinutes: 180, utcOffsetHours: -5 },
  { key: "dc-wednesday", dayOfWeek: 3, startHour: 19, startMinute: 0, durationMinutes: 90, utcOffsetHours: -5 },
];

const DAY_MS = 24 * 60 * 60 * 1000;

/** Shifts `instant` by the broadcast's fixed UTC offset, then reads the
 *  result's UTC fields — a standard trick for getting "local" wall-clock
 *  fields for a fixed-offset timezone without a timezone library. */
function toLocalWallClock(instant: Date, utcOffsetHours: number): Date {
  return new Date(instant.getTime() + utcOffsetHours * 60 * 60 * 1000);
}

function windowStartInstant(window: BroadcastWindow, referenceLocalMidnight: Date): Date {
  const localStart = new Date(referenceLocalMidnight.getTime());
  localStart.setUTCHours(window.startHour, window.startMinute, 0, 0);
  // Convert back from the broadcast's local wall-clock to a real UTC instant.
  return new Date(localStart.getTime() - window.utcOffsetHours * 60 * 60 * 1000);
}

export interface BroadcastStatus {
  isLiveNow: boolean;
  activeWindow: BroadcastWindow | null;
  nextWindow: BroadcastWindow | null;
  nextStartInstant: Date | null;
  minutesUntilNext: number | null;
}

/** Determines whether any broadcast window is live right now, and finds
 *  the next upcoming one otherwise. */
export function getBroadcastStatus(now: Date = new Date()): BroadcastStatus {
  let activeWindow: BroadcastWindow | null = null;
  let nextWindow: BroadcastWindow | null = null;
  let nextStartInstant: Date | null = null;

  for (const window of BROADCAST_WINDOWS) {
    const localNow = toLocalWallClock(now, window.utcOffsetHours);
    const localMidnight = new Date(localNow.getTime());
    localMidnight.setUTCHours(0, 0, 0, 0);
    const localDayOfWeek = localNow.getUTCDay();
    const dayDelta = (window.dayOfWeek - localDayOfWeek + 7) % 7;

    // Check this week's (or today's) occurrence first; only fall through
    // to next week's if this week's has already ended.
    for (const daysAhead of [dayDelta, dayDelta + 7]) {
      const candidateLocalMidnight = new Date(localMidnight.getTime() + daysAhead * DAY_MS);
      const startInstant = windowStartInstant(window, candidateLocalMidnight);
      const endInstant = new Date(startInstant.getTime() + window.durationMinutes * 60 * 1000);

      if (now >= startInstant && now < endInstant) {
        activeWindow = window;
        break;
      }
      if (startInstant > now) {
        if (!nextStartInstant || startInstant < nextStartInstant) {
          nextWindow = window;
          nextStartInstant = startInstant;
        }
        break;
      }
      // This occurrence already ended — loop once more for next week's.
    }
    if (activeWindow) break;
  }

  const minutesUntilNext = nextStartInstant
    ? Math.max(0, Math.round((nextStartInstant.getTime() - now.getTime()) / 60000))
    : null;

  return { isLiveNow: Boolean(activeWindow), activeWindow, nextWindow, nextStartInstant, minutesUntilNext };
}

/** Formats a minute count as a short "Xd Yh Zm" style countdown label. */
export function formatCountdown(totalMinutes: number): string {
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  return parts.join(" ");
}
