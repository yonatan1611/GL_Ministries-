"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import {
  HOME_GROUP_CITIES,
  VOLUNTEER_TEAMS,
  ministryActionSchema,
  type MinistryActionType,
} from "@/lib/validations";
import { postJson } from "@/lib/http";
import { cn, type Locale } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/providers/AppProviders";

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  note: string;
  team: (typeof VOLUNTEER_TEAMS)[number];
}

function emptyForm(): FormState {
  return { fullName: "", email: "", phone: "", city: "", note: "", team: VOLUNTEER_TEAMS[0] };
}

/**
 * Shared modal behind the homepage's Volunteer, Rural Outreach, and
 * Fellowship Groups action cards — the real workflows that replace the
 * legacy homepage's dead `href="#"` cards. Validated with
 * `ministryActionSchema` and posted to `POST /api/ministry-action`.
 */
export function MinistryActionModal({
  locale,
  actionType,
  onClose,
}: {
  locale: Locale;
  actionType: MinistryActionType | null;
  onClose: () => void;
}) {
  const dict = getDictionary(locale);
  const { showToast } = useToast();
  const [form, setForm] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (actionType) {
      setForm(emptyForm());
      setErrors({});
      setIsConfirmed(false);
    }
  }, [actionType]);

  function handleClose() {
    setForm(emptyForm());
    setErrors({});
    setIsConfirmed(false);
    onClose();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!actionType) return;

    const note =
      actionType === "Volunteer" && form.note
        ? `Team: ${form.team}. ${form.note}`
        : actionType === "Volunteer"
          ? `Team: ${form.team}.`
          : form.note || undefined;

    const payload = {
      actionType,
      fullName: form.fullName,
      email: form.email,
      phone: form.phone || undefined,
      city: form.city || undefined,
      note,
    };

    const localCheck = ministryActionSchema.safeParse(payload);
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
    const { result } = await postJson("/api/ministry-action", payload);
    setIsSubmitting(false);

    if (!result || !result.success) {
      showToast((result && !result.success && result.error) || dict.forms.error, "error");
      return;
    }

    setIsConfirmed(true);
    showToast(dict.actionModal.confirmTitle, "success");
  }

  if (!actionType) return null;

  return (
    <Modal
      isOpen={Boolean(actionType)}
      onClose={handleClose}
      title={dict.actionModal.titles[actionType]}
      closeLabel={dict.buttons.close}
    >
      {isConfirmed ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" aria-hidden="true" />
          <h3 className="font-display text-lg font-bold text-navy-900">{dict.actionModal.confirmTitle}</h3>
          <p className="text-sm text-slate-600">{dict.actionModal.confirmBody}</p>
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
          <div>
            <label htmlFor="action-name" className="mb-1 block text-xs font-medium text-slate-600">
              {dict.forms.fullName}
            </label>
            <input
              id="action-name"
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
              <label htmlFor="action-email" className="mb-1 block text-xs font-medium text-slate-600">
                {dict.forms.email}
              </label>
              <input
                id="action-email"
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
              <label htmlFor="action-phone" className="mb-1 block text-xs font-medium text-slate-600">
                {dict.forms.phone}
              </label>
              <input
                id="action-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          {actionType === "Volunteer" && (
            <div>
              <label htmlFor="action-team" className="mb-1 block text-xs font-medium text-slate-600">
                {dict.actionModal.teamLabel}
              </label>
              <select
                id="action-team"
                value={form.team}
                onChange={(e) => setForm((f) => ({ ...f, team: e.target.value as FormState["team"] }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {VOLUNTEER_TEAMS.map((team) => (
                  <option key={team} value={team}>
                    {dict.actionModal.teams[team]}
                  </option>
                ))}
              </select>
            </div>
          )}

          {actionType === "Home Groups" && (
            <div>
              <span className="mb-1 block text-xs font-medium text-slate-600">
                {dict.actionModal.groupCitiesLabel}
              </span>
              <div className="flex flex-wrap gap-2">
                {HOME_GROUP_CITIES.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, city }))}
                    aria-pressed={form.city === city}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium",
                      form.city === city
                        ? "bg-amber-600 text-white"
                        : "border border-slate-300 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {dict.actionModal.groupCities[city]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {actionType === "Outreach" && (
            <div>
              <label htmlFor="action-city" className="mb-1 block text-xs font-medium text-slate-600">
                {dict.actionModal.cityLabel}
              </label>
              <input
                id="action-city"
                type="text"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          )}

          <div>
            <label htmlFor="action-note" className="mb-1 block text-xs font-medium text-slate-600">
              {dict.actionModal.noteLabel}
            </label>
            <textarea
              id="action-note"
              rows={3}
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {dict.actionModal.submitLabel}
          </button>
        </form>
      )}
    </Modal>
  );
}
