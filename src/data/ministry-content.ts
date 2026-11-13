import type { Book, DailyDevotional, LeaderProfile, MinistryEvent, NewsHighlight, Sermon } from "@/types/ministry";
import { MINISTRY_IMAGES } from "@/data/social-media";
import { CONTACT_EMAILS, CONTACT_PHONES } from "@/lib/env";

/**
 * Sermons, books, leadership profiles, consolidated doctrinal content,
 * and 2026–2027 events for Gospel Light Ministries International.
 *
 * Replaces several legacy WordPress defects: broken sermon embeds and an
 * unconfigured search plugin (`page_id=28288`), four untitled "Buy"
 * buttons with no descriptions (`page_id=28327`), an empty stub page for
 * Senior Pastor Aberham Bedasso (`page_id=28597`), misspellings
 * ("Apostel", "Makonen", "comunisim", "edifiying", "familly"), and the
 * homepage's frozen August 21–23, 2020 ("የተሃድሶ በረከቶች") conference banner.
 */

// ---------------------------------------------------------------------------
// A. Sermons
// ---------------------------------------------------------------------------

const APOSTLE_DANIEL_EN = "Apostle Daniel Makonnen";
const APOSTLE_DANIEL_AM = "ሐዋሪያው ዳንኤል መኮንን";
const PASTOR_ERMIAS_EN = "Pastor Ermias Girma";
const PASTOR_ERMIAS_AM = "ፓ/ር ኤርሚያስ ግርማ";
const DC_PASTORAL_TEAM_EN = "Apostle Daniel Makonnen & DC Pastoral Team";
const DC_PASTORAL_TEAM_AM = "ሐዋሪያው ዳንኤል መኮንን እና የዲሲ አገልጋዮች ቡድን";

/**
 * Real sermon/teaching catalog from Gospel Light Ministries
 * International's two official YouTube channels. Every `youtubeId`
 * below was independently verified — cross-checked against each
 * channel's own public RSS feed and YouTube's oEmbed endpoint,
 * confirming `author_name`/`title` match the channel and video for
 * every entry:
 *  - `s1`–`s22` (`channelSource: "ETHIOPIA"`): Aware Gospel Light
 *    Ethiopia (`@AwareGospelLightEthiopia`, `UCbvgk_wBqP2XgyE40xgHOjA`),
 *    the original Addis Ababa HQ catalog. Titles are the channel's own
 *    (trimmed of the repeated "@AwareGospelLightEthiopia" tag).
 *  - `s23`–`s38` (`channelSource: "DC"`): Gospel Light Church, DC
 *    (`@gospellightchurchdc6393`, `UC4dgEThd8fyJIMUsHmM4aVA`), the
 *    primary North American channel (Washington, D.C. / Alexandria,
 *    VA). `titleAm` for these 16 is the channel's exact oEmbed title;
 *    `titleEn` is an English rendering of it since the channel does not
 *    publish English titles.
 *
 * `scriptureEn`/`scriptureAm`, `duration`, and `audioMp3Url`/
 * `audioSizeMb` are left unset where we have no verified real value for
 * them — these are real sermon uploads, not studio recordings with a
 * separate downloadable low-bandwidth MP3, so fabricating a duration or
 * file size would misrepresent them. `getYoutubeWatchUrl`/
 * `getYoutubeEmbedUrl`/`getYoutubeThumbnailUrl` in `@/lib/youtube`
 * derive the real watch/embed/thumbnail URLs from `youtubeId` — no need
 * to store those redundantly per entry.
 */
