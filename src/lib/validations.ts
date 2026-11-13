import { z } from "zod";
import { sanitizeText, stripControlCharacters, stripHtmlTags } from "@/lib/security/sanitize";
import { CONTACT_EMAILS } from "@/lib/env";

/**
 * Strict Zod validation schemas for every interactive workflow: giving
 * checkout, book store orders, event RSVPs, prayer/pastoral contact, and
 * newsletter signup. Every free-text field is sanitized (HTML tags and
 * control/bidi characters stripped) before the rest of the schema's
 * rules are applied.
 */

/** A trimmed, length-bounded, sanitized free-text field. */
function sanitizedString(min: number, max: number) {
  return z
    .string()
    .trim()
    .min(min, `Must be at least ${min} character${min === 1 ? "" : "s"}.`)
    .max(max, `Must be ${max} characters or fewer.`)
    .transform(sanitizeText);
}

/**
 * Like `sanitizedString`, but for long-form multi-paragraph fields
 * (e.g. a news update's full story body) — preserves intentional
 * paragraph breaks instead of collapsing them away.
 *
 * `sanitizeText`'s `stripControlCharacters` treats `\n`/`\r` as control
 * characters (correctly, for a single-line field) and strips them
 * outright, then `normalizeWhitespace` would collapse any that
 * survived anyway — so a plain `sanitizedString` silently fuses every
 * paragraph into one run-on line. This sanitizes each line
 * individually (HTML tags, control/bidi characters, and horizontal
 * whitespace runs) and only then rejoins them with newlines, capping
 * more than one blank line between paragraphs.
 */
function sanitizedParagraphs(min: number, max: number) {
  return z
    .string()
    .trim()
    .min(min, `Must be at least ${min} character${min === 1 ? "" : "s"}.`)
    .max(max, `Must be ${max} characters or fewer.`)
    .transform((value) =>
      value
        .split("\n")
        .map((line) => stripControlCharacters(stripHtmlTags(line)).replace(/[ \t]+/g, " ").trim())
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    );
}

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .email("Please enter a valid email address.");

// ---------------------------------------------------------------------------
// 1. Donation / Giving Checkout
// ---------------------------------------------------------------------------

export const DONATION_FUNDS = [
  "Tithes & General Ministry",
  "Global Revival Crusades & Live Broadcasts",
  "Global Missions & 32 Ethiopian Branch Churches",
  "Aware International HQ Sanctuary",
  "Washington DC Sanctuary",
  "Compassion & Humanitarian Relief",
] as const;

export type DonationFund = (typeof DONATION_FUNDS)[number];

export const DONATION_PAYMENT_METHODS = ["card", "apple_pay", "tithely", "check"] as const;
export type DonationPaymentMethod = (typeof DONATION_PAYMENT_METHODS)[number];

const MIN_DONATION_AMOUNT_USD = 5;
const MAX_DONATION_AMOUNT_USD = 50_000;

/**
 * One-Time Giving + Monthly Covenant Partnership, with an optional claim
 * on the current `BOOKS` monthly special offer (see
 * `src/data/ministry-content.ts`'s `isMonthlySpecialOffer` flag) —
 * fulfillment only sends the book when `frequency !== "one-time"`, since
 * the offer is a partner-retention incentive, not a one-time purchase.
 *
 * Giving is USD-only: `currency` is a literal so every caller and the
 * receipt/API layer can treat it as a constant rather than a variant.
 */
export const donationPartnerSchema = z
  .object({
    currency: z.literal("USD").default("USD"),
    amount: z
      .number()
      .positive("Amount must be greater than zero.")
      .finite(),
    frequency: z.enum(["one-time", "monthly", "annual"]),
    fund: z.enum(DONATION_FUNDS),
    paymentMethod: z.enum(DONATION_PAYMENT_METHODS),
    donorName: sanitizedString(2, 120),
    donorEmail: emailField,
    donorPhone: sanitizedString(0, 30).optional(),
    prayerNote: sanitizedString(0, 1000).optional(),
    claimMonthlyBookOffer: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.amount < MIN_DONATION_AMOUNT_USD) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amount"],
        message: `Minimum gift is $${MIN_DONATION_AMOUNT_USD} USD.`,
      });
    }
    if (data.amount > MAX_DONATION_AMOUNT_USD) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amount"],
        message: `Amount exceeds the $${MAX_DONATION_AMOUNT_USD} USD limit for online giving — please contact the ministry office directly for larger gifts.`,
      });
    }
    if (data.claimMonthlyBookOffer && data.frequency === "one-time") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["claimMonthlyBookOffer"],
        message: "The Monthly Partner Book Offer is reserved for Monthly or Annual partners.",
      });
    }
  });

