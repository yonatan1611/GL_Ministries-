import type { BranchLocation, SynodRegion } from "@/types/ministry";
import { CONTACT_EMAILS, CONTACT_PHONES } from "@/lib/env";

/**
 * Full 31-location branch/synod directory for Gospel Light Ministries
 * International. Replaces the legacy WordPress site's frozen, zeroed-out
 * counters ("0" Addis Ababa, "0" East Showa, "2" Eastern Ethiopia, "0"
 * Washington, D.C.) and misspellings ("Bracnh", "Estern Ethiopia",
 * "Washinggton DC", "dc@glmministries.org").
 *
 * Contact routing note: most branch congregations and rural outreach
 * stations do not maintain independent phone lines or email inboxes.
 * Where a branch has no dedicated contact of its own, inquiries route
 * through the Aware International HQ switchboard/inbox (Ethiopia) or the
 * Washington, D.C. office (USA) — this mirrors how the ministry actually
 * operates rather than inventing unverifiable per-branch contact details.
 */

export const HQ_PHONE = CONTACT_PHONES.addis;
export const HQ_EMAIL = CONTACT_EMAILS.addis;
export const DC_PHONE = CONTACT_PHONES.dc;
export const DC_EMAIL = CONTACT_EMAILS.dc;

const STANDARD_BRANCH_SERVICE_TIMES_EN =
  "Sunday Worship 9:00 AM – 12:00 PM; Wednesday Prayer & Bible Study 5:00 PM – 7:00 PM.";
const STANDARD_BRANCH_SERVICE_TIMES_AM =
  "የሰንበት አምልኮ ከጠዋቱ 9፡00 – 12፡00፤ የረቡዕ ጸሎትና የመጽሐፍ ቅዱስ ጥናት ከቀኑ 5፡00 – 7፡00።";

const SYNOD_CENTER_SERVICE_TIMES_EN =
  "Sunday Worship 9:00 AM – 12:30 PM; Wednesday Intercessory Prayer 5:00 PM – 7:00 PM; Monthly East Showa Synod Pastors' Fellowship.";
const SYNOD_CENTER_SERVICE_TIMES_AM =
  "የሰንበት አምልኮ ከጠዋቱ 9፡00 – 12፡30፤ የረቡዕ የምልጃ ጸሎት ከቀኑ 5፡00 – 7፡00፤ በወር አንድ ጊዜ የምስራቅ ሸዋ ሲኖዶስ የአገልጋዮች ህብረት።";

const OUTREACH_SERVICE_TIMES_EN =
  "Sunday Fellowship Gathering; itinerant pastoral visitation on a rotating circuit schedule.";
const OUTREACH_SERVICE_TIMES_AM =
  "የሰንበት የህብረት አምልኮ፤ በዙር መርሃ ግብር የሚሰጥ ፓስተራዊ ጉብኝት።";

