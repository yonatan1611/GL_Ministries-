"use client";

import { useMemo, useState } from "react";
import { Download, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { SYNOD_REGIONS, BRANCH_TYPES } from "@/lib/validations";
import type { Locale } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { SubscriberRecord } from "@/lib/db";
import type { BranchLocation } from "@/types/ministry";
import { downloadCsv } from "@/lib/csv";

type FormState = {
  synod: BranchLocation["synod"];
  nameEn: string;
  nameAm: string;
  city: string;
  type: BranchLocation["type"];
  detailsEn: string;
  detailsAm: string;
  address: string;
  phone: string;
  email: string;
  serviceTimesEn: string;
  serviceTimesAm: string;
};

const EMPTY_FORM: FormState = {
  synod: "Addis Ababa",
  nameEn: "",
  nameAm: "",
  city: "",
  type: "Branch Church",
  detailsEn: "",
  detailsAm: "",
  address: "",
  phone: "",
  email: "",
  serviceTimesEn: "",
  serviceTimesAm: "",
};

function toForm(location: BranchLocation): FormState {
  return {
    synod: location.synod,
    nameEn: location.nameEn,
    nameAm: location.nameAm,
    city: location.city,
    type: location.type,
    detailsEn: location.detailsEn,
    detailsAm: location.detailsAm,
    address: location.address,
    phone: location.phone,
    email: location.email,
    serviceTimesEn: location.serviceTimesEn,
    serviceTimesAm: location.serviceTimesAm,
  };
}

/**
 * 32+1 Branch Directory & Subscribers Manager: full edit/add/delete for
 * the live branch directory `/[locale]/locations` reads from, plus the
 * existing searchable subscriber list with CSV export.
 */
export function AdminBranchesAndSubscribersModule({
  locale,
  locations,
  subscribers,
  onChanged,
}: {
  locale: Locale;
  locations: BranchLocation[];
  subscribers: SubscriberRecord[];
  onChanged: () => void;
}) {
  const dict = getDictionary(locale);
  const [subTab, setSubTab] = useState<"branches" | "subscribers">("branches");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [subscriberSearch, setSubscriberSearch] = useState("");

  const sortedLocations = useMemo(
    () => [...locations].sort((a, b) => a.synod.localeCompare(b.synod) || a.nameEn.localeCompare(b.nameEn)),
    [locations]
  );

  const filteredSubscribers = useMemo(() => {
    const q = subscriberSearch.trim().toLowerCase();
    if (!q) return subscribers;
    return subscribers.filter((s) =>
      [s.firstName, s.lastName, s.email, s.phone].filter(Boolean).join(" ").toLowerCase().includes(q)
    );
  }, [subscribers, subscriberSearch]);
  const sortedSubscribers = useMemo(
    () => [...filteredSubscribers].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [filteredSubscribers]
  );

  function handleExportSubscribers() {
    downloadCsv(
      "glm-subscribers.csv",
      sortedSubscribers.map((s) => ({
        date: s.createdAt,
        firstName: s.firstName ?? "",
        lastName: s.lastName ?? "",
        email: s.email ?? "",
        phone: s.phone ?? "",
        emailOptIn: s.emailOptIn,
        smsOptIn: s.smsOptIn,
      }))
    );
  }

  function startEdit(location: BranchLocation) {
    setEditingId(location.id);
    setForm(toForm(location));
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    try {
      const response = await fetch(`/api/locations?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (response.ok) {
        if (editingId === id) cancelEdit();
        onChanged();
      }
    } finally {
      setBusyId(null);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!form.nameEn.trim() || !form.city.trim() || !form.address.trim() || !form.phone.trim() || !form.email.trim()) {
      setError("Name, City, Address, Phone, and Email are required.");
      return;
    }
    if (!form.serviceTimesEn.trim()) {
      setError("Service Times (English) is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/locations", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...form } : form),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setError(result?.error ?? "Something went wrong.");
        return;
      }
      cancelEdit();
      onChanged();
    } finally {
      setIsSubmitting(false);
    }
  }

  function field(
    key: keyof Omit<FormState, "synod" | "type">,
    label: string,
    isTextarea = false
  ) {
    const value = form[key];
    const id = `admin-branch-${key}`;
    return (
      <div>
        <label htmlFor={id} className="mb-1 block text-xs font-medium text-slate-600">
          {label}
        </label>
        {isTextarea ? (
          <textarea
            id={id}
            rows={2}
            value={value}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        ) : (
          <input
            id={id}
            type="text"
            value={value}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-xl font-bold text-navy-900">Branch Directory & Subscribers</h1>

      <div className="flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setSubTab("branches")}
          className={cn(
            "rounded-t-lg px-4 py-2 text-sm font-semibold",
            subTab === "branches" ? "border-b-2 border-amber-600 text-amber-700" : "text-slate-500 hover:text-slate-700"
          )}
        >
          32+1 Branch Directory ({locations.length})
        </button>
        <button
          type="button"
          onClick={() => setSubTab("subscribers")}
          className={cn(
            "rounded-t-lg px-4 py-2 text-sm font-semibold",
            subTab === "subscribers" ? "border-b-2 border-amber-600 text-amber-700" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Email & SMS Subscribers ({subscribers.length})
        </button>
      </div>

      {subTab === "branches" && (
        <div className="flex flex-col gap-8">
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Branch</th>
                  <th className="px-4 py-3">Synod</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Service Times</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedLocations.map((location) => (
                  <tr key={location.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy-900">{location.nameEn}</p>
                      <p className="text-xs text-slate-500">{location.type}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{location.synod}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{location.city}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{location.phone}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{location.serviceTimesEn}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(location)}
                          className="text-slate-500 hover:text-slate-700"
                          aria-label="Edit branch"
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(location.id)}
                          disabled={busyId === location.id}
                          className="text-red-600 hover:text-red-800 disabled:opacity-40"
                          aria-label="Delete branch"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-navy-900">
                {editingId ? <Pencil className="h-4 w-4 text-amber-600" aria-hidden="true" /> : <Plus className="h-4 w-4 text-amber-600" aria-hidden="true" />}
                {editingId ? "Edit Branch" : "Add a New Branch Church"}
              </p>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  Cancel
                </button>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {field("nameEn", "Branch Name (English)")}
              {field("nameAm", "Branch Name (Amharic)")}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Synod</label>
                <select
                  value={form.synod}
                  onChange={(e) => setForm((f) => ({ ...f, synod: e.target.value as FormState["synod"] }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  {SYNOD_REGIONS.map((synod) => (
                    <option key={synod} value={synod}>
                      {synod}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Branch Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as FormState["type"] }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  {BRANCH_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              {field("city", "City")}
              {field("phone", "Phone")}
              {field("email", "Email")}
              {field("address", "Address")}
              {field("serviceTimesEn", "Service Times (English)")}
              {field("serviceTimesAm", "Service Times (Amharic)")}
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {field("detailsEn", "Details (English, optional)", true)}
              {field("detailsAm", "Details (Amharic, optional)", true)}
            </div>

            {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {editingId ? "Save Changes" : "+ Add Branch"}
            </button>
          </form>
        </div>
      )}

      {subTab === "subscribers" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <input
              type="search"
              value={subscriberSearch}
              onChange={(e) => setSubscriberSearch(e.target.value)}
              placeholder="Search by name, email, or phone…"
              className="w-64 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={handleExportSubscribers}
              disabled={sortedSubscribers.length === 0}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              {dict.admin.exportCsvButton}
            </button>
          </div>

          {sortedSubscribers.length === 0 ? (
            <p className="text-sm text-slate-500">{dict.admin.noDataLabel}</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Channels</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedSubscribers.map((subscriber) => (
                    <tr key={subscriber.id}>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {new Date(subscriber.createdAt).toLocaleDateString(locale === "am" ? "am-ET" : "en-US")}
                      </td>
                      <td className="px-4 py-3 font-medium text-navy-900">
                        {[subscriber.firstName, subscriber.lastName].filter(Boolean).join(" ") || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{subscriber.email ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-600">{subscriber.phone ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {[subscriber.emailOptIn && "Email", subscriber.smsOptIn && "SMS"].filter(Boolean).join(", ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
