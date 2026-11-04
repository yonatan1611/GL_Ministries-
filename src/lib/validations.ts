import { z } from "zod";
import { sanitizeText } from "@/lib/security/sanitize";
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