export const SERMONS: Sermon[] = [
  {
    id: "s1",
    slug: "pastoral-time-part-4-born-of-the-spirit",
    titleAm:
      "አማኞች በአዲስ ቋንቋ መናገራቸው በመንፈስ ቅዱስ የመጠመቃቸው ምልክት ነው | የእረኝነት ጊዜ ከፓ/ር ዳንኤል መኮንን ጋር | ክፍል 4",
    titleEn: "Pastoral Time with Apostle Daniel Makonnen — Part 4: Speaking in Tongues as a Sign of Spirit Baptism",
    speakerEn: APOSTLE_DANIEL_EN,
    speakerAm: APOSTLE_DANIEL_AM,
    topic: "Discipleship",
    yearLabel: "October 2026",
    youtubeId: "-ilsw36Mh8E",
    channelSource: "ETHIOPIA",
    summaryEn:
      "Part four of Apostle Daniel Makonnen's ongoing Pastoral Time teaching series, addressing believers speaking in tongues as a sign of being baptized in the Holy Spirit.",
    summaryAm:
      "ከሐዋሪያው ዳንኤል መኮንን ጋር ከሚቀርበው የእረኝነት ጊዜ ተከታታይ ትምህርት አራተኛ ክፍል፤ አማኞች በአዲስ ቋንቋ መናገራቸው በመንፈስ ቅዱስ ስለመጠመቃቸው ምልክት ይናገራል።",
    featured: true,
  },
  {
    id: "s2",
    slug: "pastoral-time-part-3-word-of-god",
    titleAm: "የእግዚአብሔር ቃል በአማኝ ሕይወት ውስጥ | የእረኝነት ጊዜ ከፓ/ር ዳንኤል መኮንን ጋር | ክፍል 3",
    titleEn: "The Word of God in the Believer's Life — Pastoral Time Part 3",
    speakerEn: APOSTLE_DANIEL_EN,
    speakerAm: APOSTLE_DANIEL_AM,
    topic: "Christian Growth",
    yearLabel: "Pastoral Time Series",
    youtubeId: "oLx8cvN83w4",
    channelSource: "ETHIOPIA",
    summaryEn: "How the Word of God forms and sustains the believer's daily life, from Apostle Daniel Makonnen's Pastoral Time series.",
    summaryAm: "የእግዚአብሔር ቃል በአማኝ የዕለት ተዕለት ሕይወት ውስጥ ያለውን ቦታ የሚዳስስ፣ ከፓ/ር ዳንኤል መኮንን የእረኝነት ጊዜ ተከታታይ ትምህርት።",
  },
  {
    id: "s3",
    slug: "born-of-the-holy-spirit-meaning",
    titleAm: "ከመንፈስ ቅዱስ መወለድ በእርግጥ ምን ማለት ነው? | የእረኝነት ጊዜ ከፓ/ር ዳንኤል መኮንን ጋር",
    titleEn: "What Does It Truly Mean to Be Born of the Holy Spirit?",
    speakerEn: APOSTLE_DANIEL_EN,
    speakerAm: APOSTLE_DANIEL_AM,
    topic: "Holy Spirit",
    yearLabel: "Pastoral Time Series",
    youtubeId: "IspYtE3w0tk",
    channelSource: "ETHIOPIA",
    summaryEn: "Apostle Daniel Makonnen unpacks what it truly means, biblically, to be born of the Holy Spirit.",
    summaryAm: "ከመንፈስ ቅዱስ መወለድ በመጽሐፍ ቅዱስ መሠረት በእርግጥ ምን ማለት እንደሆነ ፓ/ር ዳንኤል መኮንን ያብራራል።",
  },
  {
    id: "s4",
    slug: "pastoral-time-spiritual-counsel",
    titleAm: "የእረኝነት ጊዜ ከፓ/ር ዳንኤል መኮንን ጋር — መንፈሳዊ ምክር",
    titleEn: "Pastoral Time & Spiritual Counsel with Apostle Daniel Makonnen",
    speakerEn: APOSTLE_DANIEL_EN,
    speakerAm: APOSTLE_DANIEL_AM,
    topic: "Discipleship",
    yearLabel: "Pastoral Time Series",
    youtubeId: "R4naM2zWOOU",
    channelSource: "ETHIOPIA",
    summaryEn: "Pastoral counsel and discipleship guidance from Apostle Daniel Makonnen's Pastoral Time series.",
    summaryAm: "ከፓ/ር ዳንኤል መኮንን የእረኝነት ጊዜ ተከታታይ ትምህርት የሚቀርብ መንፈሳዊ ምክር።",
  },
  {
    id: "s5",
    slug: "unchanging-god-in-changing-times",
    titleAm: "ዓለምና ዘመን ሲለወጥ የማይለወጠው አምላክ | ፓ/ር ዳንኤል መኮንን",
    titleEn: "The Unchanging God in Changing Times",
    speakerEn: APOSTLE_DANIEL_EN,
    speakerAm: APOSTLE_DANIEL_AM,
    topic: "Christian Growth",
    yearLabel: "October 2026",
    youtubeId: "ouZLcHq0v1I",
    channelSource: "ETHIOPIA",
    summaryEn: "As the world and times change, Apostle Daniel Makonnen points believers to the unchanging character of God.",
    summaryAm: "ዓለምና ዘመን ቢለወጡም የማይለወጠውን የእግዚአብሔርን ባህሪ ፓ/ር ዳንኤል መኮንን ያስተምራል።",
    featured: true,
  },
  {
    id: "s6",
    slug: "ministry-of-the-watchman-part-1",
    titleAm: "የጉበኛ አገልግሎት | ክፍል 1 | ፓ/ር ዳንኤል መኮንን",
    titleEn: "The Ministry of the Watchman — Part 1 (Standing on the Wall in Prayer)",
    speakerEn: APOSTLE_DANIEL_EN,
    speakerAm: APOSTLE_DANIEL_AM,
    topic: "Revival & Repentance",
    yearLabel: "Watchman Series",
    youtubeId: "BBBZKXMJdH0",
    channelSource: "ETHIOPIA",
    summaryEn: "Part one of a teaching series on the biblical calling of the watchman who stands on the wall in prayer for the church and nation.",
    summaryAm: "ለቤተክርስቲያንና ለሀገር በጸሎት ግንብ ላይ ስለሚቆመው የጉበኛ መጽሐፍ ቅዱሳዊ ጥሪ የሚያስተምር ተከታታይ ትምህርት የመጀመሪያ ክፍል።",
  },
  {
    id: "s7",
    slug: "ministry-of-the-watchman-part-2",
    titleAm: "የጉበኛ መንፈሳዊ ባህሪያት እና የምልጃ ጸሎት | የጉበኛ አገልግሎት ክፍል 2 | ፓ/ር ዳንኤል መኮንን",
    titleEn: "Spiritual Character of a Watchman & Intercessory Prayer — Part 2",
    speakerEn: APOSTLE_DANIEL_EN,
    speakerAm: APOSTLE_DANIEL_AM,
    topic: "Revival & Repentance",
    yearLabel: "Watchman Series",
    youtubeId: "ERqdZZVrbb4",
    channelSource: "ETHIOPIA",
    summaryEn: "Part two of the Watchman series, on the spiritual character required of a watchman and the practice of intercessory prayer.",
    summaryAm: "የጉበኛ አገልግሎት ተከታታይ ትምህርት ሁለተኛ ክፍል፤ ስለ ጉበኛ መንፈሳዊ ባህሪያትና የምልጃ ጸሎት።",
  },
  {
    id: "s8",
    slug: "new-year-message-great-banquet",
    titleAm: "\"እግዚአብሔር ለሕዝቡ ታላቅ ግብዣ አዘጋጅቷል\" | የአዲስ ዓመት መልዕክት ከፓ/ር ዳንኤል መኮንን",
    titleEn: "\"God Has Prepared a Great Banquet for His People\" — New Year Message",
    speakerEn: APOSTLE_DANIEL_EN,
    speakerAm: APOSTLE_DANIEL_AM,
    topic: "Prophetic Archive",
    yearLabel: "New Year Message",
    youtubeId: "fwWmoNDX_lA",
    channelSource: "ETHIOPIA",
    summaryEn: "A New Year prophetic message from Apostle Daniel Makonnen on God's prepared banquet for His people.",
    summaryAm: "እግዚአብሔር ለሕዝቡ ያዘጋጀውን ታላቅ ግብዣ የሚመለከት፣ ከፓ/ር ዳንኤል መኮንን የቀረበ የአዲስ ዓመት መልዕክት።",
  },
  {
    id: "s9",
    slug: "christianity-not-stagnant-life",
    titleAm: "\"ክርስትና በአንድ ቦታ የመቆም ሕይወት አይደለም\" | ፓ/ር ዳንኤል መኮንን (ከ20 ዓመት በፊት)",
    titleEn: "\"Christianity Is Not a Stagnant Life\" — Classic Archive Teaching",
    speakerEn: APOSTLE_DANIEL_EN,
    speakerAm: APOSTLE_DANIEL_AM,
    topic: "Christian Growth",
    yearLabel: "Classic Archive",
    youtubeId: "IcNuM0dC4nk",
    channelSource: "ETHIOPIA",
    summaryEn: "A classic archive teaching from Apostle Daniel Makonnen on Christian growth as continual forward motion, not a stagnant life.",
    summaryAm: "ክርስትና በአንድ ቦታ የመቆም ሳይሆን ተከታታይ የእድገት ሕይወት እንደሆነ የሚያስተምር የቀድሞ ትምህርት ማህደር።",
  },
  {
    id: "s10",
    slug: "sacrifice-accepted-by-god-resurrection-vigil",
    titleAm: "እግዚአብሔር የተቀበለው መስዋዕት | ፓ/ር ዳንኤል መኮንን | ትንሣኤ አዳር ፕሮግራም",
    titleEn: "The Sacrifice Accepted by God — Resurrection Vigil Message",
    speakerEn: APOSTLE_DANIEL_EN,
    speakerAm: APOSTLE_DANIEL_AM,
    topic: "Revival & Repentance",
    yearLabel: "Resurrection Vigil",
    youtubeId: "K9A36kwdog4",
    channelSource: "ETHIOPIA",
    summaryEn: "A Resurrection Vigil message from Apostle Daniel Makonnen on the sacrifice God accepts.",
    summaryAm: "እግዚአብሔር ስለሚቀበለው መስዋዕት የሚያስተምር የትንሣኤ አዳር መልእክት ከፓ/ር ዳንኤል መኮንን።",
  },
  {
    id: "s11",
    slug: "our-god-is-a-speaking-god-1990-archive",
    titleAm: "አምላካችን የሚናገር አምላክ ነው! | ፓስተር ዳንኤል መኮንን | 1982 ዓ.ም",
    titleEn: "Our God Is a Speaking God! — 1990 (1982 E.C.) Classic Archive on Hearing God's Voice",
    speakerEn: APOSTLE_DANIEL_EN,
    speakerAm: APOSTLE_DANIEL_AM,
    topic: "Hearing God's Voice",
    yearLabel: "1990 Classic Archive",
    youtubeId: "l8T0UXCy_Dg",
    channelSource: "ETHIOPIA",
    summaryEn: "A foundational 1990 (1982 E.C.) archive teaching from Apostle Daniel Makonnen on God as a speaking God.",
    summaryAm: "እግዚአብሔር የሚናገር አምላክ መሆኑን የሚያስተምር ከ1982 ዓ.ም (1990 እ.አ.አ) የቀረበ የቀድሞ መሠረታዊ ትምህርት።",
  },
  {
    id: "s12",
    slug: "seeking-god-not-one-time-experience",
    titleAm: "\"እግዚአብሔርን መፈለግ የአንድ ጊዜ ልምምድ አይደለም\" | ፓስተር ዳንኤል መኮንን",
    titleEn: "\"Seeking God Is Not a One-Time Experience\" — Continual Hunger for God",
    speakerEn: APOSTLE_DANIEL_EN,
    speakerAm: APOSTLE_DANIEL_AM,
    topic: "Revival & Repentance",
    yearLabel: "Revival Archive",
    youtubeId: "qSpzYYS4J4U",
    channelSource: "ETHIOPIA",
    summaryEn: "Apostle Daniel Makonnen teaches that seeking God is a continual pursuit, not a one-time experience.",
    summaryAm: "እግዚአብሔርን መፈለግ ቀጣይነት ያለው እንጂ የአንድ ጊዜ ልምምድ እንዳልሆነ ፓ/ር ዳንኤል መኮንን ያስተምራል።",
  },
  {
    id: "s13",
    slug: "gifts-of-the-holy-spirit-1991-archive",
    titleAm: "የመንፈስ ቅዱስ ስጦታዎች | ፓ/ር ዳንኤል መኮንን | 1983 ዓ.ም",
    titleEn: "The Gifts of the Holy Spirit — 1991 (1983 E.C.) Foundational Teaching",
    speakerEn: APOSTLE_DANIEL_EN,
    speakerAm: APOSTLE_DANIEL_AM,
    topic: "Holy Spirit",
    yearLabel: "1991 Classic Archive",
    youtubeId: "2rS_Mntcc2M",
    channelSource: "ETHIOPIA",
    summaryEn: "A foundational 1991 (1983 E.C.) archive teaching from Apostle Daniel Makonnen on the gifts of the Holy Spirit.",
    summaryAm: "ስለ መንፈስ ቅዱስ ስጦታዎች የሚያስተምር ከ1983 ዓ.ም (1991 እ.አ.አ) የቀረበ መሠረታዊ ትምህርት።",
  },
  {
    id: "s14",
    slug: "prayer-of-the-saints-luke-1",
    titleAm: "\"የቅዱሳን ፀሎት\" ሉቃስ 1:8-25 | ፓስተር ዳንኤል መኰንን",
    titleEn: "\"The Prayer of the Saints\" (Luke 1:8–25)",
    speakerEn: APOSTLE_DANIEL_EN,
    speakerAm: APOSTLE_DANIEL_AM,
    scriptureEn: "Luke 1:8–25",
    scriptureAm: "ሉቃስ 1፡8-25",
    topic: "Revival & Repentance",
    yearLabel: "Prayer Teaching",
    youtubeId: "iGQakuij3D4",
    channelSource: "ETHIOPIA",
    summaryEn: "A teaching on the prayer of the saints from the account of Zechariah in Luke 1:8–25.",
    summaryAm: "ስለ ቅዱሳን ጸሎት ከዘካርያስ ታሪክ (ሉቃስ 1፡8-25) የሚያስተምር መልእክት።",
  },
  {
    id: "s15",
    slug: "prophetic-discernment-short",
    titleAm: "\"ነቢይ ከስልክ ቁጥራችሁ ጋር ጉዳይ የለውም!\" | ፓ/ር ዳንኤል መኮንን",
    titleEn: "Biblical Discernment in Prophetic Ministry (Short Highlight)",
    speakerEn: APOSTLE_DANIEL_EN,
    speakerAm: APOSTLE_DANIEL_AM,
    topic: "Prophetic Archive",
    yearLabel: "YouTube Short",
    youtubeId: "K23fOLXYig8",
    channelSource: "ETHIOPIA",
    summaryEn: "A short highlight from Apostle Daniel Makonnen on discernment in prophetic ministry.",
    summaryAm: "ስለ ትንቢታዊ አገልግሎት መለየት የሚያስተምር አጭር ድንቅ ቅንጭብ ከፓ/ር ዳንኤል መኮንን።",
  },
  {
    id: "s16",
    slug: "nehemiah-revival-series-part-1",
    titleAm: "\"ታደስን ስንል ምን ስንሆን ነው?\" | የነህምያ መጽሐፍ ክፍል 1 | ፓ/ር ኤርሚያስ ግርማ",
    titleEn: "What Does It Mean to Be Renewed? — Book of Nehemiah Revival Series Part 1",
    speakerEn: PASTOR_ERMIAS_EN,
    speakerAm: PASTOR_ERMIAS_AM,
    topic: "Revival & Repentance",
    yearLabel: "Nehemiah Revival Series",
    youtubeId: "UGCISMx4LzU",
    channelSource: "ETHIOPIA",
    summaryEn: "Part one of Pastor Ermias Girma's revival series through the Book of Nehemiah, asking what true renewal means.",
    summaryAm: "ከፓ/ር ኤርሚያስ ግርማ የነህምያ መጽሐፍ ተከታታይ ትምህርት የመጀመሪያ ክፍል — ታደስን ስንል ምን ማለት እንደሆነ ይዳስሳል።",
  },
  {
    id: "s17",
    slug: "nehemiah-revival-series-part-2",
    titleAm: "እውነተኛ ተሃድሶ የሚጀምረው ከየት ነው? | የነህምያ መጽሐፍ ክፍል 2 | ፓ/ር ኤርሚያስ ግርማ",
    titleEn: "Where Does True Revival Begin? — Book of Nehemiah Revival Series Part 2",
    speakerEn: PASTOR_ERMIAS_EN,
    speakerAm: PASTOR_ERMIAS_AM,
    topic: "Revival & Repentance",
    yearLabel: "Nehemiah Revival Series",
    youtubeId: "PaTAuAgnqks",
    channelSource: "ETHIOPIA",
    summaryEn: "Part two of the Nehemiah revival series, asking where true revival actually begins.",
    summaryAm: "የነህምያ መጽሐፍ ተከታታይ ትምህርት ሁለተኛ ክፍል — እውነተኛ ተሃድሶ ከየት እንደሚጀምር ይዳስሳል።",
  },
  {
    id: "s18",
    slug: "nehemiah-revival-series-part-3-fasting-prayer",
    titleAm: "ፆም ፀሎትና ተሐድሶ | የነህምያ መፅሐፍ ክፍል 3 | ፓ/ር ኤርሚያስ ግርማ",
    titleEn: "Fasting, Prayer & Revival — Nehemiah Part 3",
    speakerEn: PASTOR_ERMIAS_EN,
    speakerAm: PASTOR_ERMIAS_AM,
    topic: "Revival & Repentance",
    yearLabel: "October 2026",
    youtubeId: "hGLnywN75wk",
    channelSource: "ETHIOPIA",
    summaryEn: "Part three of the Nehemiah revival series, on fasting, prayer, and revival.",
    summaryAm: "የነህምያ መጽሐፍ ተከታታይ ትምህርት ሦስተኛ ክፍል — ፆም፣ ጸሎትና ተሐድሶ።",
  },
  {
    id: "s19",
    slug: "nehemiah-revival-series-part-4-starts-with-me",
    titleAm: "እውነተኛ ተሐድሶ የሚጀምረው ከእኔ ነው! | የነህምያ መፅሐፍ ክፍል 4 | ፓ/ር ኤርሚያስ ግርማ",
    titleEn: "True Revival Starts With Me — Nehemiah Part 4",
    speakerEn: PASTOR_ERMIAS_EN,
    speakerAm: PASTOR_ERMIAS_AM,
    topic: "Revival & Repentance",
    yearLabel: "October 2026",
    youtubeId: "FvnQFVRwdLs",
    channelSource: "ETHIOPIA",
    summaryEn: "The concluding part of the Nehemiah revival series — true revival starts with me.",
    summaryAm: "የነህምያ መጽሐፍ ተከታታይ ትምህርት መደምደሚያ ክፍል — እውነተኛ ተሐድሶ የሚጀምረው ከእኔ ነው።",
  },
  {
    id: "s20",
    slug: "spirit-filled-life",
    titleAm: "በመንፈስ ቅዱስ የተሞላ ሕይወት | ፓ/ር ኤርሚያስ ግርማ",
    titleEn: "A Spirit-Filled Life",
    speakerEn: PASTOR_ERMIAS_EN,
    speakerAm: PASTOR_ERMIAS_AM,
    topic: "Holy Spirit",
    yearLabel: "October 2026",
    youtubeId: "vvWlVpsgt6o",
    channelSource: "ETHIOPIA",
    summaryEn: "Pastor Ermias Girma teaches on what it means to live a life filled with the Holy Spirit.",
    summaryAm: "በመንፈስ ቅዱስ የተሞላ ሕይወት ምን ማለት እንደሆነ ፓ/ር ኤርሚያስ ግርማ ያስተምራል።",
  },
  {
    id: "s21",
    slug: "when-the-hand-of-god-comes",
    titleAm: "የእግዚአብሔር እጅ ስትመጣ ድንቅ እና ተዓምራት ይሆናል! | ፓ/ር ሰለሞን መንገሻ",
    titleEn: "When the Hand of God Comes, Signs and Wonders Follow",
    speakerEn: "Pastor Solomon Mengesha",
    speakerAm: "ፓ/ር ሰለሞን መንገሻ",
    topic: "Prophetic Archive",
    yearLabel: "October 2026",
    youtubeId: "J7gAnQf-znY",
    channelSource: "ETHIOPIA",
    summaryEn: "Pastor Solomon Mengesha teaches that signs and wonders follow when the hand of God moves.",
    summaryAm: "የእግዚአብሔር እጅ ስትመጣ ድንቅ ነገሮችና ተዓምራት እንደሚከተሉ ፓ/ር ሰለሞን መንገሻ ያስተምራል።",
  },
  {
    id: "s22",
    slug: "live-sanctuary-worship-aware-choir",
    titleAm: "ድንቅ የአምልኮ ጊዜ ከፓ/ር ሔኖክ ኃይሉ እና የወንጌል ብርሃን መዘምራን",
    titleEn: "A Wonderful Time of Worship with Pastor Henok Hailu & the Gospel Light Choir",
    speakerEn: "Pastor Henok Hailu",
    speakerAm: "ፓ/ር ሔኖክ ኃይሉ",
    topic: "Christian Growth",
    yearLabel: "October 2026 · Live Worship",
    youtubeId: "rwRtlhY3mW8",
    channelSource: "ETHIOPIA",
    summaryEn: "Live sanctuary worship from the Aware congregation, led by Pastor Henok Hailu and the Gospel Light Choir.",
    summaryAm: "ከአዋሬ አጥቢያ የቀረበ ቀጥታ የአምልኮ ጊዜ፣ በፓ/ር ሔኖክ ኃይሉ እና በወንጌል ብርሃን መዘምራን የተመራ።",
    featured: true,
  },

  // -- Gospel Light Church, DC (@gospellightchurchdc6393) ------------------
  {
    id: "s23",
    slug: "dc-in-the-season-the-lord-looked-upon-us",
    titleAm: "ጌታ በተመለከተበት ወራት",
    titleEn: "In the Season When the Lord Looked Upon Us",
    speakerEn: DC_PASTORAL_TEAM_EN,
    speakerAm: DC_PASTORAL_TEAM_AM,
    topic: "Revival & Repentance",
    yearLabel: "August 2026 · Washington, D.C.",
    youtubeId: "5wNOAS6kUQ8",
    channelSource: "DC",
    summaryEn: "A Gospel Light Church, DC message on the season in which the Lord turns His face toward His people.",
    summaryAm: "ጌታ ፊቱን ወደ ሕዝቡ በሚመለከትበት ወቅት ላይ ያተኮረ፣ ከጎስፔል ላይት ቤተክርስቲያን ዲሲ የቀረበ መልእክት።",
    featured: true,
  },
  {
    id: "s24",
    slug: "dc-give-me-this-living-water",
    titleAm: "ይህን ውኃ ስጠኝ",
    titleEn: "\"Give Me This Living Water\" (John 4:15)",
    speakerEn: DC_PASTORAL_TEAM_EN,
    speakerAm: DC_PASTORAL_TEAM_AM,
    scriptureEn: "John 4:15",
    scriptureAm: "ዮሐንስ 4፡15",
    topic: "Holy Spirit",
    yearLabel: "August 2026 · Washington, D.C.",
    youtubeId: "2jnqsYe7vG8",
    channelSource: "DC",
    summaryEn: "From the woman at the well's request in John 4:15, a Gospel Light Church, DC teaching on thirsting for the living water only Christ supplies.",
    summaryAm: "በዮሐንስ 4፡15 ላይ ከምትገኘው የሳምራዊቱ ሴት ጥያቄ በመነሳት፣ ክርስቶስ ብቻ ስለሚሰጠው ውኃ የጥማት ልምምድ የሚያስተምር መልእክት።",
    featured: true,
  },
  {
    id: "s25",
    slug: "dc-when-jesus-is-exalted",
    titleAm: "ኢየሱስ ሲልቅ",
    titleEn: "When Jesus Is Exalted Above All",
    speakerEn: DC_PASTORAL_TEAM_EN,
    speakerAm: DC_PASTORAL_TEAM_AM,
    topic: "Christian Growth",
    yearLabel: "July 2026 · Washington, D.C.",
    youtubeId: "0aLh_QS4qCA",
    channelSource: "DC",
    summaryEn: "A Gospel Light Church, DC message on what changes in a believer's life when Jesus is lifted up above every other concern.",
    summaryAm: "ኢየሱስ ከሁሉ በላይ ከፍ ሲል በአማኝ ሕይወት ውስጥ ስለሚከሰተው ለውጥ የሚያስተምር መልእክት።",
  },
  {
    id: "s26",
    slug: "dc-jesus-anchor-of-our-soul",
    titleAm: "ኢየሱስ የነፍሳችን መልሕቅ",
    titleEn: "Jesus, the Anchor of Our Soul (Hebrews 6:19)",
    speakerEn: DC_PASTORAL_TEAM_EN,
    speakerAm: DC_PASTORAL_TEAM_AM,
    scriptureEn: "Hebrews 6:19",
    scriptureAm: "ዕብራውያን 6፡19",
    topic: "Christian Growth",
    yearLabel: "April 2026 · Washington, D.C.",
    youtubeId: "PzMOrUAqIjA",
    channelSource: "DC",
    summaryEn: "A Gospel Light Church, DC teaching from Hebrews 6:19 on Christ as the sure and steadfast anchor of the believer's soul.",
    summaryAm: "ከዕብራውያን 6፡19 በመነሳት ክርስቶስ ለአማኝ ነፍስ የማይናወጥ መልሕቅ መሆኑን የሚያስተምር መልእክት።",
  },
  {
    id: "s27",
    slug: "dc-he-is-worthy-worship-and-word",
    titleAm: "\"ይገባዋል\"",
    titleEn: "\"He Is Worthy!\" — Worship & Word Live",
    speakerEn: APOSTLE_DANIEL_EN,
    speakerAm: APOSTLE_DANIEL_AM,
    topic: "Christian Growth",
    yearLabel: "February 2026 · Washington, D.C.",
    youtubeId: "PPdkq9gddlU",
    channelSource: "DC",
    summaryEn: "A live Gospel Light Church, DC worship and word service declaring that Christ alone is worthy of all honor and praise.",
    summaryAm: "ክርስቶስ ብቻ ለሁሉም ክብርና ምስጋና እንደሚገባው የሚያውጅ፣ ከጎስፔል ላይት ቤተክርስቲያን ዲሲ ቀጥታ የአምልኮና የቃል አገልግሎት።",
  },
  {
    id: "s28",
    slug: "dc-the-blessed-comforter",
    titleAm: "የምስጉኑ መጽናኛ",
    titleEn: "The Blessed Comforter — Ministry of the Holy Spirit",
    speakerEn: APOSTLE_DANIEL_EN,
    speakerAm: APOSTLE_DANIEL_AM,
    topic: "Holy Spirit",
    yearLabel: "January 2026 · Washington, D.C.",
    youtubeId: "wFMq7eGkcdM",
    channelSource: "DC",
    summaryEn: "A Gospel Light Church, DC teaching on the Holy Spirit's ministry as the believer's blessed Comforter.",
    summaryAm: "መንፈስ ቅዱስ ለአማኝ የምስጉኑ መጽናኛ ሆኖ የሚያደርገውን አገልግሎት የሚያስተምር መልእክት።",
  },
  {
    id: "s29",
    slug: "dc-acceptable-year-of-the-lord",
    titleAm: "የጌታ ዓመት",
    titleEn: "The Acceptable Year of the Lord — New Year Service",
    speakerEn: APOSTLE_DANIEL_EN,
    speakerAm: APOSTLE_DANIEL_AM,
    topic: "Prophetic Archive",
    yearLabel: "January 2026 · Washington, D.C.",
    youtubeId: "sq_uK0gD4qA",
    channelSource: "DC",
    summaryEn: "Gospel Light Church, DC's New Year service message declaring the acceptable year of the Lord over His people.",
    summaryAm: "በሕዝቡ ላይ የጌታ ዓመት መልካም ዓመት እንደሆነ የሚያውጅ የአዲስ ዓመት የአገልግሎት መልእክት።",
  },
  {
    id: "s30",
    slug: "dc-prayer-that-opens-the-heavens-part-2",
    titleAm: "ሰማያትን የሚከፍት ጸሎት ክፍል 2",
    titleEn: "Prayer That Opens the Heavens — Part 2",
    speakerEn: APOSTLE_DANIEL_EN,
    speakerAm: APOSTLE_DANIEL_AM,
    topic: "Revival & Repentance",
    yearLabel: "December 2025 · Washington, D.C.",
    youtubeId: "g9iov2UBINM",
    channelSource: "DC",
    summaryEn: "Part two of a Gospel Light Church, DC prayer series on the kind of prayer that opens the heavens over a life.",
    summaryAm: "በሕይወት ላይ ሰማያትን የሚከፍት ጸሎት ዓይነት ላይ ያተኮረ ተከታታይ ትምህርት ሁለተኛ ክፍል።",
  },
  {
    id: "s31",
    slug: "dc-christ-our-true-king",
    titleAm: "ንጉስ አድርግልን",
    titleEn: "Christ Our True King",
    speakerEn: APOSTLE_DANIEL_EN,
    speakerAm: APOSTLE_DANIEL_AM,
    topic: "Christian Growth",
    yearLabel: "November 2025 · Washington, D.C.",
    youtubeId: "m9w-bFUw0Zs",
    channelSource: "DC",
    summaryEn: "A Gospel Light Church, DC message calling believers to crown Christ as true King over every area of life.",
    summaryAm: "አማኞች ክርስቶስን በሕይወታቸው ዘርፍ ሁሉ ላይ እውነተኛ ንጉስ አድርገው እንዲያነግሱ የሚጠራ መልእክት።",
  },
  {
    id: "s32",
    slug: "dc-power-with-a-divine-mission",
    titleAm: "ተልዕኮ ያለው ኃይል",
    titleEn: "Power With a Divine Mission (Acts 1:8)",
    speakerEn: APOSTLE_DANIEL_EN,
    speakerAm: APOSTLE_DANIEL_AM,
    scriptureEn: "Acts 1:8",
    scriptureAm: "የሐዋርያት ሥራ 1፡8",
    topic: "Holy Spirit",
    yearLabel: "October 2025 · Washington, D.C.",
    youtubeId: "Te-plEjQano",
    channelSource: "DC",
    summaryEn: "From Acts 1:8, a Gospel Light Church, DC teaching that the Spirit's power is always given with a God-given mission attached.",
    summaryAm: "ከሐዋርያት ሥራ 1፡8 በመነሳት፣ የመንፈስ ቅዱስ ኃይል ከእግዚአብሔር ዘንድ ከተልዕኮ ጋር እንደሚሰጥ የሚያስተምር መልእክት።",
  },
  {
    id: "s33",
    slug: "dc-jesus-christ-our-blessed-song",
    titleAm: "የምስጉኑ ቅኔ ፡ ኢየሱስ ክርስቶስ",
    titleEn: "Jesus Christ, Our Blessed Song",
    speakerEn: APOSTLE_DANIEL_EN,
    speakerAm: APOSTLE_DANIEL_AM,
    topic: "Christian Growth",
    yearLabel: "October 2025 · Washington, D.C.",
    youtubeId: "F-ejvpVvFAg",
    channelSource: "DC",
    summaryEn: "A Gospel Light Church, DC message celebrating Jesus Christ as the believer's blessed song of praise.",
    summaryAm: "ኢየሱስ ክርስቶስ ለአማኝ የምስጉኑ ቅኔ መሆኑን የሚያከብር መልእክት።",
  },
  {
    id: "s34",
    slug: "dc-called-to-be-a-great-people-of-god",
    titleAm: "ታላቅ ሕዝብ ነን",
    titleEn: "Called to Be a Great People of God",
    speakerEn: APOSTLE_DANIEL_EN,
    speakerAm: APOSTLE_DANIEL_AM,
    topic: "Discipleship",
    yearLabel: "October 2025 · Washington, D.C.",
    youtubeId: "eGV7i3wRQtE",
    channelSource: "DC",
    summaryEn: "A Gospel Light Church, DC teaching calling the congregation to walk as the great people God has called them to be.",
    summaryAm: "ጉባኤው እግዚአብሔር የጠራቸውን ታላቅ ሕዝብነት ኑሮ እንዲመስል የሚጠራ መልእክት።",
  },
  {
    id: "s35",
    slug: "dc-i-will-keep-you-from-the-hour-of-trial",
    titleAm: "ከፈተናው ሰዓት እጠብቅሃለሁ",
    titleEn: "\"I Will Keep You From the Hour of Trial\" (Revelation 3:10)",
    speakerEn: APOSTLE_DANIEL_EN,
    speakerAm: APOSTLE_DANIEL_AM,
    scriptureEn: "Revelation 3:10",
    scriptureAm: "ራእይ 3፡10",
    topic: "Prophetic Archive",
    yearLabel: "August 2025 · Washington, D.C.",
    youtubeId: "Qy5EdHaD9w4",
    channelSource: "DC",
    summaryEn: "From Revelation 3:10, a Gospel Light Church, DC message on Christ's promise to keep His faithful ones from the hour of trial.",
    summaryAm: "ከራእይ 3፡10 በመነሳት፣ ክርስቶስ ለታማኞቹ ከፈተናው ሰዓት እንደሚጠብቃቸው የገባውን ቃል የሚያስተምር መልእክት።",
  },
  {
    id: "s36",
    slug: "dc-my-heart-is-steadfast-in-the-lord",
    titleAm: "ልቤ በእግዚአብሔር ጸና",
    titleEn: "\"My Heart Is Steadfast in the Lord\" (1 Samuel 2:1)",
    speakerEn: APOSTLE_DANIEL_EN,
    speakerAm: APOSTLE_DANIEL_AM,
    scriptureEn: "1 Samuel 2:1",
    scriptureAm: "1ኛ ሳሙኤል 2፡1",
    topic: "Christian Growth",
    yearLabel: "July 2025 · Washington, D.C.",
    youtubeId: "A8Dce3mro5Q",
    channelSource: "DC",
    summaryEn: "From Hannah's song in 1 Samuel 2:1, a Gospel Light Church, DC message on a heart made steadfast in the Lord.",
    summaryAm: "ከሃና መዝሙር (1ኛ ሳሙኤል 2፡1) በመነሳት፣ ልብ በእግዚአብሔር ስለሚጸናበት መንገድ የሚያስተምር መልእክት።",
  },
  {
    id: "s37",
    slug: "dc-renew-our-days-as-of-old",
    titleAm: "ዘመናችንን እንደ ቀድሞ አድስ",
    titleEn: "\"Renew Our Days as of Old\" (Lamentations 5:21) — DC Revival Service",
    speakerEn: APOSTLE_DANIEL_EN,
    speakerAm: APOSTLE_DANIEL_AM,
    scriptureEn: "Lamentations 5:21",
    scriptureAm: "ሰቆቃው ኤርምያስ 5፡21",
    topic: "Revival & Repentance",
    yearLabel: "July 2025 · Washington, D.C.",
    youtubeId: "hMbwSFrDg0Q",
    channelSource: "DC",
    summaryEn: "A Gospel Light Church, DC revival service message crying out, from Lamentations 5:21, for God to renew His people's days as of old.",
    summaryAm: "ከሰቆቃው ኤርምያስ 5፡21 በመነሳት፣ እግዚአብሔር ዘመናቸውን እንደ ቀድሞ እንዲያድስ የሚማልድ የተሃድሶ አገልግሎት መልእክት።",
  },
  {
    id: "s38",
    slug: "dc-master-of-the-storm",
    titleAm: "የማዕበሉ አዛዥ",
    titleEn: "Master of the Storm (Mark 4:39)",
    speakerEn: APOSTLE_DANIEL_EN,
    speakerAm: APOSTLE_DANIEL_AM,
    scriptureEn: "Mark 4:39",
    scriptureAm: "ማርቆስ 4፡39",
    topic: "Discipleship",
    yearLabel: "July 2025 · Washington, D.C.",
    youtubeId: "K3E9BYMw52A",
    channelSource: "DC",
    summaryEn: "From Mark 4:39, a Gospel Light Church, DC teaching on Christ as Master of every storm a believer faces.",
    summaryAm: "ከማርቆስ 4፡39 በመነሳት፣ ክርስቶስ አማኝ ለሚያጋጥመው ማዕበል ሁሉ አዛዥ መሆኑን የሚያስተምር መልእክት።",
  },
];

