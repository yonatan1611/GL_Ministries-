"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  Calendar,
  Church,
  Flame,
  Globe2,
  HandHeart,
  LogOut,
  Megaphone,
  Menu,
  PlayCircle,
  Plus,
  RefreshCcw,
  Search,
  Wallet,
} from "lucide-react";
import type { Locale } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { AdminSnapshot } from "@/components/admin/AdminPortalClient";

export type AdminModuleId =
  | "overview"
  | "giving"
  | "books"
  | "devotionals"
  | "sermons"
  | "prayer"
  | "events"
  | "branches"
  | "updates";

export type DateRangeFilter = "all" | "30d" | "month" | "week";

export const DATE_RANGE_LABELS: Record<DateRangeFilter, string> = {
  all: "All Time",
  "30d": "Last 30 Days",
  month: "This Month",
  week: "This Week",
};

/** Returns `true` when `isoDate` falls within the selected date range —
 *  shared by every module that honors the top bar's date filter. */
export function isWithinDateRange(isoDate: string, range: DateRangeFilter): boolean {
  if (range === "all") return true;
  const date = new Date(isoDate).getTime();
  const now = Date.now();
  if (range === "week") return now - date <= 7 * 24 * 60 * 60 * 1000;
  if (range === "30d") return now - date <= 30 * 24 * 60 * 60 * 1000;
  // "month": calendar month, not a rolling 30 days.
  const d = new Date(isoDate);
  const today = new Date();
  return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();
}

interface NavItem {
  id: AdminModuleId;
  icon: typeof BarChart3;
  label: string;
  count: (snapshot: AdminSnapshot) => number;
}

const NAV_ITEMS: NavItem[] = [
  { id: "overview", icon: BarChart3, label: "Executive Overview", count: () => 0 },
  { id: "giving", icon: Wallet, label: "Stewardship & Giving ($ USD)", count: (s) => s.donations.length },
  { id: "books", icon: BookOpen, label: "Book Store & Orders", count: (s) => s.bookOrders.length },
  { id: "devotionals", icon: Flame, label: "Daily Scripture Devotionals", count: (s) => s.dailyDevotionals.length },
  { id: "sermons", icon: PlayCircle, label: "Sermons & YouTube Sync", count: (s) => s.sermons.length },
  {
    id: "prayer",
    icon: HandHeart,
    label: "Prayer Wall & Salvation",
    count: (s) => s.prayerRequests.length + s.rsvps.filter((r) => r.kind === "salvation").length,
  },
  { id: "events", icon: Calendar, label: "Events, RSVPs & D.C. Visits", count: (s) => s.rsvps.length },
  {
    id: "branches",
    icon: Globe2,
    label: "Branches & Subscribers",
    count: (s) => s.locations.length + s.subscribers.length,
  },
  { id: "updates", icon: Megaphone, label: "News & Highlights (Section 3)", count: (s) => s.newsUpdates.length },
];

export type QuickCreateAction = "scripture" | "book" | "sermon" | "event" | "update";

const QUICK_CREATE_ACTIONS: { id: QuickCreateAction; label: string; module: AdminModuleId }[] = [
  { id: "scripture", label: "+ Publish Today's Scripture", module: "devotionals" },
  { id: "book", label: "+ Add New Book", module: "books" },
  { id: "sermon", label: "+ Add YouTube Sermon", module: "sermons" },
  { id: "event", label: "+ Create Event", module: "events" },
  { id: "update", label: "+ Publish Church Update", module: "updates" },
];

interface SearchHit {
  module: AdminModuleId;
  label: string;
  sublabel: string;
}

/** Builds a flat, searchable index across the handful of entities the
 *  "Global Command Search" is meant to reach — donor names, order
 *  numbers, prayer requesters, sermon titles, and subscribers — purely
 *  client-side over the already-loaded snapshot (the whole dataset is
 *  a small JSON file, so no server round-trip is needed). */
function buildSearchIndex(snapshot: AdminSnapshot): SearchHit[] {
  const hits: SearchHit[] = [];
  for (const d of snapshot.donations) {
    hits.push({ module: "giving", label: d.donorName, sublabel: `$${d.amountUsd} · ${d.referenceCode}` });
  }
  for (const o of snapshot.bookOrders) {
    hits.push({ module: "books", label: o.customerName, sublabel: `Order ${o.orderNumber}` });
  }
  for (const p of snapshot.prayerRequests) {
    hits.push({ module: "prayer", label: p.fullName, sublabel: p.category });
  }
  for (const s of snapshot.sermons) {
    hits.push({ module: "sermons", label: s.titleEn, sublabel: s.speakerEn });
  }
  for (const sub of snapshot.subscribers) {
    const name = [sub.firstName, sub.lastName].filter(Boolean).join(" ") || sub.email || sub.phone || "Subscriber";
    hits.push({ module: "branches", label: name, sublabel: sub.email ?? sub.phone ?? "" });
  }
  for (const update of snapshot.newsUpdates) {
    hits.push({ module: "updates", label: update.titleEn, sublabel: update.category });
  }
  return hits;
}

