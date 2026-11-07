"use client";

import { useState } from "react";
import { CalendarCheck, Loader2, MapPin } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { rsvpSchema } from "@/lib/validations";
import { postJson } from "@/lib/http";
import { cn, type Locale } from "@/lib/utils";
import type { MinistryEvent } from "@/types/ministry";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/providers/AppProviders";

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  attendanceMode: "in-person" | "online";
  branchAffiliation: string;
}

const EMPTY_FORM: FormState = {
  fullName: "",
  email: "",
  phone: "",
  attendanceMode: "in-person",
  branchAffiliation: "",
};

/**
 * Accessible RSVP modal for the 2026–2027 conferences & gatherings
 * section, validated with `rsvpSchema`. Replaces the legacy homepage's
 * static, frozen 2020 event banner with a working registration flow.
 */
export function EventRsvpModal({
  locale,
  event,
  onClose,
  onSuccess,
}: {
  locale: Locale;
  event: MinistryEvent | null;
  onClose: () => void;
  /** Called once an RSVP is confirmed, so the caller can refresh any
   *  live registered-count badge. */
  onSuccess?: () => void;
}) {
  const dict = getDictionary(locale);
  const { showToast } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleClose() {
    setForm(EMPTY_FORM);
    setErrors({});
    setIsConfirmed(false);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!event) return;

    const payload = { eventId: event.id, ...form };
    const localCheck = rsvpSchema.safeParse(payload);
    if (!localCheck.success) {
      const fieldErrors: Partial<Record<keyof FormState, string>> = {};
      for (const issue of localCheck.error.issues) {
        const key = issue.path[0] as keyof FormState;
        if (key in EMPTY_FORM) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      showToast(dict.forms.error, "error");
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    const { result } = await postJson("/api/events/rsvp", payload);
    setIsSubmitting(false);

    if (!result || !result.success) {
      showToast((result && !result.success && result.error) || dict.forms.error, "error");
      return;
    }

    setIsConfirmed(true);
    showToast(dict.rsvpModal.confirmTitle, "success");
    onSuccess?.();
  }

  if (!event) return null;

  return (
    <Modal
      isOpen={Boolean(event)}
      onClose={handleClose}
      title={dict.rsvpModal.title}
      closeLabel={dict.buttons.close}
    >
      {isConfirmed ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CalendarCheck className="h-10 w-10 text-emerald-600" aria-hidden="true" />
          <h3 className="font-display text-lg font-bold text-navy-900">
            {dict.rsvpModal.confirmTitle}
          </h3>
          <p className="text-sm text-slate-600">{dict.rsvpModal.confirmBody}</p>
          <div className="mt-2 w-full rounded-lg bg-slate-50 p-4 text-left text-sm text-slate-700">
            <p className="font-semibold text-navy-900">
              {locale === "am" ? event.titleAm : event.titleEn}
            </p>
            <p className="mt-1 flex items-center gap-1.5">
              <CalendarCheck className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
              {locale === "am" ? event.dateRangeAm : event.dateRangeEn}
            </p>
            <p className="mt-1 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
              {locale === "am" ? event.locationAm : event.locationEn}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="mt-3 w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
          >
            {dict.buttons.close}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-navy-800">
            {locale === "am" ? event.titleAm : event.titleEn}
          </p>
          <p className="text-xs text-slate-500">
            {locale === "am" ? event.dateRangeAm : event.dateRangeEn} ·{" "}
            {locale === "am" ? event.locationAm : event.locationEn}
          </p>

          <div>
            <label htmlFor="rsvp-name" className="mb-1 block text-xs font-medium text-slate-600">
              {dict.forms.fullName}
            </label>
            <input
              id="rsvp-name"
              type="text"
              autoComplete="name"
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-sm",
                errors.fullName ? "border-red-500" : "border-slate-300"
              )}
            />
            {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
          </div>

          <div>
            <label htmlFor="rsvp-email" className="mb-1 block text-xs font-medium text-slate-600">
              {dict.forms.email}
            </label>
            <input
              id="rsvp-email"
              type="email"
              autoComplete="email"
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
            <label htmlFor="rsvp-phone" className="mb-1 block text-xs font-medium text-slate-600">
              {dict.forms.phone}
            </label>
            <input
              id="rsvp-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-sm",
                errors.phone ? "border-red-500" : "border-slate-300"
              )}
            />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
          </div>

          <div>
            <span className="mb-1 block text-xs font-medium text-slate-600">
              {dict.rsvpModal.attendanceInPerson} / {dict.rsvpModal.attendanceOnline}
            </span>
            <div className="flex gap-2">
              {(["in-person", "online"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, attendanceMode: mode }))}
                  aria-pressed={form.attendanceMode === mode}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-medium",
                    form.attendanceMode === mode
                      ? "border-amber-600 bg-amber-50 text-amber-800"
                      : "border-slate-300 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {mode === "in-person" ? dict.rsvpModal.attendanceInPerson : dict.rsvpModal.attendanceOnline}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="rsvp-branch" className="mb-1 block text-xs font-medium text-slate-600">
              {dict.rsvpModal.branchAffiliationLabel}
            </label>
            <input
              id="rsvp-branch"
              type="text"
              value={form.branchAffiliation}
              onChange={(e) => setForm((f) => ({ ...f, branchAffiliation: e.target.value }))}
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-sm",
                errors.branchAffiliation ? "border-red-500" : "border-slate-300"
              )}
            />
            {errors.branchAffiliation && (
              <p className="mt-1 text-xs text-red-600">{errors.branchAffiliation}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {dict.buttons.submit}
          </button>
        </form>
      )}
    </Modal>
  );
}
