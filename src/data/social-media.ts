import type { ImpactStat } from "@/types/ministry";
import { TITHELY_URL } from "@/lib/env";

/**
 * Verified official social accounts and authentic image assets for
 * Gospel Light Ministries International, confirmed directly against
 * live sources (not guessed):
 *  - The YouTube channel, handle, and all video IDs were cross-checked
 *    against the channel's own public RSS feed and YouTube's oEmbed
 *    endpoint (`author_name` confirmed as this channel for every ID).
 *  - Telegram and Instagram were read directly out of the channel's own
 *    video descriptions ("Connect with us: ...").
 *  - The WordPress media URLs were confirmed live (HTTP 200) on
 *    glministries.org.
 *
 * One correction from initial assumptions: there is no live Facebook
 * page at `facebook.com/EGLIC` / `web.facebook.com/EGLIC` (confirmed
 * 400/not found as of this rebuild). The ministry actually runs two
 * distinct Facebook pages — fully verified via Open Graph tags and a
 * working `graph.facebook.com/<id>/picture` response for both:
 *   - Washington, D.C. / Alexandria, VA: `gospellightchurchdc`
 *   - Aware / Addis Ababa branch: numeric page id `61552811746110`
 * `SOCIAL_LINKS.facebookPageUrl`/`facebookLiveUrl`/`facebookAvatarUrl`
 * below are kept pointing at the literal `EGLIC` URLs named in the
 * client brief (pending client confirmation — see the matching note in
 * `src/lib/env.ts`); `FACEBOOK_PAGES` holds the verified working
 * alternates actually used by `FacebookCommunitySection`.
 */

/** Canonical social/media + giving links, matching the shape requested
 *  for the bennyhinn.org-style multi-platform media hub. */
export const SOCIAL_LINKS = {
  youtubeChannelUrl: "https://www.youtube.com/@AwareGospelLightEthiopia",
  youtubeChannelId: "UCbvgk_wBqP2XgyE40xgHOjA",
  youtubeRssFeed:
    "https://www.youtube.com/feeds/videos.xml?channel_id=UCbvgk_wBqP2XgyE40xgHOjA",
  youtubeSubscribeUrl:
    "https://www.youtube.com/@AwareGospelLightEthiopia?sub_confirmation=1",
  facebookPageUrl: "https://web.facebook.com/EGLIC",
  facebookLiveUrl: "https://web.facebook.com/EGLIC/live",
  facebookAvatarUrl: "https://graph.facebook.com/EGLIC/picture?type=large",
  telegramUrl: "https://t.me/EGLIC",
  instagramUrl: "https://www.instagram.com/glic_aware",
  tiktokUrl: "https://www.tiktok.com/@awaregospellight",
  xTwitterUrl: "https://x.com/glministries",
  /** Single source of truth is `NEXT_PUBLIC_TITHELY_URL` (see
   *  `src/lib/env.ts`) — re-exported here so every `SOCIAL_LINKS`
   *  consumer can read giving/social links from one object. */
  tithelyGivingUrl: TITHELY_URL,
} as const;

/** YouTube channel metadata, derived from `SOCIAL_LINKS` plus a couple
 *  of fields (handle, avatar, videos list) that have no `SOCIAL_LINKS`
 *  equivalent. Kept as a convenience object for existing consumers
 *  (`MediaTheater`, `youtube-sync`) instead of duplicating the literals. */
export const YOUTUBE_CHANNEL = {
  id: SOCIAL_LINKS.youtubeChannelId,
  handle: "@AwareGospelLightEthiopia",
  url: SOCIAL_LINKS.youtubeChannelUrl,
  channelUrl: `https://www.youtube.com/channel/${SOCIAL_LINKS.youtubeChannelId}`,
  videosUrl: `https://www.youtube.com/channel/${SOCIAL_LINKS.youtubeChannelId}/videos`,
  subscribeUrl: SOCIAL_LINKS.youtubeSubscribeUrl,
  rssFeedUrl: SOCIAL_LINKS.youtubeRssFeed,
  avatarUrl:
    "https://yt3.googleusercontent.com/aJ4lB3okt7pYM9v0P42bOZc8XwjoAAJexbnGdT_7fFSzQn5L8f-7IIjvrQh2121vMQM-pZR7=s900-c-k-c0x00ffffff-no-rj",
} as const;

export const TELEGRAM_URL = SOCIAL_LINKS.telegramUrl;
export const INSTAGRAM_URL = SOCIAL_LINKS.instagramUrl;

/** Verified, live Facebook pages — see the file header note on why
 *  these differ from `SOCIAL_LINKS.facebookPageUrl`. */
export const FACEBOOK_PAGES = {
  washingtonDc: {
    username: "gospellightchurchdc",
    url: "https://www.facebook.com/gospellightchurchdc/",
    name: "Gospel Light International Church, Washington DC | Alexandria VA",
    pictureUrl: "https://graph.facebook.com/gospellightchurchdc/picture?type=large",
  },
  awareAddisAbaba: {
    username: "61552811746110",
    url: "https://www.facebook.com/p/Gospel-Light-International-Church-Aware-61552811746110/",
    name: "Gospel Light International Church Aware | Addis Ababa",
    pictureUrl: "https://graph.facebook.com/61552811746110/picture?type=large",
  },
} as const;

/** Primary Facebook page shown site-wide, overridable via env for
 *  future rebranding without a code change. */
export const FACEBOOK_PAGE_URL =
  process.env.NEXT_PUBLIC_FACEBOOK_PAGE_URL ?? FACEBOOK_PAGES.washingtonDc.url;
export const FACEBOOK_PAGE_PICTURE_URL = FACEBOOK_PAGES.washingtonDc.pictureUrl;

