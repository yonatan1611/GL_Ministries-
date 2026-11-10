import { getDictionary } from "@/data/i18n";
import { DC_YOUTUBE_CHANNEL, ETHIOPIA_YOUTUBE_CHANNEL } from "@/data/social-media";
import type { Locale } from "@/lib/utils";
import { MinistryImage } from "@/components/ui/MinistryImage";

/**
 * Two official "Subscribe on YouTube" channel cards — Gospel Light
 * Church, DC (the primary North American channel) and Aware Gospel
 * Light Ethiopia (the Addis Ababa HQ / global-network channel) — shared
 * by the sermons-page VOD Theater header and the footer.
 */
export function YoutubeChannelCards({ locale, className }: { locale: Locale; className?: string }) {
  const dict = getDictionary(locale);

  const cards = [
    {
      channel: DC_YOUTUBE_CHANNEL,
      label: dict.sermonsPage.subscribeDcChannel,
      sublabel: `${DC_YOUTUBE_CHANNEL.handle} · ${DC_YOUTUBE_CHANNEL.subscriberCountLabel} Subscribers`,
    },
    {
      channel: ETHIOPIA_YOUTUBE_CHANNEL,
      label: dict.sermonsPage.subscribeEthiopiaChannel,
      sublabel: ETHIOPIA_YOUTUBE_CHANNEL.handle,
    },
  ];

  return (
    <div className={className}>
      {cards.map(({ channel, label, sublabel }) => (
        <a
          key={channel.id}
          href={channel.subscribeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl border border-navy-700 bg-navy-900 px-4 py-3 transition-colors hover:border-amber-500"
        >
          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-navy-600">
            <MinistryImage src={channel.avatarUrl} alt="" fill sizes="40px" className="object-cover" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-white">{label}</span>
            <span className="block truncate text-xs text-slate-400">{sublabel}</span>
          </span>
        </a>
      ))}
    </div>
  );
}
