"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { ministryActionSchema } from "@/lib/validations";
import { postJson } from "@/lib/http";
import { cn, type Locale } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/providers/AppProviders";
import { Aurora } from "@/components/react-bits/Aurora";
import { SplitText } from "@/components/react-bits/SplitText";
import { GradientText } from "@/components/react-bits/GradientText";
import { Magnet } from "@/components/react-bits/Magnet";

interface GuideRequestForm {
  fullName: string;
  email: string;
  phone: string;
}

const EMPTY_FORM: GuideRequestForm = { fullName: "", email: "", phone: "" };

/**
 * "Salvation — Are you ready for Jesus to change your life?" callout
 * strip (`id="salvation"`), styled after bennyhinn.org's full-bleed
 * royal-navy-and-burgundy Salvation banner. Opens an interactive "Your Faith
 * Walk & Prayer of Salvation" modal with the Sinner's Prayer (EN/AM),
 * two Scripture assurances, and a real request form for Apostle Daniel
 * Makonnen's free New Believer study guide — posted to
 * `POST /api/ministry-action` as a `"New Believer"` action.
 */
export function SalvationBanner({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<GuideRequestForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof GuideRequestForm, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  function handleClose() {
    setIsModalOpen(false);
    setForm(EMPTY_FORM);
    setErrors({});
    setIsConfirmed(false);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const payload = {
      actionType: "New Believer" as const,
      fullName: form.fullName,
      email: form.email,
      phone: form.phone || undefined,
      note: "Requested the free New Believer study guide (Christian Spiritual Growth — Vol. 1) from the Salvation prayer modal.",
    };

    const localCheck = ministryActionSchema.safeParse(payload);
    if (!localCheck.success) {
      const fieldErrors: Partial<Record<keyof GuideRequestForm, string>> = {};
      for (const issue of localCheck.error.issues) {
        const key = issue.path[0] as keyof GuideRequestForm;
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

  return (
    <section
      id="salvation"
      className="relative overflow-hidden border-y-2 border-blue-600/60 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] px-4 py-10 text-center sm:px-6 lg:px-8"
    >
      <Aurora
        className="absolute inset-0 opacity-40 mix-blend-screen"
        colorStops={["#091528", "#1B365D", "#2563EB", "#1E40AF"]}
        amplitude={1.1}
        blend={0.55}
        speed={0.6}
      />
      <div className="relative">
        <p className="font-crest text-sm font-bold uppercase tracking-[0.3em] text-amber-400">{dict.salvation.label}</p>
        <h2 className="mx-auto mt-3 max-w-2xl font-display text-2xl font-bold text-white sm:text-3xl">
          <SplitText text={dict.salvation.headline} animateBy="words" as="span" />
        </h2>
        <Magnet padding={40} magnetStrength={3} className="mt-6 inline-block">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="rounded border border-blue-400/50 bg-brand-logo-gradient px-8 py-3.5 font-nav text-sm font-extrabold uppercase tracking-wider shadow-lg hover:brightness-110"
          >
            <GradientText colors={["#60A5FA", "#FFFFFF", "#38BDF8", "#60A5FA"]} animationSpeed={6}>
              {dict.salvation.ctaButton}
            </GradientText>
          </button>
        </Magnet>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={dict.salvation.modalTitle}
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
          <div className="flex flex-col gap-5 text-sm text-slate-700">
            <div>
              <p className="leading-relaxed">{dict.salvation.prayerIntro}</p>
              <blockquote className="mt-3 border-l-2 border-amber-500 pl-4 italic leading-relaxed text-navy-900">
                {dict.salvation.prayerText}
              </blockquote>
            </div>

            <div className="rounded-xl bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                {dict.salvation.scriptureRomansRef}
              </p>
              <p className="mt-1 italic text-slate-700">{dict.salvation.scriptureRomansText}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-amber-800">
                {dict.salvation.scriptureJohnRef}
              </p>
              <p className="mt-1 italic text-slate-700">{dict.salvation.scriptureJohnText}</p>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <p className="leading-relaxed text-slate-600">{dict.salvation.requestGuideIntro}</p>

              <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
                <div>
                  <label htmlFor="salvation-name" className="mb-1 block text-xs font-medium text-slate-600">
                    {dict.forms.fullName}
                  </label>
                  <input
                    id="salvation-name"
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
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="salvation-email" className="mb-1 block text-xs font-medium text-slate-600">
                      {dict.forms.email}
                    </label>
                    <input
                      id="salvation-email"
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
                    <label htmlFor="salvation-phone" className="mb-1 block text-xs font-medium text-slate-600">
                      {dict.forms.phone}
                    </label>
                    <input
                      id="salvation-phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-1 flex w-full items-center justify-center gap-1.5 rounded bg-bh-crimson-gradient px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:brightness-110 disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  {dict.salvation.requestGuideCta}
                </button>
              </form>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
