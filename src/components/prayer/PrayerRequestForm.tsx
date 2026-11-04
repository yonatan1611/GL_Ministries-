"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { PRAYER_NEED_CATEGORIES, prayerRequestSchema } from "@/lib/validations";
import { postJson } from "@/lib/http";
import { cn, type Locale } from "@/lib/utils";
import { useToast } from "@/components/providers/AppProviders";

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  category: (typeof PRAYER_NEED_CATEGORIES)[number];
  prayerRequest: string;
  isConfidential: boolean;
  wantsFollowUp: boolean;
  joinPrayerArmy: boolean;
}

const EMPTY_FORM: FormState = {
  fullName: "",
  email: "",
  phone: "",
  category: PRAYER_NEED_CATEGORIES[0],
  prayerRequest: "",
  isConfidential: true,
  wantsFollowUp: false,
  joinPrayerArmy: false,
};

/**
 * Shared `prayerRequestSchema` form body, used both inside
 * `GlobalPrayerModal` (triggered from the Top Bar/Navbar/Footer) and
 * inline on the homepage's Global Prayer Army section — one
 * implementation instead of two copies drifting apart over time.
 */
export function PrayerRequestForm({
  locale,
  onSuccess,
  idPrefix = "prayer",
}: {
  locale: Locale;
  onSuccess: () => void;
  /** Keeps form field `id`s unique when this form is rendered more than
   *  once on the same page (modal + inline homepage section). */
  idPrefix?: string;
}) {
  const dict = getDictionary(locale);
  const { showToast } = useToast();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const payload = {
      ...form,
      email: form.email || undefined,
      phone: form.phone || undefined,
    };

    const localCheck = prayerRequestSchema.safeParse(payload);
    if (!localCheck.success) {
      const fieldErrors: Partial<Record<keyof FormState, string>> = {};
      for (const issue of localCheck.error.issues) {
        const key = issue.path[0] as keyof FormState;
        if (key in form) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      showToast(dict.forms.error, "error");
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    const { result } = await postJson("/api/prayer", payload);
    setIsSubmitting(false);

    if (!result || !result.success) {
      showToast((result && !result.success && result.error) || dict.forms.error, "error");
      return;
    }

    setForm(EMPTY_FORM);
    showToast(dict.prayerModal.confirmTitle, "success");
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label htmlFor={`${idPrefix}-name`} className="mb-1 block text-xs font-medium text-slate-600">
          {dict.forms.fullName}
        </label>
        <input
          id={`${idPrefix}-name`}
          type="text"
          value={form.fullName}
          onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
          className={cn(
            "w-full rounded-lg border px-3 py-2 text-sm",
            errors.fullName ? "border-red-500" : "border-slate-300"
          )}
        />
        {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`${idPrefix}-email`} className="mb-1 block text-xs font-medium text-slate-600">
            {dict.forms.email}
          </label>
          <input
            id={`${idPrefix}-email`}
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={cn(
              "w-full rounded-lg border px-3 py-2 text-sm",
              errors.email ? "border-red-500" : "border-slate-300"
            )}
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor={`${idPrefix}-phone`} className="mb-1 block text-xs font-medium text-slate-600">
            {dict.forms.phone} / WhatsApp
          </label>
          <input
            id={`${idPrefix}-phone`}
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-category`} className="mb-1 block text-xs font-medium text-slate-600">
          {dict.prayerModal.categoryLabel}
        </label>
        <select
          id={`${idPrefix}-category`}
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as FormState["category"] }))}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {PRAYER_NEED_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {dict.prayerModal.categories[category]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-request`} className="mb-1 block text-xs font-medium text-slate-600">
          {dict.prayerModal.prayerRequestLabel}
        </label>
        <textarea
          id={`${idPrefix}-request`}
          rows={4}
          value={form.prayerRequest}
          onChange={(e) => setForm((f) => ({ ...f, prayerRequest: e.target.value }))}
          className={cn(
            "w-full rounded-lg border px-3 py-2 text-sm",
            errors.prayerRequest ? "border-red-500" : "border-slate-300"
          )}
        />
        {errors.prayerRequest && <p className="mt-1 text-xs text-red-600">{errors.prayerRequest}</p>}
      </div>

      <div className="flex flex-col gap-2 rounded-lg bg-slate-50 p-3">
        <label className="flex items-start gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.isConfidential}
            onChange={(e) => setForm((f) => ({ ...f, isConfidential: e.target.checked }))}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
          />
          {dict.prayerModal.confidentialLabel}
        </label>
        <label className="flex items-start gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.wantsFollowUp}
            onChange={(e) => setForm((f) => ({ ...f, wantsFollowUp: e.target.checked }))}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
          />
          {dict.prayerModal.followUpLabel}
        </label>
        <label className="flex items-start gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.joinPrayerArmy}
            onChange={(e) => setForm((f) => ({ ...f, joinPrayerArmy: e.target.checked }))}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
          />
          {dict.prayerModal.joinArmyLabel}
        </label>
      </div>
      {errors.email && (form.wantsFollowUp || form.joinPrayerArmy) && (
        <p className="text-xs text-red-600">{errors.email}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {dict.prayerModal.submitLabel}
      </button>
    </form>
  );
}
