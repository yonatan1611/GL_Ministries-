"use client";

import { useEffect, useState } from "react";
import { LockKeyhole, LogOut, RefreshCcw } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import type { Locale } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type {
  BookOrderRecord,
  DonationRecord,
  PrayerRequestRecord,
  RsvpRecord,
  SubscriberRecord,
} from "@/lib/db";
import type { Book, MinistryEvent, Sermon } from "@/types/ministry";
import { AdminDonationsTab } from "@/components/admin/AdminDonationsTab";
import { AdminPrayerTab } from "@/components/admin/AdminPrayerTab";
import { AdminBooksTab } from "@/components/admin/AdminBooksTab";
import { AdminEventsTab } from "@/components/admin/AdminEventsTab";
import { AdminSubscribersTab } from "@/components/admin/AdminSubscribersTab";
import { AdminSermonsTab } from "@/components/admin/AdminSermonsTab";

export interface AdminSnapshot {
  donations: DonationRecord[];
  bookOrders: BookOrderRecord[];
  prayerRequests: PrayerRequestRecord[];
  subscribers: SubscriberRecord[];
  rsvps: RsvpRecord[];
  books: Book[];
  events: MinistryEvent[];
  sermons: Sermon[];
}

type TabId = "donations" | "prayer" | "books" | "events" | "subscribers" | "sermons";

/**
 * Passcode-gated Ministry Admin Portal shell — login form, tab nav,
 * and the single aggregated `GET /api/admin/data` fetch every tab
 * reads from. Tabs mutate through their own endpoints and call
 * `refresh()` afterward so every view reflects the real, current
 * state of `data/glm-database.json`.
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
  const [activeTab, setActiveTab] = useState<TabId>("donations");

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

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
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
        </form>
      </main>
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: "donations", label: dict.admin.tabDonations },
    { id: "prayer", label: dict.admin.tabPrayer },
    { id: "books", label: dict.admin.tabBooks },
    { id: "events", label: dict.admin.tabEvents },
    { id: "subscribers", label: dict.admin.tabSubscribers },
    { id: "sermons", label: dict.admin.tabSermons },
  ];

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-navy-900 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-lg font-bold text-white sm:text-xl">{dict.admin.pageTitle}</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refresh}
              disabled={isLoadingData}
              className="flex items-center gap-1.5 rounded-lg border border-navy-700 px-3 py-2 text-xs font-semibold text-navy-200 hover:bg-navy-800 disabled:opacity-60"
            >
              <RefreshCcw className={cn("h-3.5 w-3.5", isLoadingData && "animate-spin")} aria-hidden="true" />
              {dict.admin.loadingLabel}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              {dict.admin.logoutButton}
            </button>
          </div>
        </div>

        <div className="mx-auto mt-5 flex max-w-7xl flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={activeTab === tab.id}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide",
                activeTab === tab.id ? "bg-amber-600 text-white" : "bg-navy-800 text-navy-200 hover:bg-navy-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {!snapshot ? (
          <p className="text-sm text-slate-500">{dict.admin.loadingLabel}</p>
        ) : (
          <>
            {activeTab === "donations" && <AdminDonationsTab locale={locale} donations={snapshot.donations} />}
            {activeTab === "prayer" && (
              <AdminPrayerTab locale={locale} prayerRequests={snapshot.prayerRequests} onChanged={refresh} />
            )}
            {activeTab === "books" && (
              <AdminBooksTab locale={locale} bookOrders={snapshot.bookOrders} books={snapshot.books} />
            )}
            {activeTab === "events" && (
              <AdminEventsTab locale={locale} rsvps={snapshot.rsvps} events={snapshot.events} onChanged={refresh} />
            )}
            {activeTab === "subscribers" && <AdminSubscribersTab locale={locale} subscribers={snapshot.subscribers} />}
            {activeTab === "sermons" && (
              <AdminSermonsTab locale={locale} sermons={snapshot.sermons} onChanged={refresh} />
            )}
          </>
        )}
      </div>
    </main>
  );
}