// ---------------------------------------------------------------------------
// A2. Daily Scripture Devotionals
// ---------------------------------------------------------------------------

/**
 * Seven-day Daily Scripture devotional series authored by Apostle
 * Daniel Makonnen, inspired by bennyhinn.org's Daily Scripture page —
 * seeds the Postgres `daily_devotionals` table (see `src/lib/db.ts`), which
 * is then fully editable (add/edit/feature/delete) from the Admin
 * Portal. Exactly one entry should carry `isFeaturedToday: true` at a
 * time; that entry is shown first as the homepage's "Today's Key
 * Scripture."
 */
export const DAILY_DEVOTIONALS: DailyDevotional[] = [
  {
    id: "devo-1-shepherds-voice",
    dateLabel: "November 2, 2026",
    isFeaturedToday: false,
    updatedAt: "2026-11-02T00:00:00.000Z",
    titleEn: "Discerning the Shepherd's Voice",
    titleAm: "የእረኛውን ድምጽ መለየት",
    scriptureRefEn: "John 10:27",
    scriptureRefAm: "ዮሐንስ 10፡27",
    verseTextEn: "\"My sheep listen to my voice; I know them, and they follow me.\"",
    verseTextAm: "\"በጎቼ ድምፄን ይሰማሉ፤ እኔም አውቃቸዋለሁ፤ እነርሱም ይከተሉኛል።\"",
    reflectionEn:
      "Before a sheep ever learns to follow, it must first learn to recognize its shepherd's voice amid every other sound competing for its attention. In a season saturated with noise — news, opinion, and the clamor of a changing world — the Lord still speaks clearly to those who have trained their ears on Him through His Word and in prayer. Discernment is not a rare gift reserved for the few; it is the fruit of daily nearness to the Shepherd.",
    reflectionAm:
      "አንድ በግ ከመከተሉ በፊት በመጀመሪያ የእረኛውን ድምጽ ከሌሎች ድምፆች መካከል መለየት መማር አለበት። ትኩረታችንን በሚፈልጉ በርካታ ድምፆች በተሞላበት በዚህ ዘመን፣ ጌታ አሁንም በቃሉና በጸሎት ጆሮቸውን ላሰለጠኑ በግልጽ ይናገራል። መለየት ለጥቂቶች ብቻ የተሰጠ ልዩ ስጦታ አይደለም፤ ከእረኛው ጋር በየቀኑ ባለው ቅርበት የሚገኝ ፍሬ ነው።",
    prayerDeclarationEn:
      "Lord, tune my heart to Your voice above every other voice. Let me know You so intimately that I follow without hesitation, today and every day.",
    prayerDeclarationAm:
      "ጌታ ሆይ፣ ልቤን ከሌላ ድምጽ ሁሉ በላይ ለድምጽህ አስተካክል። ዛሬም ሆነ ዘወትር ያለ ማመንታት እንድከተልህ በቅርበት አውቅህ።",
    authorEn: "Apostle Daniel Makonnen",
    authorAm: "ሐዋሪያው ዳንኤል መኮንን",
  },
  {
    id: "devo-2-watchmen-wall",
    dateLabel: "November 3, 2026",
    isFeaturedToday: false,
    updatedAt: "2026-11-03T00:00:00.000Z",
    titleEn: "Standing as Watchmen on the Wall",
    titleAm: "በግንቡ ላይ እንደ ጉበኛ መቆም",
    scriptureRefEn: "Isaiah 62:6–7",
    scriptureRefAm: "ኢሳይያስ 62፡6-7",
    verseTextEn:
      "\"I have posted watchmen on your walls, Jerusalem; they will never be silent day or night. You who call on the Lord, give yourselves no rest, and give him no rest till he establishes Jerusalem and makes her praise resound on the earth.\"",
    verseTextAm:
      "\"ጠባቂዎችን በቅጽርህ ላይ አቆምሁ፤ ኦ ኢየሩሳሌም፤ ቀንም ሌሊትም ዝም አይሉም። እናንተ እግዚአብሔርን የምታስቡ፥ እስኪያቆም ድረስ ዕረፍት አትስጡት፤ ምስጋናውንም በምድር ላይ እስኪያቆም ድረስ ራሱን ዕረፍት አትስጡት።\"",
    reflectionEn:
      "The ministry of the watchman is not glamorous, but it is indispensable: a steady, often unseen posture of intercession that refuses to grow weary. Gospel Light's own Watchman teaching series exists precisely because revival has never come to a people who were casual about prayer. Every outreach station, every congregation, every family needs someone willing to stand on the wall and refuse silence until God moves.",
    reflectionAm:
      "የጉበኛ አገልግሎት ማራኪ ባይመስልም ግን የማይተካ ነው፤ ብዙ ጊዜ የማይታይ ነገር ግን የማይደክም የምልጃ አቋም ነው። የወንጌል ብርሃን የጉበኛ ትምህርት ተከታታይ ትምህርት የተፈጠረው ተሃድሶ ለጸሎት ቀላል ለሆኑ ህዝቦች ፈጽሞ ስላልመጣ ነው። እያንዳንዱ ስርጭት ጣቢያ፣ እያንዳንዱ ጉባኤ፣ እያንዳንዱ ቤተሰብ እግዚአብሔር እስኪነቃነቅ ድረስ በግንቡ ላይ ቆሞ ዝምታን የሚከላክል ሰው ይፈልጋል።",
    prayerDeclarationEn:
      "Lord, make me a faithful watchman over my family, my church, and my nation. I will not grow weary in prayer until Your purposes are established.",
    prayerDeclarationAm:
      "ጌታ ሆይ፣ ለቤተሰቤ፣ ለቤተክርስቲያኔና ለሀገሬ የታመነ ጉበኛ አድርገኝ። ፍቃድህ እስኪጸና ድረስ በጸሎት አልደክምም።",
    authorEn: "Apostle Daniel Makonnen",
    authorAm: "ሐዋሪያው ዳንኤል መኮንን",
  },
  {
    id: "devo-3-unchanging-covenant",
    dateLabel: "November 4, 2026",
    isFeaturedToday: false,
    updatedAt: "2026-11-04T00:00:00.000Z",
    titleEn: "The Unchanging Covenant of God",
    titleAm: "የእግዚአብሔር የማይለወጥ ቃል ኪዳን",
    scriptureRefEn: "Hebrews 13:8",
    scriptureRefAm: "ዕብራውያን 13፡8",
    verseTextEn: "\"Jesus Christ is the same yesterday and today and forever.\"",
    verseTextAm: "\"ኢየሱስ ክርስቶስ ትናንትም ዛሬም እንዲሁም ለዘላለም አንድ ነው።\"",
    reflectionEn:
      "Governments rise and fall, economies shift, and even the ministry's own surrounding culture has changed dramatically across four decades of revival work — yet the God who called Apostle Daniel Makonnen out of persecution in the 1970s is the same God who sustains this ministry today. Our confidence does not rest in circumstances but in the unchanging character of the One who keeps every covenant He has ever made.",
    reflectionAm:
      "መንግሥታት ይነሳሉ ይወድቃሉ፣ ኢኮኖሚዎች ይለወጣሉ፣ በዚህ የአርባ ዓመታት የተሃድሶ አገልግሎት ዘመንም ባህላችን እጅጉን ተለውጧል — ነገር ግን ሐዋሪያው ዳንኤል መኮንንን ከ1970ዎቹ ስደት የጠራው አምላክ፣ ይህን አገልግሎት እስከ ዛሬ የሚያስጠብቀው አምላክ ያው ራሱ ነው። መተማመናችን በሁኔታዎች ላይ ሳይሆን ያደረገውን ቃል ኪዳን ሁሉ በሚጠብቀው የማይለወጠው የእርሱ ባህርይ ላይ ነው።",
    prayerDeclarationEn:
      "Father, in every season of change, I anchor my hope in Your unchanging nature. You were faithful to our fathers, and You are faithful to me today.",
    prayerDeclarationAm:
      "አባት ሆይ፣ በለውጥ ዘመን ሁሉ ተስፋዬን በማይለወጠው ባህርይህ ላይ አደርጋለሁ። ለአባቶቻችን ታማኝ ነበርህ፤ ዛሬም ለእኔ ታማኝ ነህ።",
    authorEn: "Apostle Daniel Makonnen",
    authorAm: "ሐዋሪያው ዳንኤል መኮንን",
  },
  {
    id: "devo-4-continual-prayer",
    dateLabel: "November 5, 2026",
    isFeaturedToday: false,
    updatedAt: "2026-11-05T00:00:00.000Z",
    titleEn: "Seeking His Face in Continual Prayer",
    titleAm: "በማያቋርጥ ጸሎት ፊቱን መፈለግ",
    scriptureRefEn: "2 Chronicles 7:14",
    scriptureRefAm: "2ኛ ዜና መዋዕል 7፡14",
    verseTextEn:
      "\"If my people, who are called by my name, will humble themselves and pray and seek my face and turn from their wicked ways, then I will hear from heaven, and I will forgive their sin and will heal their land.\"",
    verseTextAm:
      "\"በስሜ የተጠሩ ሕዝቤ ራሳቸውን አዋርደው፥ ቢጸልዩ፥ ፊቴንም ቢፈልጉ፥ ከክፉ መንገዳቸውም ቢመለሱ፥ እኔ ከሰማይ እሰማለሁ፥ ኃጢአታቸውንም እደመስሳለሁ፥ ምድራቸውንም እፈውሳለሁ።\"",
    reflectionEn:
      "Seeking God's face is not a one-time experience — it is a continual posture, as Apostle Daniel Makonnen has taught across decades of ministry. Revival has never come through a single prayer meeting, but through a people who return again and again, humbling themselves before the Lord. This promise given to Israel still frames our expectation today: humility and prayer precede healing.",
    reflectionAm:
      "የእግዚአብሔርን ፊት መፈለግ የአንድ ጊዜ ልምምድ አይደለም — ሐዋሪያው ዳንኤል መኮንን ባስተማሩት መሠረት፣ ቀጣይነት ያለው አቋም ነው። ተሃድሶ በአንድ የጸሎት ስብሰባ ፈጽሞ አልመጣም፤ ነገር ግን ደጋግመው ወደ ጌታ ራሳቸውን በሚያዋርዱ ሕዝብ ነው የመጣው። ለእስራኤል የተሰጠው ይህ ተስፋ አሁንም ዛሬ የምንጠበቀውን ያሳየናል፦ ትህትናና ጸሎት ከፈውስ ይቀድማል።",
    prayerDeclarationEn:
      "Lord, I humble myself before You today. I will not relent in seeking Your face until I see Your healing over my family, my city, and my nation.",
    prayerDeclarationAm:
      "ጌታ ሆይ፣ ዛሬ ራሴን በፊትህ አዋርዳለሁ። በቤተሰቤ፣ በከተማዬና በሀገሬ ላይ ፈውስህን እስካይ ድረስ ፊትህን ከመፈለግ አልቦዝንም።",
    authorEn: "Apostle Daniel Makonnen",
    authorAm: "ሐዋሪያው ዳንኤል መኮንን",
  },
  {
    id: "devo-5-rooted-bearing-fruit",
    dateLabel: "November 6, 2026",
    isFeaturedToday: false,
    updatedAt: "2026-11-06T00:00:00.000Z",
    titleEn: "Rooted & Bearing Fruit in the Spirit",
    titleAm: "ሥር ተተክሎ በመንፈስ ፍሬ ማፍራት",
    scriptureRefEn: "Jeremiah 17:7–8",
    scriptureRefAm: "ኤርምያስ 17፡7-8",
    verseTextEn:
      "\"But blessed is the one who trusts in the Lord, whose confidence is in him. They will be like a tree planted by the water that sends out its roots by the stream. It does not fear when heat comes; its leaves are always green. It has no worries in a year of drought and never fails to bear fruit.\"",
    verseTextAm:
      "\"በእግዚአብሔር የሚታመን ሰው ግን የተባረከ ነው፥ የእግዚአብሔርም ተስፋ ነው። በውኃ አጠገብ እንደ ተተከለ ዛፍ ይሆናል፥ ሥሩንም በወንዝ አጠገብ ይሰድዳል፤ ሐሩርም ቢመጣ አይፈራም፥ ቅጠሎቹም ለምልመው ይኖራሉ፤ በድርቅ ዓመትም አይጨነቅም፥ ፍሬ ከማፍራትም አይቋረጥም።\"",
    reflectionEn:
      "Four decades of fruitfulness — from a single congregation in Aware to 32 branches and stations across Ethiopia — did not come from shallow soil. It came from a ministry rooted deep in dependence on the Lord through every drought season: persecution, scarcity, and opposition. The same promise holds for every believer who sinks their roots deep into Christ rather than into circumstances.",
    reflectionAm:
      "ከአዋሬ ያለ አንድ ጉባኤ ጀምሮ በኢትዮጵያ ውስጥ ወደ 32 አጥቢያዎችና ጣቢያዎች የደረሰው የአርባ ዓመታት ፍሬያማነት ከጥልቀት ባልነበረው አፈር አልመጣም። ስደት፣ እጥረትና ተቃውሞ ባለበት በእያንዳንዱ ድርቅ ወቅት በጌታ ላይ ጥልቅ ጥገኝነት ከተመሰረተ አገልግሎት የመጣ ነው። ይህ ተስፋ በሁኔታዎች ላይ ሳይሆን ሥሩን በክርስቶስ ውስጥ ጥልቅ ለሚያደርግ አማኝ ሁሉ ይጸናል።",
    prayerDeclarationEn:
      "Lord, let my roots go deep into You, not into my circumstances. Whatever drought comes, I will remain green and continue to bear fruit for Your Kingdom.",
    prayerDeclarationAm:
      "ጌታ ሆይ፣ ሥሬ በሁኔታዎች ላይ ሳይሆን በአንተ ውስጥ ጥልቅ ይሁን። ምንም ዓይነት ድርቅ ቢመጣ፣ ለምልሜ ለመንግሥትህ ፍሬ ማፍራቴን እቀጥላለሁ።",
    authorEn: "Apostle Daniel Makonnen",
    authorAm: "ሐዋሪያው ዳንኤል መኮንን",
  },
  {
    id: "devo-6-pressing-on-maturity",
    dateLabel: "November 7, 2026",
    isFeaturedToday: false,
    updatedAt: "2026-11-07T00:00:00.000Z",
    titleEn: "Pressing On to Spiritual Maturity",
    titleAm: "ወደ መንፈሳዊ ብስለት መገስገስ",
    scriptureRefEn: "Hebrews 6:1",
    scriptureRefAm: "ዕብራውያን 6፡1",
    verseTextEn:
      "\"Therefore let us move beyond the elementary teachings about Christ and be taken forward to maturity, not laying again the foundation of repentance from acts that lead to death, and of faith in God.\"",
    verseTextAm:
      "\"ስለዚህ የክርስቶስን ትምህርት መጀመሪያ ትተን ወደ ፍጽምና እንገስግስ፥ ሞትን ወደሚያመጡ ሥራዎች ንስሐ መግባትንና በእግዚአብሔር ማመንን እንደ መሠረት ደግመን አንጣልም።\"",
    reflectionEn:
      "Christianity is not a stagnant life, as Apostle Daniel Makonnen has taught for over two decades — it is forward motion, from milk to meat, from elementary teaching to maturity. 'Christian Spiritual Growth,' now in two volumes, exists for exactly this reason: new birth is the beginning of the journey, never its destination. Maturity is both a gift of grace and a discipline we actively pursue.",
    reflectionAm:
      "ክርስትና ሐዋሪያው ዳንኤል መኮንን ከሁለት አስር ዓመታት በላይ እንዳስተማሩት፣ በአንድ ቦታ የመቆም ሕይወት አይደለም — ከወተት ወደ ጠጣር ምግብ፣ ከመጀመሪያ ትምህርት ወደ ብስለት የሚደረግ ተራማጅ እንቅስቃሴ ነው። አሁን በሁለት ክፍሎች የቀረበው 'የክርስትና እድገት' መጽሐፍ ለዚህ ትክክለኛ ምክንያት የተዘጋጀ ነው፦ ዳግም መወለድ የጉዞው መጀመሪያ ነው፤ ፈጽሞ መድረሻው አይደለም። ብስለት የጸጋ ስጦታም፣ በንቁ ልምምድ የምናገኘው ተግሣጽም ነው።",
    prayerDeclarationEn:
      "Lord, I refuse to remain an infant in faith. Carry me forward into maturity, that I may bear the weight of the calling You have placed on my life.",
    prayerDeclarationAm:
      "ጌታ ሆይ፣ በእምነት ሕፃን ሆኜ መቅረትን እቃወማለሁ። በሕይወቴ ላይ ያስቀመጥከውን ጥሪ ክብደት እንድችል ወደ ብስለት አራምደኝ።",
    authorEn: "Apostle Daniel Makonnen",
    authorAm: "ሐዋሪያው ዳንኤል መኮንን",
  },
  {
    id: "devo-7-global-witness",
    dateLabel: "November 9, 2026 — Today's Key Scripture",
    isFeaturedToday: true,
    updatedAt: "2026-11-08T00:00:00.000Z",
    titleEn: "Empowered for Global Witness",
    titleAm: "ለዓለም አቀፍ ምስክርነት መብቃት",
    scriptureRefEn: "Acts 1:8",
    scriptureRefAm: "የሐዋርያት ሥራ 1፡8",
    verseTextEn:
      "\"But you will receive power when the Holy Spirit comes on you; and you will be my witnesses in Jerusalem, and in all Judea and Samaria, and to the ends of the earth.\"",
    verseTextAm:
      "\"ነገር ግን መንፈስ ቅዱስ በእናንተ ላይ በሚወርድበት ጊዜ ኃይልን ትቀበላላችሁ፥ በኢየሩሳሌምም በይሁዳም ሁሉ በሰማርያም እስከ ዓለምም ዳርቻ ድረስ ምስክሮቼ ትሆናላችሁ።\"",
    reflectionEn:
      "What began as an underground prayer movement in 1970s Addis Ababa under severe persecution has become, by the power of the Holy Spirit alone, a witness reaching Ethiopia's rural outreach stations, the Washington, D.C. diaspora, and now a global digital audience through this very platform. The pattern of Acts 1:8 — Jerusalem outward to the ends of the earth — is still how the Gospel spreads today.",
    reflectionAm:
      "በ1970ዎቹ በአዲስ አበባ ከፍተኛ ስደት ባለበት ጊዜ የተነሳው የከርሰ ምድር ጸሎት ንቅናቄ፣ በመንፈስ ቅዱስ ኃይል ብቻ፣ የኢትዮጵያን የገጠር ስርጭት ጣቢያዎች፣ የዋሽንግተን ዲሲ ዲያስፖራንና አሁን በዚህ መድረክ በኩል ዓለም አቀፍ ዲጂታል ተደራሲያንን የሚደርስ ምስክርነት ሆኗል። የሐዋርያት ሥራ 1፡8 ንድፍ — ከኢየሩሳሌም እስከ ዓለም ዳርቻ — አሁንም ዛሬ ወንጌል የሚስፋፋበት መንገድ ነው።",
    prayerDeclarationEn:
      "Holy Spirit, empower me as Your witness — in my home, my city, and to the nations. Use this ministry to carry the Gospel to the ends of the earth.",
    prayerDeclarationAm:
      "መንፈስ ቅዱስ ሆይ፣ በቤቴ፣ በከተማዬና ለአህዛብ ሁሉ ምስክርህ እንድሆን አብቃኝ። ይህን አገልግሎት ወንጌልን እስከ ዓለም ዳርቻ ለማድረስ ተጠቀምበት።",
    authorEn: "Apostle Daniel Makonnen",
    authorAm: "ሐዋሪያው ዳንኤል መኮንን",
  },
];