export type DonationPartnerInput = z.infer<typeof donationPartnerSchema>;

/** @deprecated Use `donationPartnerSchema` — kept as an alias so existing
 *  giving-flow callers keep working unchanged. */
export const donationSchema = donationPartnerSchema;
export type DonationInput = DonationPartnerInput;

// ---------------------------------------------------------------------------
// 2. Book Store Order
// ---------------------------------------------------------------------------

export const bookOrderItemSchema = z.object({
  bookId: z.string().min(1, "Missing book reference."),
  format: z.enum(["Print", "PDF"]),
  quantity: z
    .number()
    .int("Quantity must be a whole number.")
    .min(1, "Quantity must be at least 1.")
    .max(25, "Quantity cannot exceed 25 per item."),
});

export const bookOrderSchema = z
  .object({
    items: z
      .array(bookOrderItemSchema)
      .min(1, "Add at least one book to your order."),
    customerName: sanitizedString(2, 120),
    customerEmail: emailField,
    shippingCity: sanitizedString(1, 120),
    shippingCountry: sanitizedString(1, 120),
  })
  .superRefine((data, ctx) => {
    // Digital-only orders (all PDF) don't need a real shipping address,
    // but we still require city/country so receipts can show a locale.
    const hasPrint = data.items.some((item) => item.format === "Print");
    if (hasPrint && data.shippingCountry.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["shippingCountry"],
        message: "A shipping country is required for print orders.",
      });
    }
  });

export type BookOrderInput = z.infer<typeof bookOrderSchema>;

// ---------------------------------------------------------------------------
// 3. Event RSVP
// ---------------------------------------------------------------------------

export const rsvpSchema = z.object({
  eventId: z.string().min(1, "Missing event reference."),
  fullName: sanitizedString(2, 120),
  email: emailField,
  phone: sanitizedString(5, 30),
  attendanceMode: z.enum(["in-person", "online"]),
  branchAffiliation: sanitizedString(1, 160),
});

export type RsvpInput = z.infer<typeof rsvpSchema>;

// ---------------------------------------------------------------------------
// 4. Contact / Prayer Request
// ---------------------------------------------------------------------------

export const CONTACT_INQUIRY_TYPES = [
  "Prayer Request",
  "Pastoral Counseling",
  "New Believer Discipleship",
  "Join a Ministry Team",
  "General Inquiry",
] as const;

export type ContactInquiryType = (typeof CONTACT_INQUIRY_TYPES)[number];

export const CONTACT_TARGET_OFFICES = [CONTACT_EMAILS.addis, CONTACT_EMAILS.dc] as const;

export const contactPrayerSchema = z.object({
  inquiryType: z.enum(CONTACT_INQUIRY_TYPES),
  targetOffice: z.enum(CONTACT_TARGET_OFFICES),
  fullName: sanitizedString(2, 120),
  email: emailField,
  phone: sanitizedString(5, 30),
  message: sanitizedString(10, 3000),
});

export type ContactPrayerInput = z.infer<typeof contactPrayerSchema>;

// ---------------------------------------------------------------------------
// 5. Global Prayer Army — Prayer Requests
// ---------------------------------------------------------------------------

export const PRAYER_NEED_CATEGORIES = [
  "Healing & Health",
  "Family & Marriage",
  "Provision & Employment",
  "Salvation of a Loved One",
  "Guidance & Decisions",
  "Thanksgiving & Testimony",
  "Other",
] as const;

export type PrayerNeedCategory = (typeof PRAYER_NEED_CATEGORIES)[number];

/**
 * Dedicated schema for the Hero "Prayer Requests" button and the Global
 * Prayer Army modal — deliberately lighter than `contactPrayerSchema`
 * (no office routing) so submitting a prayer need is as frictionless as
 * possible. `isConfidential` keeps a request out of any public prayer
 * wall/testimony feed; `wantsFollowUp` opts the requester into a
 * pastoral phone/email follow-up; `joinPrayerArmy` is a separate opt-in
 * to receive future Global Prayer Army requests to intercede for.
 */
