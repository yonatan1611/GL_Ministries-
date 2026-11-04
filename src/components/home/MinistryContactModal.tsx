"use client";

import { useEffect, useState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import {
  contactPrayerSchema,
  CONTACT_TARGET_OFFICES,
  type ContactInquiryType,
} from "@/lib/validations";
import { postJson } from "@/lib/http";
import { cn, type Locale } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/providers/AppProviders";

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  message: string;
  targetOffice: (typeof CONTACT_TARGET_OFFICES)[number];
}

function emptyForm(
  locale: Locale,
  defaultOffice?: (typeof CONTACT_TARGET_OFFICES)[number]
): FormState {
  return {
    fullName: "",
    email: "",
    phone: "",
    message: "",
    targetOffice: defaultOffice ?? (locale === "am" ? "addis@glministries.org" : "dc@glministries.org"),
  };
}

const INQUIRY_LABELS: Record<Locale, Record<ContactInquiryType, string>> = {
  en: {
    "Prayer Request": "Prayer Request",
    "Pastoral Counseling": "Pastoral Counseling",
    "New Believer Discipleship": "New Believer & Discipleship Class",
    "Join a Ministry Team": "Join a Worship, Youth, or Outreach Team",
    "General Inquiry": "General Inquiry",
  },
  am: {
    "Prayer Request": "የጸሎት ጥያቄ",
    "Pastoral Counseling": "የእረኝነት ምክርና ጉብኝት",
    "New Believer Discipleship": "የአዲስ አማኝ እና ደቀ መዝሙርነት ትምህርት",
    "Join a Ministry Team": "በአምልኮ፣ በወጣቶች ወይም በስርጭት ቡድን ይሳተፉ",
    "General Inquiry": "ጠቅላላ ጥያቄ",
  },
};

/**
 * Shared modal behind every "Get Involved" card (prayer request,
 * discipleship class, ministry team, pastoral counseling). Validated
 * with `contactPrayerSchema` and routed to either the Addis Ababa HQ or
 * Washington, D.C. office inbox.
 */
export function MinistryContactModal({
  locale,
  inquiryType,
  onClose,
  defaultOffice,
}: {
  locale: Locale;
  inquiryType: ContactInquiryType | null;
  onClose: () => void;
  /** Pre-selects an office (e.g. the office that oversees a specific
   *  branch) instead of the usual locale-based default. */
  defaultOffice?: (typeof CONTACT_TARGET_OFFICES)[number];
}) {
  const dict = getDictionary(locale);
  const { showToast } = useToast();
  const [form, setForm] = useState<FormState>(emptyForm(locale, defaultOffice));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Each fresh open (inquiryType transitioning from null) should start
  // from this invocation's default office, not whatever was left over
  // from a previous branch's "Plan Your Visit" click.
  useEffect(() => {
    if (inquiryType) {
      setForm(emptyForm(locale, defaultOffice));
      setErrors({});
      setIsConfirmed(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inquiryType]);

  function handleClose() {
    setForm(emptyForm(locale, defaultOffice));
    setErrors({});
    setIsConfirmed(false);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inquiryType) return;

    const payload = { inquiryType, ...form };
    const localCheck = contactPrayerSchema.safeParse(payload);
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
    const { result } = await postJson("/api/contact", payload);
    setIsSubmitting(false);

    if (!result || !result.success) {
      showToast((result && !result.success && result.error) || dict.forms.error, "error");
      return;
    }

    setIsConfirmed(true);
    showToast(dict.contactModal.confirmTitle, "success");
  }

  if (!inquiryType) return null;

  const title = INQUIRY_LABELS[locale][inquiryType];

  return (
    <Modal isOpen={Boolean(inquiryType)} onClose={handleClose} title={title} closeLabel={dict.buttons.close}>
      {isConfirmed ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <MailCheck className="h-10 w-10 text-emerald-600" aria-hidden="true" />
          <h3 className="font-display text-lg font-bold text-navy-900">
            {dict.contactModal.confirmTitle}
          </h3>
          <p className="text-sm text-slate-600">{dict.contactModal.confirmBody}</p>
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
            <label htmlFor="contact-name" className="mb-1 block text-xs font-medium text-slate-600">
              {dict.forms.fullName}
            </label>
            <input
              id="contact-name"
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

          <div>
            <label htmlFor="contact-email" className="mb-1 block text-xs font-medium text-slate-600">
              {dict.forms.email}
            </label>
            <input
              id="contact-email"
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
            <label htmlFor="contact-phone" className="mb-1 block text-xs font-medium text-slate-600">
              {dict.forms.phone}
            </label>
            <input
              id="contact-phone"
              type="tel"
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
              {dict.contactModal.officeLabel}
            </span>
            <div className="flex gap-2">
              {CONTACT_TARGET_OFFICES.map((office) => (
                <button
                  key={office}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, targetOffice: office }))}
                  aria-pressed={form.targetOffice === office}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-xs font-medium",
                    form.targetOffice === office
                      ? "border-amber-600 bg-amber-50 text-amber-800"
                      : "border-slate-300 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {office === "addis@glministries.org"
                    ? dict.contactModal.officeEthiopia
                    : dict.contactModal.officeUs}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="contact-message" className="mb-1 block text-xs font-medium text-slate-600">
              {dict.forms.message}
            </label>
            <textarea
              id="contact-message"
              rows={4}
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-sm",
                errors.message ? "border-red-500" : "border-slate-300"
              )}
            />
            {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
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