// ---------------------------------------------------------------------------
// B. Books
// ---------------------------------------------------------------------------

/**
 * `b2` ("Hearing the Voice of God") is flagged `isMonthlySpecialOffer`
 * as the November 2026 Monthly Partner Resource Offer — surfaced on
 * `/give` and in the footer. At most one book should carry this flag
 * at a time; update it here when the featured title changes month to
 * month rather than hardcoding the choice in UI components.
 */
export const BOOKS: Book[] = [
  {
    id: "b1",
    slug: "christian-spiritual-growth-volume-1",
    titleAm: "የክርስትና እድገት – ክፍል 1",
    titleEn: "Christian Spiritual Growth — Volume 1",
    authorEn: "Apostle Daniel Makonnen",
    authorAm: "ሐዋሪያው ዳንኤል መኮንን",
    priceUsdPrint: 15,
    priceUsdPdf: 10,
    pages: 196,
    isbn: "978-1-950821-01-3",
    synopsisEn:
      "Foundational biblical manual for new and growing believers covering assurance of salvation, daily prayer, victory over temptation, and life in the local church.",
    synopsisAm:
      "ለአዲስና በእምነት በማደግ ላይ ላሉ አማኞች የተዘጋጀ መሠረታዊ የመጽሐፍ ቅዱስ ጥናትና መመሪያ።",
    topics: ["Discipleship", "New Believers", "Prayer"],
  },
  {
    id: "b2",
    slug: "hearing-the-voice-of-god",
    titleAm: "የእግዚአብሔር ድምጽ",
    titleEn: "Hearing the Voice of God",
    authorEn: "Apostle Daniel Makonnen",
    authorAm: "ሐዋሪያው ዳንኤል መኮንን",
    priceUsdPrint: 18,
    priceUsdPdf: 13,
    pages: 224,
    isbn: "978-1-950821-02-0",
    synopsisEn:
      "Practical biblical guide on recognizing how God speaks through His Word and the Holy Spirit, testing prophetic impressions, and walking in divine guidance.",
    synopsisAm:
      "እግዚአብሔር በቃሉና በመንፈስ ቅዱስ እንዴት እንደሚናገርና ድምጹን እንዴት መለየት እንደሚቻል የሚያስተምር መጽሐፍ።",
    topics: ["Hearing God's Voice", "Prophetic", "Spiritual Discernment"],
    coverImageUrl: MINISTRY_IMAGES.bookHearingGodsVoiceCover,
    isMonthlySpecialOffer: true,
  },
  {
    id: "b3",
    slug: "christian-spiritual-growth-volume-2",
    titleAm: "የክርስትና እድገት – ክፍል 2",
    titleEn: "Christian Spiritual Growth — Volume 2",
    authorEn: "Apostle Daniel Makonnen",
    authorAm: "ሐዋሪያው ዳንኤል መኮንን",
    priceUsdPrint: 16,
    priceUsdPdf: 11,
    pages: 210,
    isbn: "978-1-950821-03-7",
    synopsisEn:
      "Advanced discipleship study focusing on spiritual maturity, servant leadership, character formation, and bearing lasting fruit in the Kingdom of God.",
    synopsisAm:
      "በመንፈሳዊ ብስለት፣ በአገልጋይነት መሪነት እና በመንፈስ ፍሬ ላይ ያተኮረ የክርስትና እድገት ሁለተኛ ክፍል።",
    topics: ["Discipleship", "Leadership", "Spiritual Maturity"],
  },
  {
    id: "b4",
    slug: "life-and-ministry-in-the-holy-spirit",
    titleAm: "የመንፈስ ቅዱስ ሕይወትና አገልግሎት",
    titleEn: "Life & Ministry in the Holy Spirit",
    authorEn: "Apostle Daniel Makonnen",
    authorAm: "ሐዋሪያው ዳንኤል መኮንን",
    priceUsdPrint: 18,
    priceUsdPdf: 13,
    pages: 240,
    isbn: "978-1-950821-04-4",
    synopsisEn:
      "Drawn from over four decades of revival ministry in Ethiopia and internationally, exploring the gifts, anointing, and character of the Holy Spirit.",
    synopsisAm:
      "ከአርባ ዓመታት በላይ ከዘለቀ የወንጌል አገልግሎት የተዘጋጀ፣ ስለ መንፈስ ቅዱስ ስጦታዎች፣ ቅባትና ባህሪ የሚያብራራ መጽሐፍ።",
    topics: ["Holy Spirit", "Revival", "Spiritual Gifts"],
  },
];

