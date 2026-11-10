"use client";

import { useMemo } from "react";
import {
  BookOpen,
  Flame,
  HandHeart,
  Mail,
  PlayCircle,
  Sparkles,
  Wallet,
} from "lucide-react";
import type { AdminSnapshot } from "@/components/admin/AdminPortalClient";
import { type AdminModuleId, type DateRangeFilter, isWithinDateRange } from "@/components/admin/AdminShell";
import { DONATION_FUNDS } from "@/lib/validations";

interface AdminOverviewModuleProps {
  snapshot: AdminSnapshot;
  dateRange: DateRangeFilter;
  onModuleChange: (id: AdminModuleId) => void;
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function KpiCard({
  icon: Icon,
  label,
  value,
  detail,
  onClick,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  detail?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="flex flex-col items-start gap-2 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-shadow enabled:hover:shadow-md disabled:cursor-default"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="font-display text-2xl font-bold text-navy-900">{value}</p>
      {detail && <p className="text-xs text-slate-500">{detail}</p>}
    </button>
  );
}

/** Horizontal bar chart — each row's bar width is proportional to the
 *  largest value in the set. Plain divs; no chart library. */
function BarRow({ label, value, max, formatted }: { label: string; value: number; max: number; formatted: string }) {
  const pct = max > 0 ? Math.max((value / max) * 100, value > 0 ? 2 : 0) : 0;
  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-navy-900">{formatted}</span>
      </div>
      <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-blue-600" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const DONUT_COLORS = ["#2563EB", "#F59E0B", "#10B981", "#8B5CF6", "#EF4444", "#64748B"];

/** Conic-gradient donut — a handful of named segments with percentages,
 *  rendered as pure CSS (no SVG/chart library). */
function DonutChart({ segments }: { segments: { label: string; value: number }[] }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  let cumulative = 0;
  const stops = segments.map((segment, index) => {
    const start = (cumulative / (total || 1)) * 360;
    cumulative += segment.value;
    const end = (cumulative / (total || 1)) * 360;
    return `${DONUT_COLORS[index % DONUT_COLORS.length]} ${start}deg ${end}deg`;
  });
  const background = total > 0 ? `conic-gradient(${stops.join(", ")})` : "#E2E8F0";

  return (
    <div className="flex items-center gap-5">
      <div
        className="h-28 w-28 shrink-0 rounded-full"
        style={{ background }}
        role="img"
        aria-label={segments.map((s) => `${s.label}: ${s.value}`).join(", ")}
      >
        <div className="relative left-[14%] top-[14%] flex h-[72%] w-[72%] items-center justify-center rounded-full bg-white">
          <span className="text-xs font-bold text-navy-900">{total}</span>
        </div>
      </div>
      <ul className="flex flex-col gap-1.5">
        {segments.map((segment, index) => (
          <li key={segment.label} className="flex items-center gap-2 text-xs text-slate-600">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }}
              aria-hidden="true"
            />
            {segment.label} ({segment.value})
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Executive Overview: 6 real-time KPI scorecards computed directly from
 * the live `AdminSnapshot` (no fabricated figures), three CSS/SVG-only
 * visual charts, and a unified recent-activity feed merged across every
 * collection. Every count respects the top bar's date-range filter
 * except roster/catalog sizes (sermon library, subscriber list, Prayer
 * Army membership), which are always shown as current totals — labeled
 * accordingly so the two kinds of numbers are never confused.
 */
export function AdminOverviewModule({ snapshot, dateRange, onModuleChange }: AdminOverviewModuleProps) {
  const inRange = useMemo(
    () => ({
      donations: snapshot.donations.filter((d) => isWithinDateRange(d.createdAt, dateRange)),
      bookOrders: snapshot.bookOrders.filter((o) => isWithinDateRange(o.createdAt, dateRange)),
      prayerRequests: snapshot.prayerRequests.filter((p) => isWithinDateRange(p.createdAt, dateRange)),
      rsvps: snapshot.rsvps.filter((r) => isWithinDateRange(r.createdAt, dateRange)),
      subscribers: snapshot.subscribers.filter((s) => isWithinDateRange(s.createdAt, dateRange)),
    }),
    [snapshot, dateRange]
  );

  const completedDonations = inRange.donations.filter((d) => d.status === "completed");
  const totalGivingUsd = completedDonations.reduce((sum, d) => sum + d.amountUsd, 0);
  const monthlyPartnerCount = snapshot.donations.filter(
    (d) => d.status === "completed" && d.frequency === "monthly"
  ).length;

  const momGrowthPct = useMemo(() => {
    const now = new Date();
    const thisMonthKey = monthKey(now);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthKey = monthKey(lastMonth);
    let thisMonthTotal = 0;
    let lastMonthTotal = 0;
    for (const d of snapshot.donations) {
      if (d.status !== "completed") continue;
      const key = monthKey(new Date(d.createdAt));
      if (key === thisMonthKey) thisMonthTotal += d.amountUsd;
      else if (key === lastMonthKey) lastMonthTotal += d.amountUsd;
    }
    if (lastMonthTotal === 0) return thisMonthTotal > 0 ? 100 : 0;
    return Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100);
  }, [snapshot.donations]);

  const completedOrders = inRange.bookOrders.filter((o) => o.paymentStatus === "completed");
  const bookRevenueUsd = completedOrders.reduce((sum, o) => sum + o.totalUsd, 0);
  const monthlyOfferClaims = inRange.donations.filter((d) => d.claimedMonthlyOffer).length;

  const prayedOverCount = inRange.prayerRequests.filter((p) => p.prayedOverByStaff).length;
  const prayedOverPct =
    inRange.prayerRequests.length > 0 ? Math.round((prayedOverCount / inRange.prayerRequests.length) * 100) : 0;
  const prayerArmyRosterSize = snapshot.prayerRequests.filter((p) => p.joinedPrayerArmy).length;

  const salvationCount = inRange.rsvps.filter((r) => r.kind === "salvation").length;
  const planVisitCount = inRange.rsvps.filter((r) => r.kind === "plan-your-visit").length;
  const eventRsvpCount = inRange.rsvps.filter((r) => r.kind === "event").length;

  const dcSermonCount = snapshot.sermons.filter((s) => s.channelSource === "DC").length;
  const ethiopiaSermonCount = snapshot.sermons.filter((s) => s.channelSource === "ETHIOPIA").length;

  const fundBreakdown = useMemo(() => {
    const totals = new Map<string, number>();
    for (const d of completedDonations) totals.set(d.fund, (totals.get(d.fund) ?? 0) + d.amountUsd);
    const max = Math.max(1, ...Array.from(totals.values()));
    return DONATION_FUNDS.map((fund) => ({ fund, amount: totals.get(fund) ?? 0, max }));
  }, [completedDonations]);

  const frequencySegments = useMemo(() => {
    const monthly = completedDonations.filter((d) => d.frequency !== "one-time").length;
    const oneTime = completedDonations.filter((d) => d.frequency === "one-time").length;
    return [
      { label: "Monthly Covenant Partners", value: monthly },
      { label: "One-Time Gifts", value: oneTime },
    ];
  }, [completedDonations]);

  const paymentRailSegments = useMemo(() => {
    const byMethod = new Map<string, number>();
    for (const d of completedDonations) byMethod.set(d.paymentMethod, (byMethod.get(d.paymentMethod) ?? 0) + 1);
    const labels: Record<string, string> = {
      card: "Credit/Debit Card (Stripe)",
      apple_pay: "Apple Pay",
      tithely: "Tithe.ly",
      check: "Check",
    };
    return Array.from(byMethod.entries()).map(([method, value]) => ({ label: labels[method] ?? method, value }));
  }, [completedDonations]);

  const funnelStages = useMemo(() => {
    const stages = [
      { label: "Prayer Requests", value: inRange.prayerRequests.length },
      { label: "Prayer Army Signups", value: inRange.prayerRequests.filter((p) => p.joinedPrayerArmy).length },
      { label: "Salvation Commitments", value: salvationCount },
      { label: "Event RSVPs", value: eventRsvpCount },
      { label: "Email/SMS Subscribers", value: inRange.subscribers.length },
    ];
    const max = Math.max(1, ...stages.map((s) => s.value));
    return stages.map((s) => ({ ...s, max }));
  }, [inRange, salvationCount, eventRsvpCount]);

  const activity = useMemo(() => {
    type ActivityItem = { date: string; text: string; module: AdminModuleId };
    const items: ActivityItem[] = [
      ...snapshot.donations.map((d) => ({
        date: d.createdAt,
        text: `New $${d.amountUsd.toLocaleString()} USD ${d.frequency !== "one-time" ? "monthly " : ""}gift from ${d.donorName}`,
        module: "giving" as const,
      })),
      ...snapshot.prayerRequests.map((p) => ({
        date: p.createdAt,
        text: `New prayer request from ${p.fullName} (${p.category})`,
        module: "prayer" as const,
      })),
      ...snapshot.bookOrders.map((o) => ({
        date: o.createdAt,
        text: `New book order ${o.orderNumber} from ${o.customerName} — $${o.totalUsd.toLocaleString()}`,
        module: "books" as const,
      })),
      ...snapshot.dailyDevotionals.map((d) => ({
        date: d.updatedAt,
        text: `Today's Scripture updated to "${d.scriptureRefEn}"`,
        module: "devotionals" as const,
      })),
      ...snapshot.subscribers.map((s) => ({
        date: s.createdAt,
        text: `New subscriber: ${[s.firstName, s.lastName].filter(Boolean).join(" ") || s.email || s.phone || "—"}`,
        module: "branches" as const,
      })),
    ];
    return items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
  }, [snapshot]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-xl font-bold text-navy-900">Executive Overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          Real-time ministry metrics across Washington, D.C. and the Ethiopian synod network.
        </p>
      </div>

      {/* 6 KPI scorecards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          icon={Wallet}
          label="Total Stewardship & Giving"
          value={`$${totalGivingUsd.toLocaleString()}`}
          detail={`${momGrowthPct >= 0 ? "▲" : "▼"} ${Math.abs(momGrowthPct)}% vs last month · ${monthlyPartnerCount} Monthly Partners`}
          onClick={() => onModuleChange("giving")}
        />
        <KpiCard
          icon={BookOpen}
          label="Book Store Revenue & Orders"
          value={`$${bookRevenueUsd.toLocaleString()}`}
          detail={`${completedOrders.length} orders · ${monthlyOfferClaims} Monthly Offer claims`}
          onClick={() => onModuleChange("books")}
        />
        <KpiCard
          icon={HandHeart}
          label="Global Prayer Army & Requests"
          value={String(inRange.prayerRequests.length)}
          detail={`${prayedOverPct}% prayed over · ${prayerArmyRosterSize} enlisted intercessors`}
          onClick={() => onModuleChange("prayer")}
        />
        <KpiCard
          icon={Sparkles}
          label="Salvation Decisions & D.C. Visitors"
          value={String(salvationCount)}
          detail={`${planVisitCount} Plan-Your-Visit · ${eventRsvpCount} Event RSVPs`}
          onClick={() => onModuleChange("prayer")}
        />
        <KpiCard
          icon={PlayCircle}
          label="VOD Sermon Library"
          value={String(snapshot.sermons.length)}
          detail={`${dcSermonCount} Gospel Light Church, DC · ${ethiopiaSermonCount} Addis Ababa HQ`}
          onClick={() => onModuleChange("sermons")}
        />
        <KpiCard
          icon={Mail}
          label="Email & SMS Subscribers"
          value={String(snapshot.subscribers.length)}
          detail={`${inRange.subscribers.length} new in selected range`}
          onClick={() => onModuleChange("branches")}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <p className="text-sm font-semibold text-navy-900">Stewardship by Fund Designation</p>
          <div className="mt-4 flex flex-col gap-3">
            {fundBreakdown.map((row) => (
              <BarRow
                key={row.fund}
                label={row.fund}
                value={row.amount}
                max={row.max}
                formatted={`$${row.amount.toLocaleString()}`}
              />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-navy-900">Giving Frequency</p>
          <div className="mt-4">
            <DonutChart segments={frequencySegments} />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-navy-900">Payment Rail Split</p>
          <div className="mt-4">
            <DonutChart segments={paymentRailSegments} />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <p className="text-sm font-semibold text-navy-900">Ministry Engagement Funnel</p>
          <div className="mt-4 flex flex-col gap-3">
            {funnelStages.map((stage) => (
              <BarRow key={stage.label} label={stage.label} value={stage.value} max={stage.max} formatted={String(stage.value)} />
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-1.5">
          <Flame className="h-4 w-4 text-amber-600" aria-hidden="true" />
          <p className="text-sm font-semibold text-navy-900">Recent Ministry Activity</p>
        </div>
        {activity.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Nothing yet.</p>
        ) : (
          <ul className="mt-3 flex flex-col divide-y divide-slate-100">
            {activity.map((item, index) => (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => onModuleChange(item.module)}
                  className="flex w-full items-center justify-between gap-3 py-2.5 text-left hover:bg-slate-50"
                >
                  <span className="text-sm text-navy-900">{item.text}</span>
                  <span className="shrink-0 text-xs text-slate-400">
                    {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
