"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { HeartHandshake } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { getLocaleFromPathname } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { usePrayerModal } from "@/components/providers/AppProviders";
import { PrayerRequestForm } from "@/components/prayer/PrayerRequestForm";

/**
 * Single global prayer-request modal, controlled by `usePrayerModal()`
 * and rendered once in `[locale]/layout.tsx` — the Top Bar, Hero,
 * Navbar, and Footer all open this same instance rather than each
 * owning a separate modal.
 */
export function GlobalPrayerModal() {
  const pathname = usePathname() ?? "/en";
  const locale = getLocaleFromPathname(pathname);
  const dict = getDictionary(locale);
  const { isPrayerModalOpen, closePrayerModal } = usePrayerModal();
  const [isConfirmed, setIsConfirmed] = useState(false);

  function handleClose() {
    setIsConfirmed(false);
    closePrayerModal();
  }

  return (
    <Modal
      isOpen={isPrayerModalOpen}
      onClose={handleClose}
      title={dict.prayerModal.title}
      closeLabel={dict.buttons.close}
    >
      {isConfirmed ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <HeartHandshake className="h-10 w-10 text-emerald-600" aria-hidden="true" />
          <h3 className="font-display text-lg font-bold text-navy-900">
            {dict.prayerModal.confirmTitle}
          </h3>
          <p className="text-sm text-slate-600">{dict.prayerModal.confirmBody}</p>
          <button
            type="button"
            onClick={handleClose}
            className="mt-3 w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
          >
            {dict.buttons.close}
          </button>
        </div>
      ) : (
        <>
          <p className="mb-3 text-sm text-slate-600">{dict.prayerModal.subtitle}</p>
          <PrayerRequestForm locale={locale} onSuccess={() => setIsConfirmed(true)} idPrefix="prayer-modal" />
        </>
      )}
    </Modal>
  );
}