/** Full 31-location branch/synod directory. */
export const LOCATIONS: BranchLocation[] = [
  {
    id: "l1",
    slug: "aware-branch-international-hq",
    synod: "Addis Ababa",
    nameAm: "አዋሬ አጥቢያ (ዋና ቢሮ)",
    nameEn: "Aware Branch (International HQ)",
    city: "Addis Ababa",
    type: "Headquarters Church",
    detailsEn:
      "Founding church & international headquarters of Gospel Light Ministries International. Connected with gospellightethiopia.org.",
    detailsAm:
      "የወንጌል ብርሃን አለማቀፍ አገልግሎት መስራች ቤተክርስቲያን እና ዋና ቢሮ (አዋሬ፣ አዲስ አበባ)።",
    address: "Aware, Kirkos Sub-City, P.O. Box 12992, Addis Ababa, Ethiopia",
    phone: HQ_PHONE,
    email: HQ_EMAIL,
    serviceTimesEn:
      "Sunday Worship 9:00 AM – 12:30 PM (Livestreamed); Wednesday Prayer & Teaching 5:00 PM – 7:00 PM; Monthly Friday All-Night Prayer.",
    serviceTimesAm:
      "የሰንበት አምልኮ ከጠዋቱ 9፡00 – 12፡30 (በቀጥታ ስርጭት)፤ የረቡዕ ጸሎትና ትምህርት ከቀኑ 5፡00 – 7፡00፤ በወር አንድ ጊዜ የአርብ ምሽት ጸሎት።",
    coordinates: { lat: 9.0054, lng: 38.7636 },
  },
  {
    id: "l2",
    slug: "ayat-branch-church",
    synod: "Addis Ababa",
    nameAm: "አያት አጥቢያ",
    nameEn: "Ayat Branch Church",
    city: "Addis Ababa",
    type: "Branch Church",
    detailsEn:
      "Serving Eastern Addis Ababa congregants under the Addis Ababa Synod with Sunday worship, youth ministry, and midweek prayer.",
    detailsAm:
      "በምስራቅ አዲስ አበባ የሚገኙ የአዲስ አበባ ሲኖዶስ አማኞችን የምታገለግል አጥቢያ፤ የሰንበት አምልኮ፣ የወጣቶች አገልግሎት እና የሳምንት አጋማሽ ጸሎት ታካሂዳለች።",
    address: "Ayat, Addis Ababa, Ethiopia",
    phone: HQ_PHONE,
    email: HQ_EMAIL,
    serviceTimesEn: STANDARD_BRANCH_SERVICE_TIMES_EN,
    serviceTimesAm: STANDARD_BRANCH_SERVICE_TIMES_AM,
  },
  {
    id: "l3",
    slug: "ayer-tena-branch-church",
    synod: "Addis Ababa",
    nameAm: "አየር ጤና አጥቢያ",
    nameEn: "Ayer Tena Branch Church",
    city: "Addis Ababa",
    type: "Branch Church",
    detailsEn:
      "Serving Southwestern Addis Ababa communities with vibrant Sunday worship, family discipleship, and midweek intercession.",
    detailsAm:
      "በደቡብ ምዕራብ አዲስ አበባ ማህበረሰቦችን የምታገለግል አጥቢያ፤ ሕያው የሰንበት አምልኮ፣ የቤተሰብ ደቀ መዝሙርነት እና የሳምንት አጋማሽ የምልጃ ጸሎት ታካሂዳለች።",
    address: "Ayer Tena, Addis Ababa, Ethiopia",
    phone: HQ_PHONE,
    email: HQ_EMAIL,
    serviceTimesEn: STANDARD_BRANCH_SERVICE_TIMES_EN,
    serviceTimesAm: STANDARD_BRANCH_SERVICE_TIMES_AM,
  },
  {
    id: "l4",
    slug: "adama-special-zone-branch-pan-africa",
    synod: "East Showa",
    nameAm: "አዳማ ልዩ ዞን አጥቢያ (ፓን አፍሪካ ሰፈር)",
    nameEn: "Adama Special Zone Branch (Pan Africa)",
    city: "Adama",
    type: "Synod Center",
    detailsEn:
      "Regional Synod Center located in Pan Africa Sefer, Adama, coordinating ministry across the East Showa Zone.",
    detailsAm:
      "በአዳማ ፓን አፍሪካ ሰፈር የሚገኝ የሲኖዶስ ማዕከል፤ በምስራቅ ሸዋ ዞን አገልግሎትን ያስተባብራል።",
    address: "Pan Africa Sefer, Adama, Oromia Region, Ethiopia",
    phone: HQ_PHONE,
    email: HQ_EMAIL,
    serviceTimesEn: SYNOD_CENTER_SERVICE_TIMES_EN,
    serviceTimesAm: SYNOD_CENTER_SERVICE_TIMES_AM,
    coordinates: { lat: 8.54, lng: 39.27 },
  },
  {
    id: "l5",
    slug: "adama-silassie-branch",
    synod: "East Showa",
    nameAm: "አዳማ ስላሴ አጥቢያ (ስላሴ ሰፈር)",
    nameEn: "Adama Silassie Branch",
    city: "Adama",
    type: "Branch Church",
    detailsEn: "Local branch congregation located in Silassie Sefer, Adama.",
    detailsAm: "በአዳማ ስላሴ ሰፈር የሚገኝ የአካባቢ አጥቢያ ቤተክርስቲያን።",
    address: "Silassie Sefer, Adama, Oromia Region, Ethiopia",
    phone: HQ_PHONE,
    email: HQ_EMAIL,
    serviceTimesEn: STANDARD_BRANCH_SERVICE_TIMES_EN,
    serviceTimesAm: STANDARD_BRANCH_SERVICE_TIMES_AM,
  },
  {
    id: "l6",
    slug: "adama-sefere-selam-branch",
    synod: "East Showa",
    nameAm: "አዳማ ሰፈረ ሰላም አጥቢያ (ሰላም ሰፈር)",
    nameEn: "Adama Sefere Selam Branch",
    city: "Adama",
    type: "Branch Church",
    detailsEn: "Local branch congregation located in Selam Sefer, Adama.",
    detailsAm: "በአዳማ ሰላም ሰፈር የሚገኝ የአካባቢ አጥቢያ ቤተክርስቲያን።",
    address: "Selam Sefer, Adama, Oromia Region, Ethiopia",
    phone: HQ_PHONE,
    email: HQ_EMAIL,
    serviceTimesEn: STANDARD_BRANCH_SERVICE_TIMES_EN,
    serviceTimesAm: STANDARD_BRANCH_SERVICE_TIMES_AM,
  },
  {
    id: "l7",
    slug: "adama-105-meto-amist-branch",
    synod: "East Showa",
    nameAm: "አዳማ መቶ አምስት አጥቢያ (መቶ አምስት ሰፈር)",
    nameEn: "Adama 105 (Meto Amist) Branch",
    city: "Adama",
    type: "Branch Church",
    detailsEn:
      "Local branch congregation located in Meto Amist (105) Sefer, Adama.",
    detailsAm:
      "በአዳማ መቶ አምስት (105) ሰፈር የሚገኝ የአካባቢ አጥቢያ ቤተክርስቲያን።",
    address: "Meto Amist (105) Sefer, Adama, Oromia Region, Ethiopia",
    phone: HQ_PHONE,
    email: HQ_EMAIL,
    serviceTimesEn: STANDARD_BRANCH_SERVICE_TIMES_EN,
    serviceTimesAm: STANDARD_BRANCH_SERVICE_TIMES_AM,
  },
  {
    id: "l8",
    slug: "meki-city-branch-church",
    synod: "East Showa",
    nameAm: "መቂ አጥቢያ (መቂ ከተማ)",
    nameEn: "Meki City Branch Church",
    city: "Meki",
    type: "Branch Church",
    detailsEn:
      "Serving believers and families in Meki town and surrounding Rift Valley communities under the East Showa Zone Synod.",
    detailsAm:
      "በመቂ ከተማና በአካባቢው ባሉ የስምጥ ሸለቆ ማህበረሰቦች ያሉ አማኞችንና ቤተሰቦችን በምስራቅ ሸዋ ዞን ሲኖዶስ ስር የምታገለግል አጥቢያ።",
    address: "Meki Town, East Shewa Zone, Oromia Region, Ethiopia",
    phone: HQ_PHONE,
    email: HQ_EMAIL,
    serviceTimesEn: STANDARD_BRANCH_SERVICE_TIMES_EN,
    serviceTimesAm: STANDARD_BRANCH_SERVICE_TIMES_AM,
    coordinates: { lat: 8.1527, lng: 38.8295 },
  },
  {
    id: "l9",
    slug: "harar-branch-sefere-selam",
    synod: "Eastern Ethiopia",
    nameAm: "ሐረር አጥቢያ (ሰፈረ ሰላም ሰፈር)",
    nameEn: "Harar Branch (Sefere Selam)",
    city: "Harar",
    type: "Branch Church",
    detailsEn:
      "Historic Eastern Ethiopia congregation located in Sefere Selam neighborhood, Harar.",
    detailsAm:
      "በሐረር ሰፈረ ሰላም ሰፈር የሚገኝ ታሪካዊ የምስራቅ ኢትዮጵያ አጥቢያ ቤተክርስቲያን።",
    address: "Sefere Selam, Harar, Ethiopia",
    phone: HQ_PHONE,
    email: HQ_EMAIL,
    serviceTimesEn: STANDARD_BRANCH_SERVICE_TIMES_EN,
    serviceTimesAm: STANDARD_BRANCH_SERVICE_TIMES_AM,
    coordinates: { lat: 9.3147, lng: 42.1211 },
  },
  {
    id: "l10",
    slug: "dire-dawa-branch-kezira",
    synod: "Eastern Ethiopia",
    nameAm: "ድሬዳዋ አጥቢያ (ከዚራ ሰፈር)",
    nameEn: "Dire Dawa Branch (Kezira)",
    city: "Dire Dawa",
    type: "Branch Church",
    detailsEn:
      "Major urban congregation located in Kezira neighborhood, Dire Dawa.",
    detailsAm:
      "በድሬዳዋ ከዚራ ሰፈር የሚገኝ ትልቅ የከተማ አጥቢያ ቤተክርስቲያን።",
    address: "Kezira, Dire Dawa, Ethiopia",
    phone: HQ_PHONE,
    email: HQ_EMAIL,
    serviceTimesEn: STANDARD_BRANCH_SERVICE_TIMES_EN,
    serviceTimesAm: STANDARD_BRANCH_SERVICE_TIMES_AM,
    coordinates: { lat: 9.5931, lng: 41.8661 },
  },
  {
    id: "l11",
    slug: "hirna-town-branch",
    synod: "Eastern Ethiopia",
    nameAm: "ሒርና አጥቢያ (ሒርና ከተማ)",
    nameEn: "Hirna Town Branch",
    city: "Hirna",
    type: "Branch Church",
    detailsEn:
      "Serving Hirna City and surrounding Western Hararghe highland communities.",
    detailsAm:
      "ሒርና ከተማንና በዙሪያው ያሉ የምዕራብ ሐረርጌ ደጋማ ማህበረሰቦችን የምታገለግል አጥቢያ።",
    address: "Hirna Town, West Hararghe Zone, Ethiopia",
    phone: HQ_PHONE,
    email: HQ_EMAIL,
    serviceTimesEn: STANDARD_BRANCH_SERVICE_TIMES_EN,
    serviceTimesAm: STANDARD_BRANCH_SERVICE_TIMES_AM,
    coordinates: { lat: 9.2167, lng: 41.1 },
  },
  {
    id: "l12",
    slug: "chiro-branch-church",
    synod: "Eastern Ethiopia",
    nameAm: "ጭሮ አጥቢያ",
    nameEn: "Chiro Branch Church",
    city: "Chiro",
    type: "Branch Church",
    detailsEn:
      "Chiro town congregation serving Western Hararghe under the Eastern Ethiopia Synod.",
    detailsAm:
      "በምስራቅ ኢትዮጵያ ሲኖዶስ ስር ምዕራብ ሐረርጌን የምታገለግል የጭሮ ከተማ አጥቢያ።",
    address: "Chiro Town, West Hararghe Zone, Ethiopia",
    phone: HQ_PHONE,
    email: HQ_EMAIL,
    serviceTimesEn: STANDARD_BRANCH_SERVICE_TIMES_EN,
    serviceTimesAm: STANDARD_BRANCH_SERVICE_TIMES_AM,
    coordinates: { lat: 9.0833, lng: 40.8667 },
  },
  {
    id: "l13",
    slug: "upper-metakesha-branch",
    synod: "Eastern Ethiopia",
    nameAm: "ላይኛው መጣቀሻ አጥቢያ",
    nameEn: "Upper Metakesha Branch",
    city: "Metakesha",
    type: "Branch Church",
    detailsEn:
      "Established congregation in Upper Metakesha under the Eastern Ethiopia Synod.",
    detailsAm:
      "በምስራቅ ኢትዮጵያ ሲኖዶስ ስር የምትገኝ የላይኛው መጣቀሻ የተመሰረተች አጥቢያ።",
    address: "Upper Metakesha, West Hararghe Zone, Ethiopia",
    phone: HQ_PHONE,
    email: HQ_EMAIL,
    serviceTimesEn: STANDARD_BRANCH_SERVICE_TIMES_EN,
    serviceTimesAm: STANDARD_BRANCH_SERVICE_TIMES_AM,
  },
  {
    id: "l14",
    slug: "daba-branch-church",
    synod: "Eastern Ethiopia",
    nameAm: "ዳባ አጥቢያ",
    nameEn: "Daba Branch Church",
    city: "Daba",
    type: "Branch Church",
    detailsEn:
      "Local church congregation serving Daba and neighboring villages in Eastern Ethiopia.",
    detailsAm:
      "ዳባንና በአካባቢው ያሉ መንደሮችን በምስራቅ ኢትዮጵያ የምታገለግል የአካባቢ አጥቢያ ቤተክርስቲያን።",
    address: "Daba, Eastern Ethiopia",
    phone: HQ_PHONE,
    email: HQ_EMAIL,
    serviceTimesEn: STANDARD_BRANCH_SERVICE_TIMES_EN,
    serviceTimesAm: STANDARD_BRANCH_SERVICE_TIMES_AM,
  },
  {
    id: "l15",
    slug: "mesela-branch-church",
    synod: "Eastern Ethiopia",
    nameAm: "መሠላ አጥቢያ",
    nameEn: "Mesela Branch Church",
    city: "Mesela",
    type: "Branch Church",
    detailsEn:
      "Mesela town congregation equipping believers across the Eastern Ethiopia Synod.",
    detailsAm:
      "በምስራቅ ኢትዮጵያ ሲኖዶስ ውስጥ አማኞችን የምታዘጋጅ የመሠላ ከተማ አጥቢያ።",
    address: "Mesela, Eastern Ethiopia",
    phone: HQ_PHONE,
    email: HQ_EMAIL,
    serviceTimesEn: STANDARD_BRANCH_SERVICE_TIMES_EN,
    serviceTimesAm: STANDARD_BRANCH_SERVICE_TIMES_AM,
  },
  {
    id: "l16",
    slug: "genda-memre-outreach-station",
    synod: "Eastern Ethiopia",
    nameAm: "ገንዳ መምሬ ስርጭት ጣቢያ",
    nameEn: "Genda Memre Outreach Station",
    city: "Genda Memre",
    type: "Outreach Station",
    detailsEn:
      "Rural peasant association mission and church-planting station (ገ/ማህበር ስርጭት ጣቢያ).",
    detailsAm:
      "የገጠር ገበሬ ማህበር ተልዕኮና የቤተክርስቲያን መስራች ጣቢያ (ገ/ማህበር ስርጭት ጣቢያ)።",
    address: "Genda Memre, Eastern Ethiopia",
    phone: HQ_PHONE,
    email: HQ_EMAIL,
    serviceTimesEn: OUTREACH_SERVICE_TIMES_EN,
    serviceTimesAm: OUTREACH_SERVICE_TIMES_AM,
  },
  {
    id: "l17",
    slug: "welinso-outreach-station",
    synod: "Eastern Ethiopia",
    nameAm: "ወሊንሶ ስርጭት ጣቢያ",
    nameEn: "Welinso Outreach Station",
    city: "Welinso",
    type: "Outreach Station",
    detailsEn: "Welinso rural evangelism and discipleship mission station.",
    detailsAm:
      "የወሊንሶ የገጠር ወንጌል ስርጭትና የደቀ መዝሙርነት ተልዕኮ ጣቢያ።",
    address: "Welinso, Eastern Ethiopia",
    phone: HQ_PHONE,
    email: HQ_EMAIL,
    serviceTimesEn: OUTREACH_SERVICE_TIMES_EN,
    serviceTimesAm: OUTREACH_SERVICE_TIMES_AM,
  },
  {
    id: "l18",
    slug: "lower-metakesha-outreach-station",
    synod: "Eastern Ethiopia",
    nameAm: "ታችኛው መጣቀሻ ስርጭት ጣቢያ",
    nameEn: "Lower Metakesha Outreach Station",
    city: "Metakesha",
    type: "Outreach Station",
    detailsEn:
      "Lower Metakesha community outreach and church-planting station.",
    detailsAm:
      "የታችኛው መጣቀሻ ማህበረሰብ ስርጭትና የቤተክርስቲያን መስራች ጣቢያ።",
    address: "Lower Metakesha, West Hararghe Zone, Ethiopia",
    phone: HQ_PHONE,
    email: HQ_EMAIL,
    serviceTimesEn: OUTREACH_SERVICE_TIMES_EN,
    serviceTimesAm: OUTREACH_SERVICE_TIMES_AM,
  },
  {
    id: "l19",
    slug: "gara-tufa-outreach-station",
    synod: "Eastern Ethiopia",
    nameAm: "ጋራ ቱፋ ስርጭት ጣቢያ",
    nameEn: "Gara Tufa Outreach Station",
    city: "Gara Tufa",
    type: "Outreach Station",
    detailsEn:
      "Eastern Ethiopia rural outreach and gospel mission station in Gara Tufa.",
    detailsAm:
      "በጋራ ቱፋ የሚገኝ የምስራቅ ኢትዮጵያ የገጠር ስርጭትና የወንጌል ተልዕኮ ጣቢያ።",
    address: "Gara Tufa, Eastern Ethiopia",
    phone: HQ_PHONE,
    email: HQ_EMAIL,
    serviceTimesEn: OUTREACH_SERVICE_TIMES_EN,
    serviceTimesAm: OUTREACH_SERVICE_TIMES_AM,
  },
  {
    id: "l20",
    slug: "chima-outreach-station",
    synod: "Eastern Ethiopia",
    nameAm: "ጪማ ስርጭት ጣቢያ",
    nameEn: "Chima Outreach Station",
    city: "Chima",
    type: "Outreach Station",
    detailsEn:
      "Eastern Ethiopia rural outreach station serving Chima communities.",
    detailsAm:
      "ጪማን ማህበረሰቦች የምታገለግል የምስራቅ ኢትዮጵያ የገጠር ስርጭት ጣቢያ።",
    address: "Chima, Eastern Ethiopia",
    phone: HQ_PHONE,
    email: HQ_EMAIL,
    serviceTimesEn: OUTREACH_SERVICE_TIMES_EN,
    serviceTimesAm: OUTREACH_SERVICE_TIMES_AM,
  },
  {
    id: "l21",
    slug: "chefe-neftegna-outreach-station",
    synod: "Eastern Ethiopia",
    nameAm: "ጨፌ ነፍጠኛ ስርጭት ጣቢያ",
    nameEn: "Chefe Neftegna Outreach Station",
    city: "Chefe",
    type: "Outreach Station",
    detailsEn: "Eastern Ethiopia rural outreach station in Chefe Neftegna.",
    detailsAm:
      "በጨፌ ነፍጠኛ የሚገኝ የምስራቅ ኢትዮጵያ የገጠር ስርጭት ጣቢያ።",
    address: "Chefe Neftegna, Eastern Ethiopia",
    phone: HQ_PHONE,
    email: HQ_EMAIL,
    serviceTimesEn: OUTREACH_SERVICE_TIMES_EN,
    serviceTimesAm: OUTREACH_SERVICE_TIMES_AM,
  },
  {
    id: "l22",
    slug: "debeso-outreach-station",
    synod: "Eastern Ethiopia",
    nameAm: "ደበሶ ስርጭት ጣቢያ",
    nameEn: "Debeso Outreach Station",
    city: "Debeso",
    type: "Outreach Station",
    detailsEn: "Eastern Ethiopia rural outreach station serving Debeso.",
    detailsAm:
      "ደበሶን የምታገለግል የምስራቅ ኢትዮጵያ የገጠር ስርጭት ጣቢያ።",
    address: "Debeso, Eastern Ethiopia",
    phone: HQ_PHONE,
    email: HQ_EMAIL,
    serviceTimesEn: OUTREACH_SERVICE_TIMES_EN,
    serviceTimesAm: OUTREACH_SERVICE_TIMES_AM,
  },
  {
    id: "l23",
    slug: "karamile-outreach-station",
    synod: "Eastern Ethiopia",
    nameAm: "ካራሚሌ ስርጭት ጣቢያ",
    nameEn: "Karamile Outreach Station",
    city: "Karamile",
    type: "Outreach Station",
    detailsEn:
      "Karamile mission and evangelism station under the Eastern Ethiopia Synod.",
    detailsAm:
      "በምስራቅ ኢትዮጵያ ሲኖዶስ ስር የካራሚሌ ተልዕኮና ወንጌል ስርጭት ጣቢያ።",
    address: "Karamile, Eastern Ethiopia",
    phone: HQ_PHONE,
    email: HQ_EMAIL,
    serviceTimesEn: OUTREACH_SERVICE_TIMES_EN,
    serviceTimesAm: OUTREACH_SERVICE_TIMES_AM,
  },
  {
    id: "l24",
    slug: "aroge-gebeya-outreach-station",
    synod: "Eastern Ethiopia",
    nameAm: "አሮጌ ገበያ ስርጭት ጣቢያ",
    nameEn: "Aroge Gebeya Outreach Station",
    city: "Aroge Gebeya",
    type: "Outreach Station",
    detailsEn: "Eastern Ethiopia rural outreach station in Aroge Gebeya.",
    detailsAm:
      "በአሮጌ ገበያ የሚገኝ የምስራቅ ኢትዮጵያ የገጠር ስርጭት ጣቢያ።",
    address: "Aroge Gebeya, Eastern Ethiopia",
    phone: HQ_PHONE,
    email: HQ_EMAIL,
    serviceTimesEn: OUTREACH_SERVICE_TIMES_EN,
    serviceTimesAm: OUTREACH_SERVICE_TIMES_AM,
  },
  {
    id: "l25",
    slug: "gende-mole-outreach-station",
    synod: "Eastern Ethiopia",
    nameAm: "ገንደ ሞሌ ስርጭት ጣቢያ",
    nameEn: "Gende Mole Outreach Station",
    city: "Gende Mole",
    type: "Outreach Station",
    detailsEn: "Eastern Ethiopia rural outreach station in Gende Mole.",
    detailsAm:
      "በገንደ ሞሌ የሚገኝ የምስራቅ ኢትዮጵያ የገጠር ስርጭት ጣቢያ።",
    address: "Gende Mole, Eastern Ethiopia",
    phone: HQ_PHONE,
    email: HQ_EMAIL,
    serviceTimesEn: OUTREACH_SERVICE_TIMES_EN,
    serviceTimesAm: OUTREACH_SERVICE_TIMES_AM,
  },
  {
    id: "l26",
    slug: "goliya-outreach-station",
    synod: "Eastern Ethiopia",
    nameAm: "ጎልያ ስርጭት ጣቢያ",
    nameEn: "Goliya Outreach Station",
    city: "Goliya",
    type: "Outreach Station",
    detailsEn: "Eastern Ethiopia rural outreach station in Goliya.",
    detailsAm:
      "በጎልያ የሚገኝ የምስራቅ ኢትዮጵያ የገጠር ስርጭት ጣቢያ።",
    address: "Goliya, Eastern Ethiopia",
    phone: HQ_PHONE,
    email: HQ_EMAIL,
    serviceTimesEn: OUTREACH_SERVICE_TIMES_EN,
    serviceTimesAm: OUTREACH_SERVICE_TIMES_AM,
  },
  {
    id: "l27",
    slug: "ute-farmers-assoc-outreach-station",
    synod: "Eastern Ethiopia",
    nameAm: "ኡቴ ገበሬ ማህበር ስርጭት ጣቢያ",
    nameEn: "Ute Farmers Assoc. Outreach Station",
    city: "Ute",
    type: "Outreach Station",
    detailsEn:
      "Ute rural farmers association community mission station (ኡቴ ገበሬ ማህበር).",
    detailsAm:
      "የኡቴ ገበሬ ማህበር ማህበረሰብ ተልዕኮ ጣቢያ (ኡቴ ገበሬ ማህበር)።",
    address: "Ute, Eastern Ethiopia",
    phone: HQ_PHONE,
    email: HQ_EMAIL,
    serviceTimesEn: OUTREACH_SERVICE_TIMES_EN,
    serviceTimesAm: OUTREACH_SERVICE_TIMES_AM,
  },
  {
    id: "l28",
    slug: "kufan-zik-outreach-station",
    synod: "Eastern Ethiopia",
    nameAm: "ቁፋን ዚቅ ገበሬ ማህበር ስርጭት ጣቢያ",
    nameEn: "Kufan Zik Outreach Station",
    city: "Kufan Zik",
    type: "Outreach Station",
    detailsEn: "Kufan Zik rural farmers association mission station.",
    detailsAm:
      "የቁፋን ዚቅ ገበሬ ማህበር የገጠር ተልዕኮ ጣቢያ።",
    address: "Kufan Zik, Eastern Ethiopia",
    phone: HQ_PHONE,
    email: HQ_EMAIL,
    serviceTimesEn: OUTREACH_SERVICE_TIMES_EN,
    serviceTimesAm: OUTREACH_SERVICE_TIMES_AM,
  },
  {
    id: "l29",
    slug: "modinod-outreach-station",
    synod: "Eastern Ethiopia",
    nameAm: "ሞዲኖድ ገበሬ ማህበር ስርጭት ጣቢያ",
    nameEn: "Modinod Outreach Station",
    city: "Modinod",
    type: "Outreach Station",
    detailsEn: "Modinod rural farmers association mission station.",
    detailsAm:
      "የሞዲኖድ ገበሬ ማህበር የገጠር ተልዕኮ ጣቢያ።",
    address: "Modinod, Eastern Ethiopia",
    phone: HQ_PHONE,
    email: HQ_EMAIL,
    serviceTimesEn: OUTREACH_SERVICE_TIMES_EN,
    serviceTimesAm: OUTREACH_SERVICE_TIMES_AM,
  },
  {
    id: "l30",
    slug: "addis-alem-kebso-outreach-stations",
    synod: "Eastern Ethiopia",
    nameAm: "አዲስ አለምና ቀብሶ ስርጭት ጣቢያዎች",
    nameEn: "Addis Alem & Kebso Outreach Stations",
    city: "Eastern Ethiopia",
    type: "Outreach Stations",
    detailsEn:
      "Dual rural mission stations serving Addis Alem (አዲስ አለም) and Kebso (ቀብሶ) communities (completing the 32 Ethiopian congregations).",
    detailsAm:
      "አዲስ አለምን (አዲስ አለም) እና ቀብሶን (ቀብሶ) ማህበረሰቦች የሚያገለግሉ ሁለት የገጠር ተልዕኮ ጣቢያዎች (32ቱን የኢትዮጵያ አጥቢያዎች የሚያጠናቅቁ)።",
    address: "Addis Alem & Kebso, Eastern Ethiopia",
    phone: HQ_PHONE,
    email: HQ_EMAIL,
    serviceTimesEn: OUTREACH_SERVICE_TIMES_EN,
    serviceTimesAm: OUTREACH_SERVICE_TIMES_AM,
  },
  {
    id: "l31",
    slug: "washington-dc-church-us-office",
    synod: "USA",
    nameAm: "ዋሽንግተን ዲሲ አጥቢያ ቤተክርስቲያን እና የአሜሪካ ቢሮ",
    nameEn: "Washington, D.C. Church & US Office",
    city: "Washington, D.C. / Alexandria, VA",
    type: "North America Branch",
    detailsEn:
      "North American headquarters and congregation led by Senior Pastor Aberham Bedasso. Sunday Worship 10:00 AM EST & Wednesday Prayer 7:00 PM EST.",
    detailsAm:
      "በፓስተር አብርሃም በዳሶ የሚመራ የሰሜን አሜሪካ ዋና ቢሮና አጥቢያ ቤተክርስቲያን (2401 Virginia Ave NW, Washington, DC) እና የአስተዳደር ቢሮ (Alexandria, VA)።",
    address:
      "Worship Sanctuary: 2401 Virginia Ave NW, Washington, DC 20037 | US Admin Office: 85 South Bragg St, Suite 200, Alexandria, VA 22312",
    phone: DC_PHONE,
    email: DC_EMAIL,
    serviceTimesEn: "Sunday Worship 10:00 AM EST; Wednesday Prayer 7:00 PM EST.",
    serviceTimesAm:
      "የሰንበት አምልኮ ከቀኑ 10፡00 (EST)፤ የረቡዕ ጸሎት ከምሽቱ 7፡00 (EST)።",
    coordinates: { lat: 38.9072, lng: -77.0369 },
  },
];