interface AdminShellProps {
  locale: Locale;
  snapshot: AdminSnapshot;
  activeModule: AdminModuleId;
  onModuleChange: (id: AdminModuleId) => void;
  onRefresh: () => void;
  isLoadingData: boolean;
  onLogout: () => void;
  dateRange: DateRangeFilter;
  onDateRangeChange: (range: DateRangeFilter) => void;
  children: React.ReactNode;
}

/**
 * Executive-grade Admin Command Center shell: a collapsible left
 * sidebar (brand + 8 navigation modules, each with a live count badge)
 * plus a sticky top command bar (global search, date-range filter,
 * quick-create shortcuts, and a one-click data refresh) wrapping
 * whichever module is active. Replaces the old flat horizontal-tabs
 * layout in `AdminPortalClient`.
 */
export function AdminShell({
  locale,
  snapshot,
  activeModule,
  onModuleChange,
  onRefresh,
  isLoadingData,
  onLogout,
  dateRange,
  onDateRangeChange,
  children,
}: AdminShellProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const searchIndex = useMemo(() => buildSearchIndex(snapshot), [snapshot]);
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return searchIndex.filter((hit) => hit.label.toLowerCase().includes(q) || hit.sublabel.toLowerCase().includes(q)).slice(0, 8);
  }, [searchIndex, searchQuery]);

  function handleQuickCreate(action: QuickCreateAction) {
    const target = QUICK_CREATE_ACTIONS.find((a) => a.id === action);
    if (target) onModuleChange(target.module);
    setIsQuickCreateOpen(false);
  }

  function SidebarContent() {
    return (
      <div className="flex h-full select-none flex-col">
        {/* Brand header — fixed at the top of the sidebar */}
        <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-slate-800/80 px-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1B365D] to-[#2563EB] text-white">
            <Church className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold uppercase tracking-wide text-white">GLM Executive Admin</p>
            <p className="truncate text-[11px] text-slate-400">Washington, D.C. &amp; Global Synods</p>
          </div>
        </div>

        {/* Nav items — scrolls on its own if the viewport is short,
            without moving the brand header or footer below. */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const count = item.count(snapshot);
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onModuleChange(item.id);
                  setIsMobileSidebarOpen(false);
                }}
                aria-pressed={isActive}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors",
                  isActive ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.id !== "overview" && (
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold",
                      isActive ? "bg-white/20 text-white" : "bg-slate-800 text-slate-300"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer — fixed at the bottom */}
        <div className="flex shrink-0 flex-col gap-2 border-t border-slate-800/80 p-4">
          <Link
            href={`/${locale}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            View Live Website ↗
          </Link>
          <p className="flex items-center gap-1.5 px-3 text-[11px] text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
            Database: Online &amp; Synced
          </p>
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            Lock / Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-slate-50">
      {/* Desktop sidebar — locked full-height, never scrolls with the page */}
      <aside className="hidden h-full w-64 shrink-0 select-none flex-col border-r border-slate-800 bg-[#091528] text-slate-200 lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <aside className="relative z-10 flex h-full w-64 flex-col border-r border-slate-800 bg-[#091528] text-slate-200">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Right column: locked top header + independently scrollable content */}
      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        {/* Locked top command bar — never moves when the content below scrolls */}
        <header className="z-30 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search donors, orders, prayer requests, sermons, subscribers… (⌘K)"
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-amber-500 focus:outline-none"
            />
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-80 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                {searchResults.map((hit, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      onModuleChange(hit.module);
                      setSearchQuery("");
                    }}
                    className="flex w-full flex-col items-start gap-0.5 border-b border-slate-100 px-3 py-2 text-left last:border-b-0 hover:bg-slate-50"
                  >
                    <span className="text-sm font-semibold text-navy-900">{hit.label}</span>
                    <span className="text-xs text-slate-500">{hit.sublabel}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value as DateRangeFilter)}
            className="hidden shrink-0 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 sm:block"
          >
            {(Object.keys(DATE_RANGE_LABELS) as DateRangeFilter[]).map((range) => (
              <option key={range} value={range}>
                {DATE_RANGE_LABELS[range]}
              </option>
            ))}
          </select>

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsQuickCreateOpen((open) => !open)}
              className="flex items-center gap-1.5 rounded-lg bg-navy-900 px-3 py-2 text-xs font-semibold text-white hover:bg-navy-800"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Quick Create</span>
            </button>
            {isQuickCreateOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 w-64 rounded-lg border border-slate-200 bg-white py-1.5 shadow-lg">
                {QUICK_CREATE_ACTIONS.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => handleQuickCreate(action.id)}
                    className="block w-full px-3 py-2 text-left text-sm font-medium text-navy-900 hover:bg-slate-50"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoadingData}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCcw className={cn("h-3.5 w-3.5", isLoadingData && "animate-spin")} aria-hidden="true" />
            <span className="hidden sm:inline">Sync Live Data</span>
          </button>
        </header>

        {/* The only element that scrolls — sidebar and header above
            stay locked in place regardless of content height. */}
        <main className="min-w-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6 pb-12">{children}</div>
        </main>
      </div>
    </div>
  );
}