export const prayerRequestSchema = z
  .object({
    fullName: sanitizedString(2, 120),
    email: emailField.optional(),
    phone: sanitizedString(0, 30).optional(),
    category: z.enum(PRAYER_NEED_CATEGORIES),
    prayerRequest: sanitizedString(10, 2000),
    isConfidential: z.boolean().default(true),
    wantsFollowUp: z.boolean().default(false),
    joinPrayerArmy: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    // A contact method is only required when the requester has asked to
    // be followed up with or to join the ongoing Prayer Army — a purely
    // confidential, no-follow-up request may stay anonymous.
    if ((data.wantsFollowUp || data.joinPrayerArmy) && !data.email && !data.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["email"],
        message: "Provide an email or phone number so we can follow up.",
      });
    }
  });

export type PrayerRequestInput = z.infer<typeof prayerRequestSchema>;

// ---------------------------------------------------------------------------
// 6. Email + SMS / WhatsApp / Telegram Signup
// ---------------------------------------------------------------------------

export const SIGNUP_CHANNELS = ["email", "sms", "whatsapp", "telegram"] as const;
export type SignupChannel = (typeof SIGNUP_CHANNELS)[number];

/**
 * bennyhinn.org-style multi-channel signup: email newsletter by default,
 * or a phone-based channel (SMS/WhatsApp/Telegram) for mobile-first
 * Ethiopian subscribers. Exactly one contact method is required,
 * matching whichever `channel` is selected.
 */
export const emailSmsSignupSchema = z
  .object({
    channel: z.enum(SIGNUP_CHANNELS).default("email"),
    firstName: sanitizedString(0, 80).optional(),
    lastName: sanitizedString(0, 80).optional(),
    email: emailField.optional(),
    phone: sanitizedString(0, 30).optional(),
    preferredLanguage: z.enum(["en", "am"]),
    // "Stay Connected to God's Grace" consent checkboxes (bennyhinn.org
    // -style TCPA-conscious signup) — optional opt-ins, except the
    // Privacy Policy acknowledgment, which must be accepted.
    wantsUpdates: z.boolean().optional(),
    agreesInformational: z.boolean().optional(),
    agreesDonationSolicitation: z.boolean().optional(),
    agreesPrivacyPolicy: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.channel === "email" && !data.email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["email"],
        message: "An email address is required for the email channel.",
      });
    }
    if (data.channel !== "email" && !data.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message: "A phone number is required for SMS, WhatsApp, or Telegram.",
      });
    }
    if (data.agreesPrivacyPolicy === false) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["agreesPrivacyPolicy"],
        message: "You must agree to the Privacy Policy to sign up.",
      });
    }
  });

export type EmailSmsSignupInput = z.infer<typeof emailSmsSignupSchema>;

/** @deprecated Use `emailSmsSignupSchema` — kept as an alias so the
 *  existing footer newsletter form keeps working unchanged. */
export const newsletterSchema = emailSmsSignupSchema;
export type NewsletterInput = EmailSmsSignupInput;

// ---------------------------------------------------------------------------
// 7. Ministry Action Cards — Volunteer / Outreach / Prayer / Home Groups
// ---------------------------------------------------------------------------

export const MINISTRY_ACTION_TYPES = ["Volunteer", "Outreach", "Prayer", "Home Groups", "New Believer"] as const;
export type MinistryActionType = (typeof MINISTRY_ACTION_TYPES)[number];

/**
 * Backs the four restored homepage action cards (previously dead `#`
 * links). Each card submits the same shape with a different
 * `actionType`, routed to the matching office by the API handler.
 */
export const ministryActionSchema = z.object({
  actionType: z.enum(MINISTRY_ACTION_TYPES),
  fullName: sanitizedString(2, 120),
  email: emailField,
  phone: sanitizedString(0, 30).optional(),
  city: sanitizedString(0, 120).optional(),
  note: sanitizedString(0, 1000).optional(),
});

export type MinistryActionInput = z.infer<typeof ministryActionSchema>;

/** Team options for the homepage "Volunteer" action card. */
export const VOLUNTEER_TEAMS = ["Choir", "Media & Technical", "Hospitality", "Youth Ministry", "Translation"] as const;
export type VolunteerTeam = (typeof VOLUNTEER_TEAMS)[number];

