"use client";

import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { SYNOD_SUMMARY } from "@/data/locations";
import type { Locale } from "@/lib/utils";
import type { BranchLocation } from "@/types/ministry";
import { Modal } from "@/components/ui/Modal";

interface BranchDetailModalProps {
  locale: Locale;
  location: BranchLocation | null;
  onClose: () => void;
  onPlanVisit: (location: BranchLocation) => void;
}

/**
 * Rich branch detail modal: full address, synod oversight, verified
 * service times/phone/email, a Google Maps link, and a hand-off into
 * `MinistryContactModal` to plan a visit or reach the pastor.
 */
export function BranchDetailModal({ locale, location, onClose, onPlanVisit }: BranchDetailModalProps) {
  const dict = getDictionary(locale);
  if (!location) return null;

  const synodEntry = SYNOD_SUMMARY.find((entry) => entry.synod === location.synod);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`;

  return (
    <Modal
      isOpen={Boolean(location)}
      onClose={onClose}
      title={`${location.nameEn} · ${location.nameAm}`}
      closeLabel={dict.buttons.close}
    >
      <div className="flex flex-col gap-4 text-sm text-slate-700">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {dict.locationsPage.synodOversightLabel}
          </p>
          <p className="mt-1">{synodEntry ? (locale === "am" ? synodEntry.labelAm : synodEntry.labelEn) : location.synod}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {dict.locationsPage.addressLabel}
          </p>
          <p className="mt-1 flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
            {location.address}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {dict.locationsPage.serviceTimesLabel}
          </p>
          <p className="mt-1 leading-relaxed">
            {locale === "am" ? location.serviceTimesAm : location.serviceTimesEn}
          </p>
        </div>

        <div className="flex flex-col gap-2 rounded-xl bg-slate-50 p-4">
          <a href={`tel:${location.phone}`} className="flex items-center gap-2 hover:text-amber-700">
            <Phone className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
            {location.phone}
          </a>
          <a href={`mailto:${location.email}`} className="flex items-center gap-2 hover:text-amber-700">
            <Mail className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
            {location.email}
          </a>
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            {dict.locationsPage.openInMaps}
          </a>
          <button
            type="button"
            onClick={() => onPlanVisit(location)}
            className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
          >
            {dict.locationsPage.planVisit}
          </button>
        </div>
      </div>
    </Modal>
  );
}
