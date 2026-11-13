"use client";

import { useEffect, useState } from "react";
import { LockKeyhole, Sparkles } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import type { Locale } from "@/lib/utils";
import type {
  BookOrderRecord,
  DonationRecord,
  PrayerRequestRecord,
  RsvpRecord,
  SubscriberRecord,
} from "@/lib/db";
import type { Book, BranchLocation, DailyDevotional, MinistryEvent, NewsHighlight, Sermon } from "@/types/ministry";
import { AdminShell, type AdminModuleId, type DateRangeFilter } from "@/components/admin/AdminShell";
import { AdminOverviewModule } from "@/components/admin/AdminOverviewModule";
import { AdminGivingModule } from "@/components/admin/AdminGivingModule";
import { AdminBooksModule } from "@/components/admin/AdminBooksModule";
import { AdminDevotionalsModule } from "@/components/admin/AdminDevotionalsModule";
import { AdminSermonsModule } from "@/components/admin/AdminSermonsModule";
import { AdminPrayerModule } from "@/components/admin/AdminPrayerModule";
import { AdminEventsModule } from "@/components/admin/AdminEventsModule";
import { AdminBranchesAndSubscribersModule } from "@/components/admin/AdminBranchesAndSubscribersModule";
import { AdminUpdatesModule } from "@/components/admin/AdminUpdatesModule";

export interface AdminSnapshot {
  donations: DonationRecord[];
  bookOrders: BookOrderRecord[];
  prayerRequests: PrayerRequestRecord[];
  subscribers: SubscriberRecord[];
  rsvps: RsvpRecord[];
  books: Book[];
  events: MinistryEvent[];
  sermons: Sermon[];
  dailyDevotionals: DailyDevotional[];
  locations: BranchLocation[];
  newsUpdates: NewsHighlight[];
}

/** The real, documented default passcode (`src/lib/adminAuth.ts` /
 *  `ADMIN_PASSCODE` in `src/lib/env.server.ts`) — shown as a 1-click
 *  demo sign-in button so a client reviewing the dashboard doesn't
 *  need to be told or retype it. */
const DEMO_PASSCODE = "2026";

/**
 * Passcode-gated Ministry Admin Portal shell — login form (with a
 * 1-click demo sign-in), the single aggregated `GET /api/admin/data`
 * fetch every module reads from, and the `AdminShell` sidebar/top-bar
 * layout + module router. Modules mutate through their own endpoints
 * and call `refresh()` afterward so every view reflects the real,
 * current state of the Neon Postgres database.
 */
export function AdminPortalClient({
  locale,
  initialAuthenticated,
}: {
  locale: Locale;
  initialAuthenticated: boolean;
}) {
  const dict = getDictionary(locale);
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuthenticated);
  const [passcode, setPasscode] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [snapshot, setSnapshot] = useState<AdminSnapshot | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [activeModule, setActiveModule] = useState<AdminModuleId>("overview");
  const [dateRange, setDateRange] = useState<DateRangeFilter>("all");

  async function refresh() {
    setIsLoadingData(true);
    try {
      const response = await fetch("/api/admin/data");
      if (response.status === 401) {
        setIsAuthenticated(false);
        setSnapshot(null);
        return;
      }
      const result = await response.json().catch(() => null);
      if (result?.success) setSnapshot(result.data as AdminSnapshot);
    } finally {
      setIsLoadingData(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated) refresh();
  }, [isAuthenticated]);

  async function submitPasscode(value: string) {
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: value }),
      });
      if (!response.ok) {
        setLoginError(dict.admin.loginError);
        return;
      }
      setPasscode("");
      setIsAuthenticated(true);
    } catch {
      setLoginError(dict.admin.loginError);
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    await submitPasscode(passcode);
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => undefined);
    setIsAuthenticated(false);
    setSnapshot(null);
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-14">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <div className="flex items-center gap-2 text-navy-900">
            <LockKeyhole className="h-5 w-5 text-amber-600" aria-hidden="true" />
            <h1 className="font-display text-lg font-bold">{dict.admin.loginTitle}</h1>
          </div>
          <p className="mt-2 text-sm text-slate-600">{dict.admin.loginSubtitle}</p>

          <label htmlFor="admin-passcode" className="mb-1 mt-5 block text-xs font-medium text-slate-600">
            {dict.admin.passcodeLabel}
          </label>
          <input
            id="admin-passcode"
            type="password"
            autoComplete="off"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
          />
          {loginError && <p className="mt-2 text-xs text-red-600">{loginError}</p>}

          <button
            type="submit"
            disabled={isLoggingIn || passcode.length === 0}
            className="mt-5 w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
          >
            {dict.admin.loginButton}
          </button>

          <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            or
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={() => submitPasscode(DEMO_PASSCODE)}
            disabled={isLoggingIn}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-800 hover:bg-blue-100 disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            1-Click Demo Admin Login (PIN: {DEMO_PASSCODE})
          </button>
        </form>
      </main>
    );
  }

  if (!snapshot) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">{dict.admin.loadingLabel}</p>
      </main>
    );
  }

  return (
    <AdminShell
      locale={locale}
      snapshot={snapshot}
      activeModule={activeModule}
      onModuleChange={setActiveModule}
      onRefresh={refresh}
      isLoadingData={isLoadingData}
      onLogout={handleLogout}
      dateRange={dateRange}
      onDateRangeChange={setDateRange}
    >
      {activeModule === "overview" && (
        <AdminOverviewModule snapshot={snapshot} dateRange={dateRange} onModuleChange={setActiveModule} />
      )}
      {activeModule === "giving" && (
        <AdminGivingModule locale={locale} donations={snapshot.donations} dateRange={dateRange} onChanged={refresh} />
      )}
      {activeModule === "books" && (
        <AdminBooksModule
          locale={locale}
          bookOrders={snapshot.bookOrders}
          books={snapshot.books}
          onChanged={refresh}
        />
      )}
      {activeModule === "devotionals" && (
        <AdminDevotionalsModule devotionals={snapshot.dailyDevotionals} onChanged={refresh} />
      )}
      {activeModule === "sermons" && (
        <AdminSermonsModule locale={locale} sermons={snapshot.sermons} onChanged={refresh} />
      )}
      {activeModule === "prayer" && (
        <AdminPrayerModule
          locale={locale}
          prayerRequests={snapshot.prayerRequests}
          rsvps={snapshot.rsvps}
          onChanged={refresh}
        />
      )}
      {activeModule === "events" && (
        <AdminEventsModule locale={locale} rsvps={snapshot.rsvps} events={snapshot.events} onChanged={refresh} />
      )}
      {activeModule === "branches" && (
        <AdminBranchesAndSubscribersModule
          locale={locale}
          locations={snapshot.locations}
          subscribers={snapshot.subscribers}
          onChanged={refresh}
        />
      )}
      {activeModule === "updates" && (
        <AdminUpdatesModule updates={snapshot.newsUpdates} onChanged={refresh} />
      )}
    </AdminShell>
  );
}