// ---------------------------------------------------------------------------
// C. Leadership Profiles
// ---------------------------------------------------------------------------

export const LEADERS: LeaderProfile[] = [
  {
    id: "leader-daniel-makonnen",
    slug: "apostle-daniel-makonnen",
    nameEn: "Apostle Daniel Makonnen",
    nameAm: "ሐዋሪያው ዳንኤል መኮንን",
    roleEn: "Founder & President, Gospel Light Ministries International",
    roleAm: "መስራችና ፕሬዚዳንት፣ የወንጌል ብርሃን አለማቀፍ አገልግሎት",
    locationBadge: "Aware HQ, Addis Ababa, Ethiopia",
    email: CONTACT_EMAILS.addis,
    phone: CONTACT_PHONES.addis,
    bioParagraphsEn: [
      "Apostle Daniel Makonnen was born again during the historic 1970s Ethiopian Evangelical Awakening, coming to faith amid severe persecution under the Marxist-Leninist Derg regime — a season that forged an unshakeable conviction in the authority of Scripture and the power of prayer.",
      "For more than 43 years, he has carried a full-time apostolic and teaching ministry across Ethiopia, North America, Europe, and Africa, proclaiming the gospel of Jesus Christ with clarity and conviction.",
      "He founded Gospel Light Church in Addis Ababa at Aware — now the ministry's international headquarters — and has overseen the planting of 32 branch churches and outreach stations spanning the Addis Ababa, East Showa, and Eastern Ethiopia Synods, together with the North American branch in Washington, D.C.",
      "He is the author of foundational Amharic discipleship works, including Christian Spiritual Growth (የክርስትና እድገት) and Hearing the Voice of God (የእግዚአብሔር ድምጽ), and continues to host international broadcast teachings reaching the Ethiopian diaspora worldwide.",
    ],
    bioParagraphsAm: [
      "ሐዋሪያው ዳንኤል መኮንን በ1970ዎቹ በነበረው ታሪካዊ የኢትዮጵያ ወንጌላዊ ንቅናቄ ወቅት፣ በወታደራዊው ደርግ ማርክሲስት-ሌኒኒስት አገዛዝ ከፍተኛ ስደት በነበረበት ጊዜ ዳግም ተወልዷል፤ ይህም በቅዱስ ቃሉ ስልጣንና በጸሎት ኃይል ላይ የማይናወጥ እምነት እንዲያዳብር አድርጎታል።",
      "ከ43 ዓመታት በላይ፣ በኢትዮጵያ፣ በሰሜን አሜሪካ፣ በአውሮፓ እና በአፍሪካ ሙሉ ጊዜውን ለሐዋርያዊና ለማስተማር አገልግሎት ሰጥቷል፤ የኢየሱስ ክርስቶስን ወንጌል በግልጽና በጽኑ እምነት እየሰበከ።",
      "በአዋሬ፣ አዲስ አበባ የወንጌል ብርሃን ቤተክርስቲያንን መስርቷል — አሁን የአገልግሎቱ ዓለም አቀፍ ዋና ቢሮ የሆነውን — እንዲሁም በአዲስ አበባ፣ በምስራቅ ሸዋ እና በምስራቅ ኢትዮጵያ ሲኖዶሶች ውስጥ 32 አጥቢያዎችንና ስርጭት ጣቢያዎችን እንዲተከሉ፣ እንዲሁም በዋሽንግተን ዲሲ የሰሜን አሜሪካ አጥቢያ እንዲመሰረት መርቷል።",
      "የክርስትና እድገት እና የእግዚአብሔር ድምጽ የተሰኙ መሠረታዊ የአማርኛ ደቀ መዝሙርነት መጻሕፍትን ደርሷል፤ እንዲሁም በዓለም ዙሪያ ለሚገኙ ኢትዮጵያዊ ዲያስፖራ አለማቀፍ የስርጭት ትምህርቶችን ይሰጣል።",
    ],
    highlightsEn: [
      "43+ years of apostolic & teaching ministry",
      "Founder of Gospel Light Church, Aware HQ",
      "Planted 32 branch churches & outreach stations",
      "Author of multiple foundational discipleship books",
    ],
    highlightsAm: [
      "ከ43 ዓመታት በላይ የሐዋርያዊና የማስተማር አገልግሎት",
      "የወንጌል ብርሃን ቤተክርስቲያን (አዋሬ ዋና ቢሮ) መስራች",
      "32 አጥቢያዎችንና ስርጭት ጣቢያዎችን መትከል",
      "የበርካታ መሠረታዊ ደቀ መዝሙርነት መጻሕፍት ደራሲ",
    ],
    portraitUrl: MINISTRY_IMAGES.apostleDanielPortrait,
  },
  {
    id: "leader-aberham-bedasso",
    slug: "pastor-aberham-bedasso",
    nameEn: "Pastor Aberham Bedasso",
    nameAm: "ፓስተር አብርሃም በዳሶ",
    roleEn: "Senior Pastor, Washington, D.C. Branch",
    roleAm: "ከፍተኛ ፓስተር፣ የዋሽንግተን ዲሲ አጥቢያ",
    locationBadge: "2401 Virginia Ave NW, Washington, DC 20037",
    email: CONTACT_EMAILS.dc,
    phone: CONTACT_PHONES.dc,
    bioParagraphsEn: [
      "Pastor Aberham Bedasso serves as Senior Pastor of the Gospel Light Ministries International congregation in Washington, D.C., shepherding a vibrant community of Ethiopian diaspora families, young adults, and intercessors across the Washington Metropolitan Area and Northern Virginia.",
      "Under his leadership, the Washington, D.C. Church — meeting at 2401 Virginia Ave NW and administered from the Alexandria, Virginia office — has grown into the ministry's North American headquarters, equipping believers for discipleship, worship, and compassionate outreach in the diaspora context.",
      "Pastor Aberham coordinates cross-continental mission support between the North American congregation and the rural outreach stations of the Eastern Ethiopia Synod, mobilizing diaspora giving and prayer toward church planting, humanitarian relief, and leadership development back home.",
      "He continues to build intercessory prayer teams and leadership pipelines that carry Gospel Light Ministries' vision of uncompromising biblical truth and generational discipleship into the next generation of the Ethiopian diaspora.",
    ],
    bioParagraphsAm: [
      "ፓስተር አብርሃም በዳሶ በዋሽንግተን ዲሲ የሚገኘውን የወንጌል ብርሃን አለማቀፍ አገልግሎት አጥቢያ በከፍተኛ ፓስተርነት ያገለግላል፤ በዋሽንግተን ሜትሮፖሊታን አካባቢና በሰሜን ቨርጂኒያ የሚገኙ የኢትዮጵያ ዲያስፖራ ቤተሰቦችን፣ ወጣቶችንና አማላጆችን ይመራል።",
      "በእርሱ መሪነት፣ በ2401 Virginia Ave NW የሚገኘውና ከAlexandria, Virginia ቢሮ የሚተዳደረው የዋሽንግተን ዲሲ ቤተክርስቲያን የአገልግሎቱ የሰሜን አሜሪካ ዋና ቢሮ ሆኖ አድጓል፤ አማኞችን ለደቀ መዝሙርነት፣ ለአምልኮና ለርህራሄ ስርጭት አገልግሎት በዲያስፖራ ህይወት ውስጥ ያዘጋጃል።",
      "ፓስተር አብርሃም በሰሜን አሜሪካ አጥቢያና በምስራቅ ኢትዮጵያ ሲኖዶስ የገጠር ስርጭት ጣቢያዎች መካከል ያለውን የአህጉራት ድንበር ተሻጋሪ ተልዕኮ ድጋፍ ያስተባብራል፤ ለቤተክርስቲያን ተከላ፣ ለርህራሄ እርዳታና ለመሪነት ስልጠና የዲያስፖራ ልገሳና ጸሎት ያነቃቃል።",
      "የወንጌል ብርሃን አገልግሎት ራዕይ የሆነውን ያልተደለዘ የመጽሐፍ ቅዱስ እውነትና የትውልድ ደቀ መዝሙርነት ለኢትዮጵያዊ ዲያስፖራ ቀጣይ ትውልድ ለማስተላለፍ የምልጃ ጸሎት ቡድኖችንና የመሪነት መስመሮችን መገንባቱን ይቀጥላል።",
    ],
    highlightsEn: [
      "Senior Pastor, Washington, D.C. Branch",
      "Leads North American headquarters congregation",
      "Coordinates diaspora-to-Ethiopia mission support",
      "Builds intercessory prayer & leadership teams",
    ],
    highlightsAm: [
      "ከፍተኛ ፓስተር፣ የዋሽንግተን ዲሲ አጥቢያ",
      "የሰሜን አሜሪካ ዋና ቢሮ አጥቢያን ይመራል",
      "ከዲያስፖራ ወደ ኢትዮጵያ የሚደረግ ተልዕኮ ድጋፍ ያስተባብራል",
      "የምልጃ ጸሎትና የመሪነት ቡድኖችን ይገነባል",
    ],
    portraitUrl: MINISTRY_IMAGES.pastorAberhamPortrait,
  },
];