/** Cities with an active Home Cell Group, for the "Fellowship Groups" action card. */
export const HOME_GROUP_CITIES = [
  "Addis Ababa",
  "Adama",
  "Harar",
  "Dire Dawa",
  "Washington, D.C. / Alexandria, VA",
] as const;
export type HomeGroupCity = (typeof HOME_GROUP_CITIES)[number];

// ---------------------------------------------------------------------------
// 8. Admin Portal — Add New Upcoming Event
// ---------------------------------------------------------------------------

export const EVENT_CATEGORIES = ["Conference", "Revival", "Leadership", "Youth & Worship"] as const;

export const newEventSchema = z.object({
  titleEn: sanitizedString(2, 160),
  titleAm: sanitizedString(2, 160),
  dateRangeEn: sanitizedString(2, 120),
  dateRangeAm: sanitizedString(2, 120),
  locationEn: sanitizedString(2, 160),
  locationAm: sanitizedString(2, 160),
  category: z.enum(EVENT_CATEGORIES),
  descriptionEn: sanitizedString(10, 600),
  descriptionAm: sanitizedString(10, 600),
  isLiveStreamed: z.boolean().default(false),
});

export type NewEventInput = z.infer<typeof newEventSchema>;

// ---------------------------------------------------------------------------
// 9. Admin Portal — Add / Sync YouTube Sermons
// ---------------------------------------------------------------------------

export const SERMON_TOPICS = [
  "Christian Growth",
  "Holy Spirit",
  "Hearing God's Voice",
  "Revival & Repentance",
  "Prophetic Archive",
  "Discipleship",
  "New Upload",
] as const;

/** Admin-portal "add a sermon by URL/ID" form. Everything but the
 *  video reference is optional — `/api/sermons` fills in a missing
 *  title/speaker from YouTube's own oEmbed endpoint (a sanctioned,
 *  key-free metadata lookup, not scraping) rather than requiring the
 *  office to retype it. */
export const newSermonSchema = z.object({
  youtubeUrlOrId: sanitizedString(5, 300),
  titleEn: sanitizedString(0, 200).optional(),
  titleAm: sanitizedString(0, 200).optional(),
  speakerEn: sanitizedString(0, 120).optional(),
  speakerAm: sanitizedString(0, 120).optional(),
  topic: z.enum(SERMON_TOPICS).default("New Upload"),
  /** Which of the two official channels this manually-added video
   *  belongs to — defaults to DC, the primary North American channel. */
  channelSource: z.enum(["DC", "ETHIOPIA"]).default("DC"),
  yearLabel: sanitizedString(0, 20).optional(),
  summaryEn: sanitizedString(0, 600).optional(),
  summaryAm: sanitizedString(0, 600).optional(),
});

export type NewSermonInput = z.infer<typeof newSermonSchema>;

/** Admin-portal "Edit"/"Feature" on an existing sermon catalog row. */
export const updateSermonSchema = z.object({
  id: z.string().min(1, "Missing sermon id."),
  titleEn: sanitizedString(0, 200).optional(),
  titleAm: sanitizedString(0, 200).optional(),
  speakerEn: sanitizedString(0, 120).optional(),
  speakerAm: sanitizedString(0, 120).optional(),
  topic: z.enum(SERMON_TOPICS).optional(),
  channelSource: z.enum(["DC", "ETHIOPIA"]).optional(),
  yearLabel: sanitizedString(0, 20).optional(),
  scriptureEn: sanitizedString(0, 160).optional(),
  scriptureAm: sanitizedString(0, 160).optional(),
  summaryEn: sanitizedString(0, 600).optional(),
  summaryAm: sanitizedString(0, 600).optional(),
  featured: z.boolean().optional(),
});
export type UpdateSermonInput = z.infer<typeof updateSermonSchema>;

// ---------------------------------------------------------------------------
// 10. Admin Portal — Full Book Catalog Management (Add / Edit / Delete)
// ---------------------------------------------------------------------------

/** A book cover is either a same-origin upload path (`/uploads/...`),
 *  a `data:` URI fallback from `/api/upload`, or an admin-pasted
 *  external image URL — accept any non-empty string rather than a
 *  strict URL format so all three pass. */