/** Authentic ministry photographs, hotlinked from the ministry's own
 *  live WordPress media library and YouTube thumbnails. See
 *  `MinistryImage` for the resilient fallback wrapper every usage goes
 *  through — these hosts are outside our control and can be slow/down. */
export const MINISTRY_IMAGES = {
  apostleDanielPortrait: "https://glministries.org/wp-content/uploads/2020/05/Pastor_300x209.png",
  apostleDanielPreachingHd: "https://i.ytimg.com/vi/oLx8cvN83w4/hqdefault.jpg",
  pastorAberhamPortrait: "https://glministries.org/wp-content/uploads/2022/01/IMG-3452-1024x768.jpeg",
  historyRevival1970s: "https://glministries.org/wp-content/uploads/2020/05/old4-1-300x209.jpg",
  eastShowaSynodBadge: "https://glministries.org/wp-content/uploads/2020/05/East_Showa_300x300.png",
  bookHearingGodsVoiceCover: "https://glministries.org/wp-content/uploads/2020/05/glm-book2.png",
  sanctuaryWorshipChoir: "https://i.ytimg.com/vi/rwRtlhY3mW8/hqdefault.jpg",
  crusadeRevivalGathering: "https://i.ytimg.com/vi/FvnQFVRwdLs/hqdefault.jpg",
  pastoralTimeBanner: "https://i.ytimg.com/vi/-ilsw36Mh8E/hqdefault.jpg",
  /** Local, always-available fallback used by `MinistryImage` when an
   *  external host above is slow or unreachable. */
  localFallback: "/brand/glm-logo.jpg",
} as const;

/** Verified YouTube video ids behind the thumbnails above — the single
 *  source of truth for the hero's ambient background loop and watch
 *  modals, so the same ids aren't retyped (and risk drifting) across
 *  `HeroSection` and `WashingtonDcSpotlightSection`. */
export const MINISTRY_VIDEO_IDS = {
  worshipChoir: "rwRtlhY3mW8",
  crusadeRevival: "FvnQFVRwdLs",
  pastoralTime: "-ilsw36Mh8E",
  apostleDanielPreaching: "oLx8cvN83w4",
} as const;

/**
 * "Storytelling by the Numbers" impact metrics, inspired by
 * bennyhinn.org's large-photo-plus-numbers homepage storytelling.
 * Every figure here is traceable to the verified 2026 synod/branch
 * directory audit in `src/data/locations.ts` (see `SYNOD_SUMMARY` and
 * `computeSynodBranchCounts`) or to Apostle Daniel Makonnen's
 * documented ministry history — none are placeholder/guessed numbers.
 */
export const IMPACT_STATS: ImpactStat[] = [
  {
    id: "impact-years-ministry",
    value: "43+",
    labelEn: "Years of Apostolic & Revival Ministry",
    labelAm: "ዓመታት የሐዋርያዊና የተሃድሶ አገልግሎት",
    detailEn: "Ignited during the historic 1970s Ethiopian Evangelical Awakening",
    detailAm: "ከ1970ዎቹ የኢትዮጵያ ወንጌላውያን ተሃድሶ ጀምሮ የቀጠለ",
  },
  {
    id: "impact-ethiopian-branches",
    value: "32",
    labelEn: "Ethiopian Branch Churches & Stations",
    labelAm: "በኢትዮጵያ የሚገኙ አጥቢያዎችና የስርጭት ጣቢያዎች",
    detailEn:
      "Spanning Addis Ababa (3), East Showa (5), and Eastern Ethiopia (24 congregations across 22 stations)",
    detailAm: "በአዲስ አበባ፣ በምስራቅ ሸዋ እና በምስራቅ ኢትዮጵያ",
  },
  {
    id: "impact-lives-touched",
    value: "100,000+",
    labelEn: "Lives Touched & Equipped Globally",
    labelAm: "በዓለም ዙሪያ በወንጌል የተደረሱና የታነጹ ነፍሳት",
    detailEn: "Through revival crusades, conferences, satellite TV, and digital VOD",
    detailAm: "በታላላቅ ጉባኤዎች፣ በቴሌቪዥንና በዲጂታል ስርጭቶች",
  },
  {
    id: "impact-rural-stations",
    value: "22",
    labelEn: "Rural Mission & Church-Planting Stations",
    labelAm: "የገጠር ወንጌል ስርጭትና ቤተክርስቲያን ተከላ ጣቢያዎች",
    detailEn: "Reaching unreached peasant associations across Eastern Ethiopia",
    detailAm: "በምስራቅ ኢትዮጵያ የገበሬ ማህበራት ውስጥ የተተከሉ",
  },
  {
    id: "impact-teaching-archive",
    value: "1990–2026",
    labelEn: "Unbroken Global Teaching Archive",
    labelAm: "ከ1982 ዓ.ም ጀምሮ የተጠበቀ የትምህርት ክምችት",
    detailEn: "Decades of audio, video, and print discipleship resources",
    detailAm: "በድምጽ፣ በቪዲዮና በመጽሐፍት የተዘጋጁ ትምህርቶች",
  },
  {
    id: "impact-continental-hqs",
    value: "2",
    labelEn: "Continental Headquarters",
    labelAm: "አህጉራዊ ዋና ቢሮዎች (አዲስ አበባ እና ዋሽንግተን ዲሲ)",
    detailEn: "Aware HQ in Addis Ababa, Ethiopia & Washington, D.C. / Alexandria, VA",
    detailAm: "አዋሬ (አዲስ አበባ) እና ዋሽንግተን ዲሲ / አሌክሳንድሪያ",
  },
];