// ---------------------------------------------------------------------------
// Consolidated About / Vision / History / Statement of Faith
// ---------------------------------------------------------------------------

export interface VisionMission {
  visionEn: string;
  visionAm: string;
  missionEn: string;
  missionAm: string;
}

/** Our Vision & Mission. */
export const VISION_MISSION: VisionMission = {
  visionEn:
    "To see the Gospel of Jesus Christ transform lives, families, and nations — raising up a Spirit-empowered, biblically grounded church across Ethiopia, North America, and beyond.",
  visionAm:
    "የኢየሱስ ክርስቶስ ወንጌል ህይወትን፣ ቤተሰብንና ህዝቦችን እንደሚለውጥ ለማየት፤ በኢትዮጵያ፣ በሰሜን አሜሪካ እና ከዚያም በላይ በመንፈስ ቅዱስ የታጠቀችና በቅዱስ ቃል ላይ የተመሰረተች ቤተክርስቲያን ለማቆም።",
  missionEn:
    "We exist to serve in the spirit of excellence with integrity and compassion; to proclaim the Gospel of Jesus Christ; to equip believers for spiritual maturity; and to plant healthy, reproducing churches.",
  missionAm:
    "በልዩነት መንፈስ፣ በታማኝነትና በርህራሄ ለማገልገል፤ የኢየሱስ ክርስቶስን ወንጌል ለመስበክ፤ አማኞችን ለመንፈሳዊ ብስለት ለማዘጋጀት፤ እንዲሁም ጤናማና የሚያፍራ ቤተክርስቲያኖችን ለመትከል እንኖራለን።",
};

export interface CoreCommitment {
  titleEn: string;
  titleAm: string;
  descriptionEn: string;
  descriptionAm: string;
}

/** Our 4 Core Commitments. */
export const CORE_COMMITMENTS: CoreCommitment[] = [
  {
    titleEn: "Uncompromising Biblical Truth",
    titleAm: "ያልተደለዘ የመጽሐፍ ቅዱስ እውነት",
    descriptionEn:
      "We hold the Scriptures as our final authority for faith, doctrine, and daily living, teaching the whole counsel of God without compromise.",
    descriptionAm:
      "መጽሐፍ ቅዱስን ለእምነት፣ ለትምህርትና ለዕለት ህይወታችን የመጨረሻ ስልጣን እንደ ሆነ እንይዛለን፤ ያለ ምንም መድብ የእግዚአብሔርን ሙሉ ምክር እናስተምራለን።",
  },
  {
    titleEn: "Spirit-Empowered Worship & Prayer",
    titleAm: "በመንፈስ ቅዱስ የታጠቀ አምልኮና ጸሎት",
    descriptionEn:
      "We cultivate a culture of passionate worship and persistent prayer, depending on the Holy Spirit for power, gifting, and guidance in all we do.",
    descriptionAm:
      "ኃይል፣ ስጦታና መመሪያ ከመንፈስ ቅዱስ በመታመን በሁሉም ነገር ላይ ጥልቅ አምልኮና የማያቋርጥ ጸሎት ባህል እናዳብራለን።",
  },
  {
    titleEn: "Compassionate Community & Rural Outreach",
    titleAm: "ርህራሄ የሞላበት ማህበረሰብና የገጠር ስርጭት",
    descriptionEn:
      "From Addis Ababa to the rural outreach stations of Eastern Ethiopia, we carry the Gospel with practical compassion, caring for the whole person — body, soul, and spirit.",
    descriptionAm:
      "ከአዲስ አበባ እስከ ምስራቅ ኢትዮጵያ የገጠር ስርጭት ጣቢያዎች ድረስ፣ ወንጌልን በተግባራዊ ርህራሄ እንሰበካለን፤ ሙሉውን ሰብዓዊ ፍጡር — ስጋ፣ ነፍስና መንፈስ — እንንከባከባለን።",
  },
  {
    titleEn: "Generational Discipleship & Leadership Development",
    titleAm: "የትውልድ ደቀ መዝሙርነትና የመሪነት ልማት",
    descriptionEn:
      "We invest in raising up the next generation of pastors, leaders, and missionaries — across Ethiopia and the diaspora — to carry the ministry's vision forward.",
    descriptionAm:
      "በኢትዮጵያና በዲያስፖራ የሚገኙ የሚቀጥለውን ትውልድ ፓስተሮች፣ መሪዎችና ሚስዮናውያን በማንሳት የአገልግሎቱን ራዕይ ወደፊት ለማስቀጠል እንሰራለን።",
  },
];

export interface HistoryMilestone {
  era: string;
  titleEn: string;
  titleAm: string;
  descriptionEn: string;
  descriptionAm: string;
}

/**
 * Six-era historical timeline: Early Calling & the 1970s Awakening -> the
 * 1989 D.C. vision & 1992 founding -> the September 2000 relocation of the
 * international HQ to Aware -> Synod expansion -> the Washington, D.C. /
 * Alexandria, VA North American hub -> the 2026 global digital & literary
 * discipleship network.
 */
export const HISTORY_TIMELINE: HistoryMilestone[] = [
  {
    era: "1970s",
    titleEn: "Early Calling & the Ethiopian Evangelical Awakening",
    titleAm: "የመጀመሪያው ጥሪና የኢትዮጵያ ወንጌላዊ ንቅናቄ",
    descriptionEn:
      "Amid severe persecution under the Marxist-Leninist Derg regime, a historic evangelical awakening swept through Ethiopia. Apostle Daniel Makonnen came to faith and received his earliest calling to ministry during this underground prayer movement, which forged the spiritual foundation for everything that followed.",
    descriptionAm:
      "በወታደራዊው ደርግ ማርክሲስት-ሌኒኒስት አገዛዝ ከፍተኛ ስደት በነበረበት ወቅት፣ ታሪካዊ የወንጌላዊ ንቅናቄ በኢትዮጵያ ተነሳ። ሐዋሪያው ዳንኤል መኮንን በዚህ የከርሰ ምድር ጸሎት ንቅናቄ ወቅት ወደ እምነት መጣ እንዲሁም ለአገልግሎት የመጀመሪያውን ጥሪ ተቀበለ፤ ይህም ለሚከተለው ሁሉ መንፈሳዊ መሠረት ጣለ።",
  },
  {
    era: "1989–1992",
    titleEn: "A 1989 Vision in Washington, D.C. & the 1992 Founding of GLM",
    titleAm: "በ1989 በዋሽንግተን ዲሲ የተገለጠ ራዕይና በ1992 የወ.ብ.አ.አ. መመስረት",
    descriptionEn:
      "While ministering among the Ethiopian diaspora in Washington, D.C. in 1989, Apostle Daniel Makonnen received a clear prophetic vision of a church planting movement stretching from the diaspora back to Ethiopia and across Eastern Africa. That vision bore fruit in 1992 with the formal founding of Gospel Light Ministries International.",
    descriptionAm:
      "ሐዋሪያው ዳንኤል መኮንን በ1989 በዋሽንግተን ዲሲ ዲያስፖራ መካከል እያገለገሉ ሳሉ፣ ከዲያስፖራ ወደ ኢትዮጵያና ወደ ምስራቅ አፍሪካ የሚዘልቅ የቤተክርስቲያን ተከላ ንቅናቄ ግልጽ ትንቢታዊ ራዕይ ተቀበሉ። ይህ ራዕይ በ1992 የወንጌል ብርሃን አለማቀፍ አገልግሎት ይፋዊ በመመስረት ፍሬ አፈራ።",
  },
  {
    era: "September 2000",
    titleEn: "Relocation of the International Headquarters to Aware, Addis Ababa",
    titleAm: "ዓለም አቀፍ ዋና ቢሮ ወደ አዋሬ፣ አዲስ አበባ መዛወር",
    descriptionEn:
      "As the young ministry's congregation outgrew its early meeting places, Gospel Light Ministries relocated its international headquarters to the Aware neighborhood of Addis Ababa in September 2000 — the campus that remains the ministry's founding congregation and global headquarters today.",
    descriptionAm:
      "ገና ለጋ የነበረው አገልግሎት ጉባኤ ከመጀመሪያ መሰብሰቢያ ቦታዎቹ እያደገ ሲመጣ፣ የወንጌል ብርሃን አገልግሎት ዓለም አቀፍ ዋና ቢሮውን በመስከረም 2000 ወደ አዲስ አበባ አዋሬ ሰፈር አዛወረ — ይህ ግቢ እስከ ዛሬ የአገልግሎቱ መስራች አጥቢያና ዓለም አቀፍ ዋና ቢሮ ሆኖ ቀጥሏል።",
  },
  {
    era: "2000s–2010s",
    titleEn: "Synod Expansion Across Addis Ababa, East Showa & 22 Eastern Ethiopia Stations",
    titleAm: "በአዲስ አበባ፣ በምስራቅ ሸዋ እና በ22 ምስራቅ ኢትዮጵያ ጣቢያዎች መስፋፋት",
    descriptionEn:
      "From its Aware headquarters, the ministry planted additional branches across Addis Ababa, expanded to Adama and the East Showa Zone, and grew to encompass 22 branch churches and rural outreach stations throughout the Eastern Ethiopia Synod, from Harar and Dire Dawa to remote farming communities.",
    descriptionAm:
      "ከአዋሬ ዋና ቢሮ ተነስቶ፣ አገልግሎቱ በአዲስ አበባ ተጨማሪ አጥቢያዎችን ተከለ፣ ወደ አዳማና ምስራቅ ሸዋ ዞን ተስፋፍቶ፣ ከሐረርና ድሬዳዋ እስከ ሩቅ የገበሬ ማህበረሰቦች ድረስ 22 አጥቢያዎችንና የገጠር ስርጭት ጣቢያዎችን በምስራቅ ኢትዮጵያ ሲኖዶስ ውስጥ አካተተ።",
  },
  {
    era: "2000s–Present",
    titleEn: "Washington, D.C. Sanctuary & Alexandria, VA North American Hub",
    titleAm: "የዋሽንግተን ዲሲ ቤተመቅደስና የአሌክሳንድሪያ ቫርጂኒያ ሰሜን አሜሪካ ማዕከል",
    descriptionEn:
      "The 1989 vision came full circle with a permanent Washington, D.C. worship sanctuary and an Alexandria, Virginia administrative office, together forming the ministry's North American hub — serving the Ethiopian diaspora and coordinating mission support back to Ethiopia under Pastor Aberham Bedasso.",
    descriptionAm:
      "የ1989 ራዕይ በቋሚ የዋሽንግተን ዲሲ አምልኮ ቤተመቅደስና በአሌክሳንድሪያ ቫርጂኒያ የአስተዳደር ቢሮ ተጠናቀቀ፤ ሁለቱም በፓስተር አብርሃም በዳሶ አስተዳዳሪነት የኢትዮጵያ ዲያስፖራን የሚያገለግልና ወደ ኢትዮጵያ የሚደረግ ተልዕኮ ድጋፍ የሚያስተባብር የሰሜን አሜሪካ ማዕከል ሆነ።",
  },
  {
    era: "2026",
    titleEn: "Global Digital Broadcast, VOD & Literary Discipleship Network",
    titleAm: "ዓለም አቀፍ ዲጂታል ስርጭት፣ VOD እና የጽሑፍ ደቀ መዝሙርነት መረብ",
    descriptionEn:
      "In 2026, Gospel Light Ministries launched its unified Video-on-Demand sermon hub, multi-platform live broadcast network, and a literary discipleship catalog of Apostle Daniel Makonnen's books — uniting Addis Ababa, Washington, D.C., and the global Ethiopian diaspora on one digital platform.",
    descriptionAm:
      "በ2026 የወንጌል ብርሃን አገልግሎት የተዋሃደ የቪድዮ-ኦን-ዲማንድ ስብከት ማዕከል፣ የብዙ መድረክ ቀጥታ ስርጭት መረብና የሐዋሪያው ዳንኤል መኮንን መጻሕፍት የጽሑፍ ደቀ መዝሙርነት ክምችት ጀመረ — አዲስ አበባን፣ ዋሽንግተን ዲሲንና ዓለም አቀፍ የኢትዮጵያ ዲያስፖራን በአንድ ዲጂታል መድረክ ላይ አንድ አደረገ።",
  },
];

export interface FaithStatementPoint {
  numberLabel: string;
  titleEn: string;
  titleAm: string;
  textEn: string;
  textAm: string;
  scriptureEn: string;
  scriptureAm: string;
}

