"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { emailSmsSignupSchema } from "@/lib/validations";
import { postJson } from "@/lib/http";
import { cn, type Locale } from "@/lib/utils";
import { useToast } from "@/components/providers/AppProviders";

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  wantsUpdates: boolean;
  agreesInformational: boolean;
  agreesDonationSolicitation: boolean;
  agreesPrivacyPolicy: boolean;
}

const EMPTY_FORM: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  wantsUpdates: false,
  agreesInformational: false,
  agreesDonationSolicitation: false,
  agreesPrivacyPolicy: false,
};

/**
 * "Stay Connected to God's Grace" (`id="stay-connected"`) — the full
 * bennyhinn.org-style TCPA-conscious signup form: First/Last Name,
 * Email, Phone, four consent checkboxes, and fine-print disclosure,
 * posted to `POST /api/newsletter`. Replaces the slim footer banner
 * version with this full homepage section (the footer now links here).
 */
export function StayConnectedSignupSection({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { showToast } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const payload = {
      channel: "email" as const,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone || undefined,
      preferredLanguage: locale,
      wantsUpdates: form.wantsUpdates,
      agreesInformational: form.agreesInformational,
      agreesDonationSolicitation: form.agreesDonationSolicitation,
      agreesPrivacyPolicy: form.agreesPrivacyPolicy,
    };

    const localCheck = emailSmsSignupSchema.safeParse(payload);
    if (!localCheck.success) {
      const fieldErrors: Partial<Record<string, string>> = {};
      for (const issue of localCheck.error.issues) {
        fieldErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(fieldErrors);
      showToast(dict.forms.error, "error");
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    const { result } = await postJson("/api/newsletter", payload);
    setIsSubmitting(false);

    if (!result || !result.success) {
      showToast((result && !result.success && result.error) || dict.forms.error, "error");
      return;
    }

    setForm(EMPTY_FORM);
    showToast(dict.stayConnected.successMessage, "success");
  }

  const [privacyBefore, privacyAfter] = dict.stayConnected.checkboxPrivacyTemplate.split("{privacyPolicyLink}");

  return (
    <section id="stay-connected" className="bg-[#F4EFE6] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl border-t-4 border-[#1E40AF] bg-white p-8 shadow-xl sm:p-10">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-navy-900 sm:text-3xl">
            {dict.stayConnected.sectionTitle}
          </h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">{dict.stayConnected.subheadline}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="sc-first-name" className="mb-1 block text-xs font-medium text-slate-600">
                {dict.forms.firstName} <span className="text-crimson-600">*</span>
              </label>
              <input
                id="sc-first-name"
                type="text"
                required
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                className={cn(
                  "w-full rounded border px-3 py-2 text-sm",
                  errors.firstName ? "border-red-500" : "border-slate-300"
                )}
              />
              {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
            </div>
            <div>
              <label htmlFor="sc-last-name" className="mb-1 block text-xs font-medium text-slate-600">
                {dict.forms.lastName} <span className="text-crimson-600">*</span>
              </label>
              <input
                id="sc-last-name"
                type="text"
                required
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                className={cn(
                  "w-full rounded border px-3 py-2 text-sm",
                  errors.lastName ? "border-red-500" : "border-slate-300"
                )}
              />
              {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="sc-email" className="mb-1 block text-xs font-medium text-slate-600">
              {dict.forms.email} <span className="text-crimson-600">*</span>
            </label>
            <input
              id="sc-email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className={cn(
                "w-full rounded border px-3 py-2 text-sm",
                errors.email ? "border-red-500" : "border-slate-300"
              )}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="sc-phone" className="mb-1 block text-xs font-medium text-slate-600">
              {dict.forms.phone} (SMS / WhatsApp / Telegram)
            </label>
            <input
              id="sc-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex flex-col gap-2.5 rounded bg-slate-50 p-4">
            <label className="flex items-start gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.wantsUpdates}
                onChange={(e) => setForm((f) => ({ ...f, wantsUpdates: e.target.checked }))}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              {dict.stayConnected.checkboxUpdates}
            </label>
            <label className="flex items-start gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.agreesInformational}
                onChange={(e) => setForm((f) => ({ ...f, agreesInformational: e.target.checked }))}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              {dict.stayConnected.checkboxInformational}
            </label>
            <label className="flex items-start gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.agreesDonationSolicitation}
                onChange={(e) => setForm((f) => ({ ...f, agreesDonationSolicitation: e.target.checked }))}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              {dict.stayConnected.checkboxDonation}
            </label>
            <label className="flex items-start gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                required
                checked={form.agreesPrivacyPolicy}
                onChange={(e) => setForm((f) => ({ ...f, agreesPrivacyPolicy: e.target.checked }))}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span>
                {privacyBefore}
                <Link href={`/${locale}/legal/privacy`} className="underline hover:text-amber-700">
                  {dict.footer.privacyPolicy}
                </Link>
                {privacyAfter}
              </span>
            </label>
            {errors.agreesPrivacyPolicy && (
              <p className="text-xs text-red-600">{errors.agreesPrivacyPolicy}</p>
            )}
          </div>

          <p className="text-xs leading-relaxed text-slate-500">{dict.stayConnected.tcpaDisclosure}</p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded bg-gradient-to-r from-[#1B365D] to-[#2563EB] px-4 py-3.5 font-nav text-sm font-extrabold uppercase tracking-wider text-white hover:brightness-110 disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {dict.stayConnected.submitLabel}
          </button>
        </form>
      </div>
    </section>
  );
}