export interface SynodSummaryItem {
  synod: SynodRegion;
  labelEn: string;
  labelAm: string;
  branchCount: number;
  congregationCount: number;
  noteEn: string;
  noteAm: string;
  branchNamesEn: string[];
}

/**
 * Static summary of the four synods, written out explicitly (titles,
 * counts, and branch-name lists) per the ministry's verified 2026
 * directory audit — directly replacing the legacy homepage's frozen,
 * zeroed-out counters.
 */
export const SYNOD_SUMMARY: SynodSummaryItem[] = [
  {
    synod: "Addis Ababa",
    labelEn: "Addis Ababa Synod",
    labelAm: "የአዲስ አበባ ሲኖዶስ",
    branchCount: 3,
    congregationCount: 3,
    noteEn: "3 Branches: Aware International HQ, Ayat, and Ayer Tena.",
    noteAm: "3 አጥቢያዎች፦ አዋሬ (ዋና ቢሮ)፣ አያት እና አየር ጤና።",
    branchNamesEn: [
      "Aware Branch (International HQ)",
      "Ayat Branch Church",
      "Ayer Tena Branch Church",
    ],
  },
  {
    synod: "East Showa",
    labelEn: "East Showa Zone Synod",
    labelAm: "የምስራቅ ሸዋ ዞን ሲኖዶስ",
    branchCount: 5,
    congregationCount: 5,
    noteEn:
      "5 Branches: Adama Special Zone (Pan Africa), Adama Silassie, Adama Sefere Selam, Adama 105 / Meto Amist, and Meki City.",
    noteAm:
      "5 አጥቢያዎች፦ አዳማ ልዩ ዞን (ፓን አፍሪካ)፣ አዳማ ስላሴ፣ አዳማ ሰፈረ ሰላም፣ አዳማ መቶ አምስት (105)፣ እና መቂ ከተማ።",
    branchNamesEn: [
      "Adama Special Zone Branch (Pan Africa)",
      "Adama Silassie Branch",
      "Adama Sefere Selam Branch",
      "Adama 105 (Meto Amist) Branch",
      "Meki City Branch Church",
    ],
  },
  {
    synod: "Eastern Ethiopia",
    labelEn: "Eastern Ethiopia Synod",
    labelAm: "የምስራቅ ኢትዮጵያ ሲኖዶስ",
    branchCount: 22,
    congregationCount: 23,
    noteEn:
      "22 Branches & Rural Outreach Stations, covering 23 congregations (the Addis Alem & Kebso station serves two communities), bringing Ethiopia's full directory to 32 congregations/stations alongside Addis Ababa and East Showa.",
    noteAm:
      "22 አጥቢያዎችና የገጠር ስርጭት ጣቢያዎች፣ 23 ማህበረሰቦችን የሚያገለግሉ (አዲስ አለምና ቀብሶ ጣቢያ ሁለት ማህበረሰቦችን ያገለግላል)፤ ከአዲስ አበባና ከምስራቅ ሸዋ ጋር ተዳምሮ የኢትዮጵያን 32 አጥቢያዎች ያጠናቅቃል።",
    branchNamesEn: [
      "Harar Branch (Sefere Selam)",
      "Dire Dawa Branch (Kezira)",
      "Hirna Town Branch",
      "Chiro Branch Church",
      "Upper Metakesha Branch",
      "Daba Branch Church",
      "Mesela Branch Church",
      "Genda Memre Outreach Station",
      "Welinso Outreach Station",
      "Lower Metakesha Outreach Station",
      "Gara Tufa Outreach Station",
      "Chima Outreach Station",
      "Chefe Neftegna Outreach Station",
      "Debeso Outreach Station",
      "Karamile Outreach Station",
      "Aroge Gebeya Outreach Station",
      "Gende Mole Outreach Station",
      "Goliya Outreach Station",
      "Ute Farmers Assoc. Outreach Station",
      "Kufan Zik Outreach Station",
      "Modinod Outreach Station",
      "Addis Alem & Kebso Outreach Stations",
    ],
  },
  {
    synod: "USA",
    labelEn: "USA / North America",
    labelAm: "አሜሪካ / ሰሜን አሜሪካ",
    branchCount: 1,
    congregationCount: 1,
    noteEn:
      "1 Branch & Administrative Office: Washington, D.C. Church & Alexandria, VA Office.",
    noteAm:
      "1 አጥቢያና የአስተዳደር ቢሮ፦ የዋሽንግተን ዲሲ ቤተክርስቲያንና የአሌክሳንድሪያ ቫርጂኒያ ቢሮ።",
    branchNamesEn: ["Washington, D.C. Church & US Office"],
  },
];

/**
 * Derives live synod counts straight from `LOCATIONS`, so the directory
 * counters can never silently go stale/zero again the way the legacy
 * WordPress homepage's counters did.
 */
export function computeSynodBranchCounts(
  locations: BranchLocation[] = LOCATIONS
): Record<SynodRegion, number> {
  const counts: Record<SynodRegion, number> = {
    "Addis Ababa": 0,
    "East Showa": 0,
    "Eastern Ethiopia": 0,
    USA: 0,
  };
  for (const location of locations) {
    counts[location.synod] += 1;
  }
  return counts;
}

export function getLocationsBySynod(
  synod: SynodRegion,
  locations: BranchLocation[] = LOCATIONS
): BranchLocation[] {
  return locations.filter((location) => location.synod === synod);
}

export function getLocationBySlug(
  slug: string,
  locations: BranchLocation[] = LOCATIONS
): BranchLocation | undefined {
  return locations.find((location) => location.slug === slug);
}