/** 8-Point Evangelical Statement of Faith. */
export const STATEMENT_OF_FAITH: FaithStatementPoint[] = [
  {
    numberLabel: "1",
    titleEn: "The Scriptures",
    titleAm: "ቅዱሳት መጻሕፍት",
    textEn:
      "We believe the Bible, in its entirety, is the inspired, inerrant Word of God and the final authority for Christian faith and living.",
    textAm:
      "መጽሐፍ ቅዱስ በሙሉ በመንፈስ ቅዱስ የተመራ፣ ስህተት የሌለበት እና በእምነትና በኑሮ ላይ የመጨረሻው ስልጣን ያለው የእግዚአብሔር ቃል እንደሆነ እናምናለን።",
    scriptureEn: "2 Timothy 3:16–17; 2 Peter 1:20–21",
    scriptureAm: "2ኛ ጢሞቴዎስ 3፡16-17፤ 2ኛ ጴጥሮስ 1፡20-21",
  },
  {
    numberLabel: "2",
    titleEn: "The Trinity",
    titleAm: "ሥላሴ",
    textEn:
      "We believe in one God, eternally existing in three persons: Father, Son, and Holy Spirit.",
    textAm:
      "በአንድ አምላክ፣ በሦስት አካላት — አብ፣ ወልድ፣ መንፈስ ቅዱስ — እናምናለን።",
    scriptureEn: "Matthew 28:19; 2 Corinthians 13:14",
    scriptureAm: "ማቴዎስ 28፡19፤ 2ኛ ቆሮንቶስ 13፡14",
  },
  {
    numberLabel: "3",
    titleEn: "Jesus Christ",
    titleAm: "ኢየሱስ ክርስቶስ",
    textEn:
      "We believe Jesus Christ is fully God and fully man, virgin-born, who lived a sinless life, died an atoning death for our sins, and rose bodily from the dead.",
    textAm:
      "ኢየሱስ ክርስቶስ ፍጹም አምላክና ፍጹም ሰው፣ ከድንግል የተወለደ፣ ንጹህ ሕይወት የመራ፣ ለኃጢአታችን የሞተ እና በሥጋ ከሞት የተነሳ እንደሆነ እናምናለን።",
    scriptureEn: "John 1:1, 14; 1 Corinthians 15:3–4",
    scriptureAm: "ዮሐንስ 1፡1፣14፤ 1ኛ ቆሮንቶስ 15፡3-4",
  },
  {
    numberLabel: "4",
    titleEn: "Salvation by Grace Through Faith",
    titleAm: "በጸጋ በእምነት የሚገኝ መዳን",
    textEn:
      "We believe salvation is received by grace alone, through faith alone in Jesus Christ, not by works.",
    textAm:
      "መዳን በእግዚአብሔር ጸጋ ብቻ በእምነት የሚገኝ እንደሆነ፣ በስራ ያልሆነ እናምናለን።",
    scriptureEn: "Ephesians 2:8–9; Romans 10:9–10",
    scriptureAm: "ኤፌሶን 2፡8-9፤ ሮሜ 10፡9-10",
  },
  {
    numberLabel: "5",
    titleEn: "The Holy Spirit",
    titleAm: "መንፈስ ቅዱስ",
    textEn:
      "We believe the Holy Spirit indwells every believer, empowers us for holy living, and gives spiritual gifts for ministry.",
    textAm:
      "መንፈስ ቅዱስ በአማኞች ውስጥ እንደሚኖር፣ ለአገልግሎት እንደሚያስታጥቅና ስጦታዎችን እንደሚሰጥ እናምናለን።",
    scriptureEn: "Acts 1:8; 1 Corinthians 12:4–11",
    scriptureAm: "የሐዋርያት ሥራ 1፡8፤ 1ኛ ቆሮንቶስ 12፡4-11",
  },
  {
    numberLabel: "6",
    titleEn: "The Church",
    titleAm: "ቤተክርስቲያን",
    textEn:
      "We believe the Church is the body of Christ, called together for worship, discipleship, and the Great Commission.",
    textAm:
      "ቤተክርስቲያን የክርስቶስ አካል ሆና ለአምልኮ፣ ለደቀ መዝሙርነትና ለተልዕኮ የተጠራች እንደሆነች እናምናለን።",
    scriptureEn: "Ephesians 4:11–16; Matthew 28:19–20",
    scriptureAm: "ኤፌሶን 4፡11-16፤ ማቴዎስ 28፡19-20",
  },
  {
    numberLabel: "7",
    titleEn: "The Second Coming",
    titleAm: "ሁለተኛው ምጽአት",
    textEn:
      "We believe Jesus Christ will return bodily and visibly in power and glory.",
    textAm: "ክርስቶስ በሥጋ በክብር እንደሚመጣ እናምናለን።",
    scriptureEn: "Acts 1:11; Revelation 22:12",
    scriptureAm: "የሐዋርያት ሥራ 1፡11፤ ራዕይ 22፡12",
  },
  {
    numberLabel: "8",
    titleEn: "Eternal Destiny",
    titleAm: "የዘላለም እጣ ፈንታ",
    textEn:
      "We believe in the bodily resurrection of both the saved and the lost: everlasting life for the redeemed, and judgment for the unrepentant.",
    textAm:
      "ለተዳኑት የትንሳኤና የዘላለም ህይወት፣ ላልተጸጸቱት ፍርድ እንደሚኖር እናምናለን።",
    scriptureEn: "John 5:28–29; Revelation 20:11–15",
    scriptureAm: "ዮሐንስ 5፡28-29፤ ራዕይ 20፡11-15",
  },
];

// ---------------------------------------------------------------------------
// D. Upcoming Events (2026–2027)
// ---------------------------------------------------------------------------

/**
 * Replaces the legacy homepage's frozen August 21–23, 2020
 * ("የተሃድሰብረክቶች") conference banner.
 */
export const UPCOMING_EVENTS_2026: MinistryEvent[] = [
  {
    id: "event-2026-revival-renewal-conference",
    titleEn: "2026 Annual Revival & Renewal Conference",
    titleAm: "2026 ዓመታዊ የተሃድሶ በረከቶች ጉባኤ",
    dateRangeEn: "November 14–16, 2026",
    dateRangeAm: "ህዳር 14-16, 2026",
    locationEn: "Aware International HQ, Addis Ababa & Global Live Stream",
    locationAm: "አዋሬ ዓለም አቀፍ ዋና ቢሮ፣ አዲስ አበባ እና ዓለም አቀፍ ቀጥታ ስርጭት",
    category: "Revival",
    descriptionEn:
      "Our flagship annual gathering for revival, renewal, and corporate prayer, bringing together congregations from all four synods at Aware HQ with a live global stream for the diaspora.",
    descriptionAm:
      "ከአራቱም ሲኖዶሶች የሚገኙ አጥቢያዎችን በአዋሬ ዋና ቢሮ የሚያሰባስብ ዓመታዊ የተሃድሶ፣ የበረከትና የህብረት ጸሎት ጉባኤ፤ ለዲያስፖራ ዓለም አቀፍ ቀጥታ ስርጭት ይኖረዋል።",
    isLiveStreamed: true,
  },
  {
    id: "event-2026-na-diaspora-convocation",
    titleEn: "North America Diaspora Family & Prayer Convocation",
    titleAm: "የሰሜን አሜሪካ ዲያስፖራ ቤተሰብና ጸሎት ጉባኤ",
    dateRangeEn: "December 5, 2026",
    dateRangeAm: "ታህሳስ 5, 2026",
    locationEn: "Washington, D.C. Church, 2401 Virginia Ave NW",
    locationAm: "የዋሽንግተን ዲሲ ቤተክርስቲያን፣ 2401 Virginia Ave NW",
    category: "Youth & Worship",
    descriptionEn:
      "An evening of worship, family fellowship, and prayer for the Ethiopian diaspora community in the Washington Metropolitan Area, hosted by Pastor Aberham Bedasso and live streamed for congregations nationwide.",
    descriptionAm:
      "በዋሽንግተን ሜትሮፖሊታን አካባቢ ለሚገኙ የኢትዮጵያ ዲያስፖራ ማህበረሰብ በፓስተር አብርሃም በዳሶ አስተናጋጅነት የሚካሄድ የአምልኮ፣ የቤተሰብ ህብረትና የጸሎት ምሽት፤ በመላ ሀገሪቱ ላሉ አጥቢያዎች በቀጥታ ይተላለፋል።",
    isLiveStreamed: true,
  },
  {
    id: "event-2027-eastern-ethiopia-equipping-summit",
    titleEn: "Eastern Ethiopia Synod Pastors & Church Planters Equipping Summit",
    titleAm: "የምስራቅ ኢትዮጵያ ሲኖዶስ የአገልጋዮችና የቤተክርስቲያን መስራቾች ማሰልጠኛ ጉባኤ",
    dateRangeEn: "January 20–22, 2027",
    dateRangeAm: "ጥር 20-22, 2027",
    locationEn: "Harar & Adama Synod Centers",
    locationAm: "ሐረርና አዳማ ሲኖዶስ ማዕከላት",
    category: "Leadership",
    descriptionEn:
      "A three-day equipping summit for pastors and church planters serving the 22 branch churches and rural outreach stations of the Eastern Ethiopia Synod, with sessions in Harar and Adama on discipleship, leadership, and rural ministry.",
    descriptionAm:
      "በምስራቅ ኢትዮጵያ ሲኖዶስ ውስጥ ያሉ 22 አጥቢያዎችንና የገጠር ስርጭት ጣቢያዎችን የሚያገለግሉ ፓስተሮችንና የቤተክርስቲያን መስራቾችን ለማዘጋጀት በሐረርና በአዳማ የሚካሄድ የሶስት ቀን ማሰልጠኛ ጉባኤ፤ በደቀ መዝሙርነት፣ በመሪነትና በገጠር አገልግሎት ላይ ያተኮረ።",
    isLiveStreamed: false,
  },
];

// ---------------------------------------------------------------------------
// E. Recent Updates & Highlights (Homepage Section 3)
// ---------------------------------------------------------------------------

/**
 * Seeds the Postgres `news_updates` table (see `src/lib/db.ts`) — fully
 * editable (add/edit/pin/delete) from the Admin Portal afterward. Exactly
 * one entry should carry `isPinnedLeadStory: true` at a time; that entry
 * renders as the #1 large lead card in the homepage's "Recent Updates &
 * Highlights" section.
 */
