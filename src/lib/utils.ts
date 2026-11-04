import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Locale } from "@/types/ministry";

/** Merges Tailwind class lists, resolving conflicting utility classes
 *  (e.g. `cn("px-2", condition && "px-4")`) in favor of the last one. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type { Locale };
export const SUPPORTED_LOCALES: readonly Locale[] = ["en", "am"];

export const DEFAULT_LOCALE: Locale = "en";

export function isSupportedLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/** Reads the active locale off a `/en/...` or `/am/...` pathname,
 *  falling back to the default locale for unprefixed or unknown paths. */
export function getLocaleFromPathname(pathname: string): Locale {
  const segment = pathname.split("/").filter(Boolean)[0];
  return segment && isSupportedLocale(segment) ? segment : DEFAULT_LOCALE;
}

/** Parses a `"MM:SS"` or `"H:MM:SS"` duration label (e.g. `"54:20"`,
 *  `"1:02:15"`) into whole seconds. Returns 0 for an unparseable value. */
export function parseDurationToSeconds(duration: string): number {
  const parts = duration.split(":").map(Number);
  if (parts.some((part) => Number.isNaN(part))) return 0;
  if (parts.length === 3) {
    const [hours = 0, minutes = 0, seconds = 0] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }
  if (parts.length === 2) {
    const [minutes = 0, seconds = 0] = parts;
    return minutes * 60 + seconds;
  }
  return 0;
}

/** Formats a whole-seconds count back into a `"MM:SS"` / `"H:MM:SS"` label. */
export function formatSecondsToDuration(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  const paddedSeconds = String(seconds).padStart(2, "0");
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${paddedSeconds}`;
  }
  return `${minutes}:${paddedSeconds}`;
}

/** Rewrites a `/en/...` or `/am/...` pathname to the target locale,
 *  preserving the rest of the path so language switching never drops
 *  the user's current page. */
export function swapLocaleInPathname(pathname: string, targetLocale: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return `/${targetLocale}`;
  segments[0] = targetLocale;
  return `/${segments.join("/")}`;
}
