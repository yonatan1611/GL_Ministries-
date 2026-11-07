"use client";

import { useState } from "react";
import { HandHeart } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import type { Locale } from "@/lib/utils";

export interface PrayerWallRequest {
  id: string;
  fullName: string;
  category: string;
  requestText: string;
  prayedCount: number;
  createdAt: string;
}

export interface PrayerWallStats {
  totalPrayerArmyMembers: number;
  totalPrayersOffered: number;
  recentRequests: PrayerWallRequest[];
}

/**
 * Public prayer wall — the most recent non-confidential requests from
 * `GET /api/prayer`, each with a real "🙏 I Prayed for This" button
 * wired to `PATCH /api/prayer`. Updates its own count optimistically
 * so the tally feels instant; a failed request rolls the number back.
 */
export function PrayerWall({ locale, stats }: { locale: Locale; stats: PrayerWallStats | null }) {
  const dict = getDictionary(locale);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [prayedIds, setPrayedIds] = useState<Set<string>>(new Set());

  async function handlePray(id: string) {
    if (prayedIds.has(id)) return;
    setPrayedIds((prev) => new Set(prev).add(id));
    setCounts((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));

    try {
      const response = await fetch("/api/prayer", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error("Request failed");
    } catch {
      // Roll back the optimistic update on failure.
      setPrayedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setCounts((prev) => ({ ...prev, [id]: Math.max((prev[id] ?? 1) - 1, 0) }));
    }
  }

  if (!stats) return null;

  return (
    <div className="mt-6">
      <p className="text-sm font-semibold text-navy-800">{dict.prayerArmySection.wallTitle}</p>

      {stats.recentRequests.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">{dict.prayerArmySection.wallEmpty}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {stats.recentRequests.map((request) => {
            const liveCount = request.prayedCount + (counts[request.id] ?? 0);
            const hasPrayed = prayedIds.has(request.id);
            return (
              <li key={request.id} className="border border-[#E6DFD3] bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                      {dict.prayerModal.categories[
                        request.category as keyof typeof dict.prayerModal.categories
                      ] ?? request.category}
                    </p>
                    <p className="mt-1 text-sm text-navy-900">{request.fullName}</p>
                  </div>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{request.requestText}</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">
                    {liveCount > 0
                      ? dict.prayerArmySection.prayedCountTemplate.replace("{count}", String(liveCount))
                      : null}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePray(request.id)}
                    disabled={hasPrayed}
                    className="flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 disabled:cursor-default disabled:opacity-60"
                  >
                    <HandHeart className="h-3.5 w-3.5" aria-hidden="true" />
                    {dict.prayerArmySection.prayedButtonLabel}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