export const NEWS_HIGHLIGHTS: NewsHighlight[] = [
  {
    id: "update-overflow-worship-renewal",
    slug: "overflow-worship-renewal-services",
    titleEn:
      "Overflow Worship & Renewal Services at Gospel Light International Church, Washington, D.C. & Across 32 Ethiopian Branches",
    titleAm: "በወንጌል ብርሃን ዓለም አቀፍ ቤተክርስቲያን ዋሽንግተን ዲሲ እና በ32 የኢትዮጵያ አጥቢያዎች የተትረፈረፈ አምልኮና ተሐድሶ አገልግሎቶች",
    category: "Special Announcement",
    summaryEn:
      "Weekend services at the Washington, D.C. Sanctuary and across the 32 Ethiopian branch churches saw standing-room-only attendance this month, with extended altar calls and reports of healing, restoration, and new commitments to Christ.",
    summaryAm:
      "በዚህ ወር በዋሽንግተን ዲሲ ቤተመቅደስ እና በ32 የኢትዮጵያ አጥቢያ ቤተክርስቲያኖች የሳምንት ስብከቶች ቦታ እስኪያጥር ድረስ ተገኝነት ነበራቸው፤ የተራዘሙ የመሠዊያ ጥሪዎች፣ የፈውስ፣ የማደስና ለክርስቶስ አዲስ ቁርጠኝነት ዘገባዎች ታዝበዋል።",
    contentEn:
      "Across both continents this month, congregations at Gospel Light International Church in Washington, D.C. and all 32 branch churches and outreach stations in Ethiopia reported overflow attendance at weekend worship and renewal services. In Washington, D.C., Sunday and Wednesday gatherings extended well past their usual close as the altar call drew dozens forward for prayer, with pastoral staff reporting testimonies of physical healing, marriages restored, and a wave of first-time commitments to Christ among younger attendees.\n\nThe same spirit of renewal was echoed from Aware International HQ in Addis Ababa to the rural outreach stations of the Eastern Ethiopia Synod, where local pastors described some of the fullest sanctuaries in recent memory. Apostle Daniel Makonnen, reflecting on the reports from both sides of the Atlantic, called it \"a fresh wind of the same Spirit that birthed this ministry in the 1970s — still moving, still gathering, still saving.\"\n\nThe ministry is inviting Partners worldwide to continue standing in prayer as both continents press into this season of visitation, and has added extra Wednesday evening prayer gatherings at the D.C. Sanctuary through the end of the month to sustain the momentum.",
    contentAm:
      "በዚህ ወር በሁለቱም አህጉራት፣ በዋሽንግተን ዲሲ የወንጌል ብርሃን ዓለም አቀፍ ቤተክርስቲያንና በኢትዮጵያ ውስጥ ባሉት 32 አጥቢያ ቤተክርስቲያኖችና ስርጭት ጣቢያዎች ለሳምንት መጨረሻ አምልኮና ተሐድሶ አገልግሎቶች ከፍተኛ ተገኝነት ተመዝግቧል። በዋሽንግተን ዲሲ፣ የሰንበትና የረቡዕ ስብሰባዎች ከተለመደው ጊዜ ባለፈ ረዘም ያሉ ነበሩ፤ የመሠዊያ ጥሪው ለጸሎት ብዙዎችን ወደ ፊት ስቦ አምጥቷል፤ የአገልግሎት ሰራተኞችም ስለ ሰውነት ፈውስ፣ ስለ ተመሠረቱ ትዳሮችና በወጣቶች መካከል ስለ ብዙ አዳዲስ ለክርስቶስ ቁርጠኝነት መመስከር ገልጸዋል።\n\nየዚሁ ተሐድሶ መንፈስ ከአዲስ አበባ ከአዋሬ ዓለም አቀፍ ዋና ቢሮ እስከ ምስራቅ ኢትዮጵያ ሲኖዶስ የገጠር ስርጭት ጣቢያዎች ድረስ ተስተጋብቶ ነበር፤ የአካባቢው ፓስተሮችም በቅርብ ጊዜ ከነበሩት እጅግ የተሞሉ ቤተመቅደሶች አንዱ እንደነበር ገልጸዋል። ሐዋሪያው ዳንኤል መኮንን ከሁለቱም የአትላንቲክ ጎኖች የተሰሙትን ዘገባዎች ሲያስተነትኑ \"በ1970ዎቹ ይህን አገልግሎት የወለደው የመንፈስ ትኩስ ነፍስ ነው — አሁንም የሚንቀሳቀስ፣ አሁንም የሚሰበስብ፣ አሁንም የሚያድን\" ብለዋል።\n\nአገልግሎቱ በዓለም ዙሪያ ያሉ አጋሮች ሁለቱም አህጉራት በዚህ የመጎብኘት ወቅት ውስጥ ሲገሰግሱ በጸሎት እንዲቆሙ ጥሪ እያቀረበ ሲሆን፣ ይህንን ግስጋሴ ለማስጠንከር እስከ ወሩ መጨረሻ ድረስ በዲሲ ቤተመቅደስ ተጨማሪ የረቡዕ ምሽት የጸሎት ስብሰባዎችን ጨምሯል።",
    imageUrl: "/images/hero/hero-hd-3.jpg",
    videoUrl: "5wNOAS6kUQ8",
    locationLabel: "Washington, D.C. Sanctuary & 32 Ethiopian Branches",
    publishedDateLabel: "November 2026",
    isPinnedLeadStory: true,
    createdAt: "2026-11-02T00:00:00.000Z",
  },
  {
    id: "update-dc-broadcast-expansion",
    slug: "dc-broadcast-home-fellowship-expansion",
    titleEn:
      "Gospel Light Church, DC (@gospellightchurchdc6393) Expands Weekly Live Broadcasts & DMV Home Fellowship Groups",
    titleAm: "የወንጌል ብርሃን ቤተክርስቲያን ዲሲ (@gospellightchurchdc6393) ሳምንታዊ ቀጥታ ስርጭትና የDMV ቤት ኅብረት ቡድኖችን አስፍቷል",
    category: "Washington, D.C. Sanctuary",
    summaryEn:
      "Gospel Light Church, DC is now live-streaming both Sunday and Wednesday services on YouTube in full, and has launched three new home fellowship groups across the DMV (D.C., Maryland, Virginia) area for members unable to attend in person.",
    summaryAm:
      "የወንጌል ብርሃን ቤተክርስቲያን ዲሲ አሁን ሁለቱንም የሰንበትና የረቡዕ አገልግሎቶች ሙሉ በሙሉ በዩቲዩብ ቀጥታ እያስተላለፈ ሲሆን፣ በአካል መገኘት ለማይችሉ አባላት በDMV (ዲሲ፣ ሜሪላንድ፣ ቨርጂኒያ) አካባቢ ሦስት አዳዲስ የቤት ኅብረት ቡድኖችን አስጀምሯል።",
    contentEn:
      "Gospel Light Church, DC has expanded its YouTube presence (@gospellightchurchdc6393) to carry both Sunday morning and Wednesday evening services live, in full, rather than highlight clips alone — giving the growing Ethiopian diaspora community across the Washington, D.C., Maryland, and Virginia (DMV) region a direct line into every service even when they cannot make the drive to the Alexandria, VA sanctuary.\n\nAlongside the broadcast expansion, the church has launched three new home fellowship groups meeting weekly in Alexandria, Silver Spring, and Woodbridge, each led by a trained lay leader and following the same \"Christian Spiritual Growth\" discipleship track taught at the main sanctuary. Pastor Abreham Getachew noted that the groups exist specifically for members \"who need the Word brought closer to their own table\" — new immigrants adjusting to life in the DMV, young families balancing long work hours, and elderly members for whom the sanctuary commute has become difficult.\n\nMembers interested in joining a home fellowship group, or in volunteering with the broadcast ministry team, are encouraged to reach out through the church's regular Sunday announcements or the D.C. office.",
    contentAm:
      "የወንጌል ብርሃን ቤተክርስቲያን ዲሲ የዩቲዩብ ተገኝነቱን (@gospellightchurchdc6393) አስፍቶ ሁለቱንም የሰንበት ጠዋትና የረቡዕ ምሽት አገልግሎቶች ሙሉ በሙሉ በቀጥታ እያስተላለፈ ነው፤ ይህም በአካል ወደ አሌክሳንድሪያ ቨርጂኒያ ቤተመቅደስ መምጣት ለማይችሉ በዋሽንግተን ዲሲ፣ ሜሪላንድና ቨርጂኒያ (DMV) አካባቢ ለሚያድገው የኢትዮጵያ ዲያስፖራ ማህበረሰብ ወደ እያንዳንዱ አገልግሎት ቀጥተኛ መስመር ይከፍታል።\n\nከስርጭት መስፋፋቱ ጎን ለጎን፣ ቤተክርስቲያኑ በአሌክሳንድሪያ፣ በሲልቨር ስፕሪንግና በውድብሪጅ በየሳምንቱ የሚሰበሰቡ ሦስት አዳዲስ የቤት ኅብረት ቡድኖችን አስጀምሯል፤ እያንዳንዱም በሰለጠነ ተራ መሪ የሚመራና በዋናው ቤተመቅደስ እንደሚሰጠው ዓይነት \"የክርስትና እድገት\" የደቀ መዝሙርነት ትምህርት የሚከተል ነው። ፓስተር አብርሃም ጌታቸው እነዚህ ቡድኖች በተለይ \"ቃሉ ወደ ገዛ ጠረጴዛቸው ይበልጥ እንዲቀርብላቸው ለሚያስፈልጋቸው\" አባላት እንደተዘጋጁ ገልጸዋል — በDMV ህይወት ለሚስተካክሉ አዲስ ስደተኞች፣ ረዥም የስራ ጊዜ ለሚያስተናግዱ ወጣት ቤተሰቦችና ወደ ቤተመቅደስ መንገድ ለከበዳቸው ዕድሜ ለገፉ አባላት።\n\nበቤት ኅብረት ቡድን ለመቀላቀል ወይም በስርጭት አገልግሎት ቡድን በፈቃደኝነት ለማገልገል የሚፈልጉ አባላት በመደበኛው የሰንበት ማስታወቂያ ወይም በዲሲ ቢሮ በኩል እንዲጠይቁ ይበረታታሉ።",
    imageUrl: "/images/hero/pastor-aberham-dc.jpg",
    videoUrl: "2jnqsYe7vG8",
    locationLabel: "Washington, D.C. Sanctuary",
    publishedDateLabel: "November 2026",
    isPinnedLeadStory: false,
    createdAt: "2026-11-04T00:00:00.000Z",
  },
  {
    id: "update-eastern-ethiopia-outreach-growth",
    slug: "eastern-ethiopia-outreach-growth",
    titleEn: "22 Rural Outreach Stations in Eastern Ethiopia Report New Believers, Baptisms & Church Planting Growth",
    titleAm: "በምስራቅ ኢትዮጵያ ያሉ 22 የገጠር ስርጭት ጣቢያዎች አዳዲስ አማኞች፣ ጥምቀቶችና ቤተክርስቲያን ተከላ እድገት ዘገባ አቅርበዋል",
    category: "Ethiopian Synod Update",
    summaryEn:
      "The Eastern Ethiopia Synod's 22 rural outreach stations report a wave of new believers and baptisms this quarter, alongside early groundwork for two additional church plants in previously unreached farming communities.",
    summaryAm:
      "የምስራቅ ኢትዮጵያ ሲኖዶስ 22 የገጠር ስርጭት ጣቢያዎች በዚህ ሩብ ዓመት ስለ ብዙ አዳዲስ አማኞችና ጥምቀቶች ዘገባ አቅርበዋል፤ እንዲሁም ወንጌል ገና ላልደረሰባቸው የገጠር አካባቢዎች ለሁለት ተጨማሪ ቤተክርስቲያን ተከላዎች የመጀመሪያ ስራ ተጀምሯል።",
    contentEn:
      "Synod leadership for Eastern Ethiopia reports a strong quarter of growth across the region's 22 rural outreach stations, spanning farming communities around Harar, Dire Dawa, and the surrounding countryside. Local pastors and evangelists recorded a noticeable increase in new believers this period, with several stations hosting baptism services for first-time converts — many from villages with little or no prior evangelical presence.\n\nBeyond the baptisms, synod leaders have identified two additional farming communities as candidates for new church plants, building on the same rural outreach model that has carried the gospel to 22 stations since the ministry's founding. Evangelists are currently conducting preliminary visits and relationship-building in both communities, with a target of holding first public gatherings in the coming months.\n\n\"Every one of our 22 stations started exactly this way — a handful of believers, a borrowed room, and a willingness to keep showing up,\" said one regional overseer. The synod has asked Partners to continue praying specifically for laborers, since the growth is outpacing the number of trained evangelists currently available to serve the new congregations.",
    contentAm:
      "የምስራቅ ኢትዮጵያ ሲኖዶስ አመራር በሐረርና በድሬዳዋ አካባቢ በሚገኙ የገጠር ማህበረሰቦች ውስጥ ባሉት 22 የገጠር ስርጭት ጣቢያዎች ጠንካራ የዕድገት ሩብ ዓመት ዘግቧል። የአካባቢው ፓስተሮችና ወንጌላውያን በዚህ ወቅት ስለ አዳዲስ አማኞች ከፍተኛ ጭማሪ ዘግበዋል፤ በርካታ ጣቢያዎችም ለመጀመሪያ ጊዜ ለተለወጡ ጥምቀት አገልግሎቶችን አከናውነዋል — ብዙዎቹም ቀደም ሲል ትንሽ ወይም ምንም ወንጌላዊ ተገኝነት ካልነበራቸው መንደሮች ናቸው።\n\nከጥምቀቶቹ ባሻገር፣ የሲኖዶስ አመራሮች ከመሥራቱ ጀምሮ ወንጌልን ለ22 ጣቢያዎች ያደረሰውን ይህንኑ የገጠር ስርጭት ሞዴል በመከተል ለሁለት ተጨማሪ ቤተክርስቲያን ተከላዎች ዕጩ የሆኑ ተጨማሪ የገጠር ማህበረሰቦችን ለይተዋል። ወንጌላውያን በአሁኑ ሰዓት በሁለቱም ማህበረሰቦች የመጀመሪያ ጉብኝቶችንና ዝምድና የመገንባት ስራ እያከናወኑ ሲሆን፣ በሚቀጥሉት ወራት የመጀመሪያ የህዝብ ስብሰባዎችን ለማድረግ ዓላማ አድርገዋል።\n\n\"ሁሉም 22 ጣቢያዎቻችን የጀመሩት በትክክል በዚህ መንገድ ነው — ጥቂት አማኞች፣ የተዋሱት ክፍልና ዘወትር የመገኘት ፈቃደኝነት\" ብለዋል አንድ የክልል ተጠሪ። ሲኖዶሱ እድገቱ አዳዲሱን ጉባኤዎች ለማገልገል አሁን ካሉት የሰለጠኑ ወንጌላውያን ቁጥር እየበለጠ በመሆኑ አጋሮች በተለይ ለሠራተኞች በጸሎት እንዲቆሙ ጠይቋል።",
    imageUrl: "https://glministries.org/wp-content/uploads/2020/05/East_Showa_300x300.png",
    locationLabel: "Eastern Ethiopia Synod",
    publishedDateLabel: "November 2026",
    isPinnedLeadStory: false,
    createdAt: "2026-11-06T00:00:00.000Z",
  },
  {
    id: "update-hearing-voice-of-god-release",
    slug: "hearing-the-voice-of-god-worldwide-release",
    titleEn:
      "New Discipleship Resource Release: Apostle Daniel Makonnen's \"Hearing the Voice of God\" (የእግዚአብሔር ድምጽ) Now Available Worldwide",
    titleAm: "አዲስ የደቀ መዝሙርነት መጽሐፍ ዕትም፦ የሐዋሪያው ዳንኤል መኮንን \"የእግዚአብሔር ድምጽ\" አሁን በዓለም ዙሪያ ይገኛል",
    category: "Special Announcement",
    summaryEn:
      "Apostle Daniel Makonnen's discipleship book \"Hearing the Voice of God\" (የእግዚአብሔር ድምጽ) is now available worldwide in both print and digital PDF through the ministry's Book Store, and is this month's Monthly Partner Resource Offer.",
    summaryAm:
      "የሐዋሪያው ዳንኤል መኮንን የደቀ መዝሙርነት መጽሐፍ \"የእግዚአብሔር ድምጽ\" አሁን በአገልግሎቱ የመጻሕፍት መደብር በኩል በህትመትና በዲጂታል ፒዲኤፍ በዓለም ዙሪያ ይገኛል፤ የዚህ ወር የአጋር ሀብት ስጦታም ነው።",
    contentEn:
      "\"Hearing the Voice of God\" (የእግዚአብሔር ድምጽ), Apostle Daniel Makonnen's practical guide to recognizing how God speaks through His Word and the Holy Spirit, testing prophetic impressions, and walking in divine guidance, is now available worldwide through the ministry's Book Store — in both a print paperback edition and a digital PDF eBook for instant download.\n\nThe release follows years of the same teaching being delivered in person across Gospel Light's 32 Ethiopian branches and the Washington, D.C. sanctuary, now compiled into a single resource for believers who want to study it at their own pace or share it with a home fellowship group. Early readers have highlighted the book's practical framework for distinguishing God's voice from competing noise — a theme Apostle Makonnen has taught on for decades.\n\n\"Hearing the Voice of God\" is this month's Monthly Partner Resource Offer, available as a thank-you gift to Monthly and Annual Covenant Partners through the Giving portal, and can also be purchased individually — print or digital — through the Book Store for international shipping or instant worldwide digital access.",
    contentAm:
      "\"የእግዚአብሔር ድምጽ\"፣ የሐዋሪያው ዳንኤል መኮንን እግዚአብሔር በቃሉና በመንፈስ ቅዱስ እንዴት እንደሚናገር መለየት፣ ትንቢታዊ ግንዛቤዎችን መሞከርና በመለኮታዊ መሪነት መመላለስ የሚያስተምር ተግባራዊ መጽሐፍ፣ አሁን በአገልግሎቱ የመጻሕፍት መደብር በኩል በዓለም ዙሪያ ይገኛል — በህትመት ርካሽ ዕትምም ሆነ ለቅጽበታዊ ማውረድ በዲጂታል ፒዲኤፍ መልክ።\n\nይህ ዕትም ለብዙ ዓመታት በ32 የኢትዮጵያ አጥቢያዎችና በዋሽንግተን ዲሲ ቤተመቅደስ በአካል ተሰጥቶ የቆየውን ትምህርት ተከትሎ የመጣ ሲሆን፣ አሁን አማኞች በራሳቸው ፍጥነት ለማጥናት ወይም ከቤት ኅብረት ቡድን ጋር ለማካፈል በአንድ ሀብት ውስጥ ተጠናቅሯል። የመጀመሪያ አንባቢዎች የእግዚአብሔርን ድምጽ ከሚፋለሱ ድምፆች መለየት የሚያስተምረውን የመጽሐፉን ተግባራዊ ማዕቀፍ አጉልተው ገልጸዋል — ሐዋሪያው መኮንን ለአስርት ዓመታት ያስተማሩበት ርዕስ።\n\n\"የእግዚአብሔር ድምጽ\" የዚህ ወር የአጋር ሀብት ስጦታ ነው፤ በመለገስ መግቢያ በኩል ለወራዊና ለዓመታዊ የቃል ኪዳን አጋሮች እንደ ምስጋና ስጦታ የሚሰጥ ሲሆን፣ ለዓለም አቀፍ መላኪያ ወይም ለቅጽበታዊ ዓለም አቀፍ ዲጂታል መዳረሻ በህትመትም ሆነ በዲጂታል በተናጠል በመጻሕፍት መደብር ሊገዛ ይችላል።",
    imageUrl: "https://glministries.org/wp-content/uploads/2020/05/glm-book2.png",
    locationLabel: "Aware HQ, Addis Ababa & Worldwide",
    publishedDateLabel: "November 2026",
    isPinnedLeadStory: false,
    createdAt: "2026-11-08T00:00:00.000Z",
  },
];