const coverImageUrlField = z.string().trim().max(8_000_000).optional();

export const newBookSchema = z.object({
  titleEn: sanitizedString(2, 200),
  titleAm: sanitizedString(0, 200).optional(),
  authorEn: sanitizedString(0, 120).optional(),
  authorAm: sanitizedString(0, 120).optional(),
  coverImageUrl: coverImageUrlField,
  priceUsdPrint: z.number().positive().finite(),
  priceUsdPdf: z.number().positive().finite(),
  pages: z.number().int().positive().optional(),
  isbn: sanitizedString(0, 40).optional(),
  synopsisEn: sanitizedString(10, 4000),
  synopsisAm: sanitizedString(0, 4000).optional(),
  topics: z.array(sanitizedString(1, 60)).max(12).optional(),
  isMonthlySpecialOffer: z.boolean().optional(),
  inStock: z.boolean().optional(),
});

export type NewBookInput = z.infer<typeof newBookSchema>;

export const updateBookFullSchema = newBookSchema.partial().extend({
  id: z.string().min(1, "Missing book id."),
});

export type UpdateBookFullInput = z.infer<typeof updateBookFullSchema>;

// ---------------------------------------------------------------------------
// 11. Admin Portal — Daily Scripture Devotionals (Add / Edit / Feature / Delete)
// ---------------------------------------------------------------------------

const devotionalFieldsSchema = z.object({
  dateLabel: sanitizedString(1, 120),
  titleEn: sanitizedString(0, 200).optional(),
  titleAm: sanitizedString(0, 200).optional(),
  scriptureRefEn: sanitizedString(1, 160),
  scriptureRefAm: sanitizedString(0, 160).optional(),
  verseTextEn: sanitizedString(1, 3000),
  verseTextAm: sanitizedString(0, 3000).optional(),
  reflectionEn: sanitizedString(1, 4000),
  reflectionAm: sanitizedString(0, 4000).optional(),
  prayerDeclarationEn: sanitizedString(1, 1200),
  prayerDeclarationAm: sanitizedString(0, 1200).optional(),
  authorEn: sanitizedString(0, 120).optional(),
  authorAm: sanitizedString(0, 120).optional(),
  // No `.default()` here deliberately: `updateDevotionalSchema` below
  // reuses this via `.partial()`, and a default would make an omitted
  // field in a PUT request silently resolve to `false`, clobbering an
  // existing `isFeaturedToday: true` on a text-only edit. Each route
  // coerces `undefined` to the right value itself instead.
  isFeaturedToday: z.boolean().optional(),
});

export const newDevotionalSchema = devotionalFieldsSchema;
export type NewDevotionalInput = z.infer<typeof newDevotionalSchema>;

export const updateDevotionalSchema = devotionalFieldsSchema.partial().extend({
  id: z.string().min(1, "Missing devotional id."),
});
export type UpdateDevotionalInput = z.infer<typeof updateDevotionalSchema>;

// ---------------------------------------------------------------------------
// 12. Admin Portal — Branch Directory (Add / Edit / Delete)
// ---------------------------------------------------------------------------

export const SYNOD_REGIONS = ["Addis Ababa", "East Showa", "Eastern Ethiopia", "USA"] as const;
export const BRANCH_TYPES = [
  "Headquarters Church",
  "Synod Center",
  "Branch Church",
  "Outreach Station",
  "Outreach Stations",
  "North America Branch",
] as const;

const locationFieldsSchema = z.object({
  synod: z.enum(SYNOD_REGIONS),
  nameEn: sanitizedString(2, 160),
  nameAm: sanitizedString(0, 160).optional(),
  city: sanitizedString(1, 120),
  type: z.enum(BRANCH_TYPES),
  detailsEn: sanitizedString(0, 600).optional(),
  detailsAm: sanitizedString(0, 600).optional(),
  address: sanitizedString(1, 240),
  phone: sanitizedString(1, 40),
  email: emailField,
  serviceTimesEn: sanitizedString(1, 300),
  serviceTimesAm: sanitizedString(0, 300).optional(),
});

export const newLocationSchema = locationFieldsSchema;
export type NewLocationInput = z.infer<typeof newLocationSchema>;

export const updateLocationSchema = locationFieldsSchema.partial().extend({
  id: z.string().min(1, "Missing branch id."),
});
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;

