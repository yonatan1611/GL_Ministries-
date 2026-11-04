"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, HandHeart, MapPin, MapPinned, Radio, UsersRound, Wrench } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { UPCOMING_EVENTS_2026 } from "@/data/ministry-content";
import type { ContactInquiryType, MinistryActionType } from "@/lib/validations";
import type { Locale } from "@/lib/utils";
import type { MinistryEvent } from "@/types/ministry";
import { EventRsvpModal } from "@/components/home/EventRsvpModal";
import { MinistryActionModal } from "@/components/home/MinistryActionModal";
import { MinistryContactModal } from "@/components/home/MinistryContactModal";
import { usePrayerModal } from "@/components/providers/AppProviders";

/**
 * "Upcoming Events" (`id="upcoming-events"`) plus the 4 restored
 * ministry-action cards — Volunteer, Rural Outreach, 24/7 Prayer, and
 * Fellowship Groups — which replace the legacy homepage's 4 dead
 * `href="#"` cards with real, working workflows.
 */
export function UpcomingEventsSection({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { openPrayerModal } = usePrayerModal();
  const [activeEvent, setActiveEvent] = useState<MinistryEvent | null>(null);
  const [activeAction, setActiveAction] = useState<MinistryActionType | null>(null);
  const [activeInquiry, setActiveInquiry] = useState<ContactInquiryType | null>(null);

  return (
    <>
      <section id="upcoming-events" className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-2xl font-bold text-navy-900 sm:text-3xl">
              {dict.eventsSection.sectionTitle}
            </h2>
            <p className="mt-3 text-sm text-slate-600 sm:text-base">{dict.eventsSection.sectionSubtitle}</p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {UPCOMING_EVENTS_2026.map((event) => (
              <div
                key={event.id}
                className="flex flex-col border border-[#E6DFD3] p-6 shadow-sm"
              >
                <span className="inline-flex w-fit items-center rounded-full bg-navy-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-navy-700">
                  {event.category}
                </span>
                <h3 className="mt-3 font-display text-lg font-bold text-navy-900">
                  {locale === "am" ? event.titleAm : event.titleEn}
                </h3>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                  <CalendarDays className="h-4 w-4 text-amber-600" aria-hidden="true" />
                  {locale === "am" ? event.dateRangeAm : event.dateRangeEn}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin className="h-4 w-4 text-amber-600" aria-hidden="true" />
                  {locale === "am" ? event.locationAm : event.locationEn}
                </p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                  {locale === "am" ? event.descriptionAm : event.descriptionEn}
                </p>
                {event.isLiveStreamed && (
                  <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-crimson-600">
                    <Radio className="h-3.5 w-3.5" aria-hidden="true" />
                    {dict.eventsSection.liveStreamed}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setActiveEvent(event)}
                  className="mt-5 w-full rounded bg-brand-logo-gradient px-4 py-2.5 font-nav text-sm font-bold uppercase tracking-wide text-white hover:brightness-110"
                >
                  {dict.buttons.rsvp}
                </button>
              </div>
            ))}
          </div>
        </div>

        <EventRsvpModal locale={locale} event={activeEvent} onClose={() => setActiveEvent(null)} />
      </section>

      <section className="bg-navy-950 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              {dict.actionCards.sectionTitle}
            </h2>
            <p className="mt-3 text-sm text-navy-300 sm:text-base">{dict.actionCards.sectionSubtitle}</p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <button
              type="button"
              onClick={() => setActiveAction("Volunteer")}
              className="flex flex-col items-start border border-navy-800 bg-navy-900 p-6 text-left shadow-sm transition-colors hover:border-amber-600"
            >
              <Wrench className="h-6 w-6 text-amber-400" aria-hidden="true" />
              <p className="mt-4 font-display text-base font-bold text-white">{dict.actionCards.volunteerTitle}</p>
              <p className="mt-2 text-sm leading-relaxed text-navy-300">{dict.actionCards.volunteerDesc}</p>
            </button>

            <div className="flex flex-col items-start border border-navy-800 bg-navy-900 p-6 text-left shadow-sm transition-colors hover:border-amber-600">
              <button type="button" onClick={() => setActiveAction("Outreach")} className="flex flex-col items-start text-left">
                <MapPinned className="h-6 w-6 text-amber-400" aria-hidden="true" />
                <p className="mt-4 font-display text-base font-bold text-white">{dict.actionCards.outreachTitle}</p>
                <p className="mt-2 text-sm leading-relaxed text-navy-300">{dict.actionCards.outreachDesc}</p>
              </button>
              <Link
                href={`/${locale}/locations?synod=Eastern+Ethiopia`}
                className="mt-3 text-xs font-semibold text-amber-400 hover:underline"
              >
                {dict.actionCards.outreachLinkLabel}
              </Link>
            </div>

            <div className="flex flex-col items-start border border-navy-800 bg-navy-900 p-6 text-left shadow-sm transition-colors hover:border-amber-600">
              <button type="button" onClick={openPrayerModal} className="flex flex-col items-start text-left">
                <HandHeart className="h-6 w-6 text-amber-400" aria-hidden="true" />
                <p className="mt-4 font-display text-base font-bold text-white">{dict.actionCards.prayerTitle}</p>
                <p className="mt-2 text-sm leading-relaxed text-navy-300">{dict.actionCards.prayerDesc}</p>
              </button>
              <button
                type="button"
                onClick={() => setActiveInquiry("Pastoral Counseling")}
                className="mt-3 text-xs font-semibold text-amber-400 hover:underline"
              >
                {dict.actionCards.pastoralCounselingCta}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setActiveAction("Home Groups")}
              className="flex flex-col items-start border border-navy-800 bg-navy-900 p-6 text-left shadow-sm transition-colors hover:border-amber-600"
            >
              <UsersRound className="h-6 w-6 text-amber-400" aria-hidden="true" />
              <p className="mt-4 font-display text-base font-bold text-white">{dict.actionCards.groupsTitle}</p>
              <p className="mt-2 text-sm leading-relaxed text-navy-300">{dict.actionCards.groupsDesc}</p>
            </button>
          </div>
        </div>

        <MinistryActionModal locale={locale} actionType={activeAction} onClose={() => setActiveAction(null)} />
        <MinistryContactModal locale={locale} inquiryType={activeInquiry} onClose={() => setActiveInquiry(null)} />
      </section>
    </>
  );
}