// ---------------------------------------------------------------------------
// 13. Admin Portal — Manual / Offline Gift Entry & Donation Status
// ---------------------------------------------------------------------------

export const manualDonationSchema = z.object({
  donorName: sanitizedString(2, 120),
  donorEmail: emailField,
  amountUsd: z.number().positive().finite(),
  frequency: z.enum(["one-time", "monthly", "annual"]),
  fund: z.enum(DONATION_FUNDS),
  paymentMethod: z.enum(DONATION_PAYMENT_METHODS),
  prayerNote: sanitizedString(0, 1000).optional(),
});
export type ManualDonationInput = z.infer<typeof manualDonationSchema>;

export const updateDonationStatusSchema = z.object({
  id: z.string().min(1, "Missing donation id."),
  status: z.enum(["pending", "completed"]),
});
export type UpdateDonationStatusInput = z.infer<typeof updateDonationStatusSchema>;

export const updateBookOrderFulfillmentSchema = z.object({
  id: z.string().min(1, "Missing order id."),
  fulfillmentStatus: z.enum(["pending", "shipped", "completed"]),
});
export type UpdateBookOrderFulfillmentInput = z.infer<typeof updateBookOrderFulfillmentSchema>;

// ---------------------------------------------------------------------------
// 14. Admin Portal — Recent Updates & Highlights (Homepage Section 3)
// ---------------------------------------------------------------------------

export const NEWS_HIGHLIGHT_CATEGORIES = [
  "Washington, D.C. Sanctuary",
  "Revival & Crusade Report",
  "Ethiopian Synod Update",
  "Special Announcement",
  "Testimony & Baptism",
] as const;

const newsHighlightFieldsSchema = z.object({
  titleEn: sanitizedString(2, 200),
  titleAm: sanitizedString(0, 200).optional(),
  category: z.enum(NEWS_HIGHLIGHT_CATEGORIES),
  summaryEn: sanitizedString(10, 600),
  summaryAm: sanitizedString(0, 600).optional(),
  contentEn: sanitizedParagraphs(10, 8000),
  contentAm: sanitizedParagraphs(0, 8000).optional(),
  // Same reasoning as `coverImageUrlField` in section 10 — an admin
  // upload path, a `data:` URI fallback, or a pasted external URL.
  imageUrl: z.string().trim().min(1, "A cover photo (upload or URL) is required.").max(8_000_000),
  videoUrl: sanitizedString(0, 300).optional(),
  locationLabel: sanitizedString(1, 160),
  publishedDateLabel: sanitizedString(1, 120),
  // No `.default()` here, same reasoning as `isFeaturedToday` in
  // section 11 — `updateNewsHighlightSchema` reuses this via
  // `.partial()`, and a default would make an omitted field in a PUT
  // request silently resolve to `false`, unpinning the lead story on a
  // text-only edit.
  isPinnedLeadStory: z.boolean().optional(),
});

export const newNewsHighlightSchema = newsHighlightFieldsSchema;
export type NewNewsHighlightInput = z.infer<typeof newNewsHighlightSchema>;

export const updateNewsHighlightSchema = newsHighlightFieldsSchema.partial().extend({
  id: z.string().min(1, "Missing update id."),
});
export type UpdateNewsHighlightInput = z.infer<typeof updateNewsHighlightSchema>;

// ---------------------------------------------------------------------------
// 15. Admin Portal — Site Settings (Hero Banner) & Impact Stats
// ---------------------------------------------------------------------------

export const updateSiteSettingsSchema = z.object({
  heroAnnouncementTitle: sanitizedString(0, 200).optional(),
  heroAnnouncementSubtitle: sanitizedString(0, 300).optional(),
  heroFeaturedVideoId: sanitizedString(0, 100).optional(),
});
export type UpdateSiteSettingsInput = z.infer<typeof updateSiteSettingsSchema>;

export const updateImpactStatSchema = z.object({
  id: z.string().min(1, "Missing impact stat id."),
  value: sanitizedString(1, 20).optional(),
  labelEn: sanitizedString(1, 120).optional(),
  labelAm: sanitizedString(0, 120).optional(),
  detailEn: sanitizedString(0, 200).optional(),
  detailAm: sanitizedString(0, 200).optional(),
});
export type UpdateImpactStatInput = z.infer<typeof updateImpactStatSchema>;
