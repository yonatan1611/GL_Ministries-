import { NextResponse } from "next/server";
import { rateLimitGuard, serverErrorResponse } from "@/lib/api/guards";
import { RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { findBibleBookByNameEn, findBibleBookByNumber, findMinistryVerse } from "@/data/bible-books";
import { lookupAmharicVerse } from "@/lib/amharicBible";

/**
 * Admin Portal "✨ Auto-Fetch Scripture Verse" lookup.
 *
 * English works for any of the 66 books, live:
 *  1. `bible-api.com` (primary) — a free, key-free public-domain verse
 *     API that covers the full Bible in KJV/WEB/ASV. It does NOT serve
 *     NLT (verified: returns 404 for `?translation=nlt`), so NLT skips
 *     straight to source 2.
 *  2. `bolls.life`'s `get-chapter` endpoint (fallback, and primary for
 *     NLT) — covers the full Bible in the same translations plus NLT,
 *     keyed by the standard 1–66 book number instead of a book-name
 *     string. Its KJV text embeds Strong's-number tags (`<S>1722</S>`)
 *     inline, which `stripHtml` below drops tag-and-contents so a
 *     fallback fetch never leaks raw numbers into the verse text.
 *
 * Amharic has no free, key-free *live* API (verified directly against
 * bolls.life's own translation codes — "AMH"/"ETH" both come back an
 * empty chapter — and getbible.net: none serve Amharic). So Amharic
 * text here comes from two offline sources, in order:
 *  1. The hand-curated, individually-verified `POPULAR_MINISTRY_VERSES`
 *     bank in `src/data/bible-books.ts` — ~90 verses the office
 *     reaches for most, each checked against a named source.
 *  2. The bundled full 66-book Amharic Bible (`src/lib/amharicBible.ts`)
 *     — covers every other reference offline and instantly. A small,
 *     scattered fraction of its verses are blank in the source dataset
 *     itself (see that file's header); for those, `verseTextAm` comes
 *     back `null` and `amharicAvailable: false` — never a fabricated or
 *     silently-empty string — so the Admin Portal UI can tell the
 *     office honestly that this one needs to be typed or pasted in by
 *     hand.
 *
 * The curated bank's Amharic text is tied to the *verse*, not to a
 * specific English translation, so it's reused regardless of which
 * `translation` the admin picked — only the English side is re-fetched
 * live in that translation when it isn't KJV (the curated bank's own
 * English is KJV-sourced).
 */

const ENGLISH_TRANSLATIONS = ["KJV", "WEB", "ASV", "NLT"] as const;
type EnglishTranslation = (typeof ENGLISH_TRANSLATIONS)[number];

/** bible-api.com doesn't serve this translation — skip it and go
 *  straight to the bolls.life fallback. */
const BIBLE_API_COM_UNSUPPORTED: readonly EnglishTranslation[] = ["NLT"];

function isEnglishTranslation(value: string): value is EnglishTranslation {
  return (ENGLISH_TRANSLATIONS as readonly string[]).includes(value);
}

function stripHtml(input: string): string {
  return input
    .replace(/<S>[^<]*<\/S>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

interface BibleApiComResponse {
  text?: string;
  error?: string;
}

/** Primary English source — covers all 66 books, no API key needed. */
async function fetchEnglishFromBibleApiCom(
  bookNameEn: string,
  chapter: number,
  verseStart: number,
  verseEnd: number | undefined,
  translation: EnglishTranslation
): Promise<string | null> {
  try {
    const verseRange = verseEnd ? `${verseStart}-${verseEnd}` : String(verseStart);
    const reference = `${bookNameEn} ${chapter}:${verseRange}`;
    const url = `https://bible-api.com/${encodeURIComponent(reference)}?translation=${translation.toLowerCase()}`;
    const response = await fetch(url, { next: { revalidate: 86400 } });
    if (!response.ok) return null;
    const data = (await response.json()) as BibleApiComResponse;
    if (!data.text) return null;
    return stripHtml(data.text);
  } catch {
    return null;
  }
}

interface BollsVerse {
  verse: number;
  text: string;
}

/** Fallback English source, keyed by the standard 1–66 book number
 *  instead of a book-name string — covers the full Bible in the same
 *  translations bible-api.com offers. */
async function fetchEnglishFromBolls(
  bookNumber: number,
  chapter: number,
  verseStart: number,
  verseEnd: number | undefined,
  translation: EnglishTranslation
): Promise<string | null> {
  try {
    const url = `https://bolls.life/get-chapter/${translation}/${bookNumber}/${chapter}/`;
    const response = await fetch(url, { next: { revalidate: 86400 } });
    if (!response.ok) return null;
    const verses = (await response.json()) as BollsVerse[];
    if (!Array.isArray(verses)) return null;
    const end = verseEnd ?? verseStart;
    const matched = verses.filter((v) => v.verse >= verseStart && v.verse <= end);
    if (matched.length === 0) return null;
    return matched.map((v) => stripHtml(v.text)).join(" ");
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const limited = rateLimitGuard(request, "bible-lookup", RATE_LIMIT_PRESETS.liveCounters);
  if (limited) return limited;

  try {
    const url = new URL(request.url);
    const params = url.searchParams;

    const chapter = Number(params.get("chapter"));
    const verseStart = Number(params.get("verseStart"));
    const verseEndRaw = params.get("verseEnd");
    const verseEnd = verseEndRaw ? Number(verseEndRaw) : undefined;
    const translationRaw = (params.get("translationEn") ?? "KJV").toUpperCase();
    const translation: EnglishTranslation = isEnglishTranslation(translationRaw) ? translationRaw : "KJV";

    const bookNumberParam = params.get("bookNumber");
    const bookNameEnParam = params.get("bookNameEn");
    const book = bookNumberParam
      ? findBibleBookByNumber(Number(bookNumberParam))
      : bookNameEnParam
        ? findBibleBookByNameEn(bookNameEnParam)
        : undefined;

    if (!book) {
      return NextResponse.json({ success: false, error: "Unknown Bible book." }, { status: 400 });
    }
    if (!Number.isFinite(chapter) || chapter < 1 || chapter > book.chapters) {
      return NextResponse.json({ success: false, error: "Invalid chapter number." }, { status: 400 });
    }
    if (!Number.isFinite(verseStart) || verseStart < 1) {
      return NextResponse.json({ success: false, error: "Invalid verse number." }, { status: 400 });
    }

    const verseRangeLabel = verseEnd ? `${verseStart}–${verseEnd}` : String(verseStart);
    const verseRangeLabelAm = verseEnd ? `${verseStart}-${verseEnd}` : String(verseStart);
    const scriptureRefEn = `${book.nameEn} ${chapter}:${verseRangeLabel} (${translation})`;
    const scriptureRefAm = `${book.nameAm} ${chapter}፡${verseRangeLabelAm}`;

    // 1. Curated bank first — instant, and the only source for Amharic.
    // Its Amharic text is reused no matter which translation was
    // requested; only the English side is re-fetched live when the
    // admin picked something other than KJV (what the bank itself is
    // sourced from), so switching to NLT/WEB/ASV never silently shows
    // mismatched KJV wording labeled as something else.
    const curated = findMinistryVerse(book.bookNumber, chapter, verseStart, verseEnd);
    if (curated) {
      if (translation === "KJV") {
        return NextResponse.json(
          {
            success: true,
            message: "Verse found in the curated ministry bank.",
            data: {
              scriptureRefEn: curated.scriptureRefEn,
              scriptureRefAm: curated.scriptureRefAm,
              verseTextEn: curated.verseTextEn,
              verseTextAm: curated.verseTextAm,
              amharicAvailable: true,
              source: "curated",
            },
          },
          { status: 200 }
        );
      }

      const liveEnglish = BIBLE_API_COM_UNSUPPORTED.includes(translation)
        ? await fetchEnglishFromBolls(book.bookNumber, chapter, verseStart, verseEnd, translation)
        : (await fetchEnglishFromBibleApiCom(book.nameEn, chapter, verseStart, verseEnd, translation)) ??
          (await fetchEnglishFromBolls(book.bookNumber, chapter, verseStart, verseEnd, translation));

      return NextResponse.json(
        {
          success: true,
          message: liveEnglish
            ? "English fetched live in your chosen translation; Amharic reused from the curated ministry bank."
            : `Couldn't fetch ${translation} for this verse, so showing the curated KJV wording instead. Amharic is from the curated ministry bank.`,
          data: {
            scriptureRefEn: liveEnglish ? scriptureRefEn : curated.scriptureRefEn,
            scriptureRefAm: curated.scriptureRefAm,
            verseTextEn: liveEnglish ?? curated.verseTextEn,
            verseTextAm: curated.verseTextAm,
            amharicAvailable: true,
            source: liveEnglish ? "live-en+curated-am" : "curated",
          },
        },
        { status: 200 }
      );
    }

    // 2. Live English fetch — covers any of the 66 books.
    const verseTextEn = BIBLE_API_COM_UNSUPPORTED.includes(translation)
      ? await fetchEnglishFromBolls(book.bookNumber, chapter, verseStart, verseEnd, translation)
      : (await fetchEnglishFromBibleApiCom(book.nameEn, chapter, verseStart, verseEnd, translation)) ??
        (await fetchEnglishFromBolls(book.bookNumber, chapter, verseStart, verseEnd, translation));

    if (!verseTextEn) {
      return NextResponse.json(
        { success: false, error: "Couldn't find that verse. Double-check the book, chapter, and verse number." },
        { status: 404 }
      );
    }

    // 3. Bundled full Amharic Bible — covers every reference outside the
    // curated bank. `null` only for the dataset's own scattered blank
    // verses (see src/lib/amharicBible.ts) — never a fabricated or
    // silently blank value.
    const verseTextAm = lookupAmharicVerse(book.bookNumber, chapter, verseStart, verseEnd);

    return NextResponse.json(
      {
        success: true,
        message: verseTextAm
          ? "Verse found."
          : "Verse found. Amharic text isn't available for this reference — please type or paste it manually.",
        data: {
          scriptureRefEn,
          scriptureRefAm,
          verseTextEn,
          verseTextAm,
          amharicAvailable: Boolean(verseTextAm),
          source: verseTextAm ? "live-en+local-bible-am" : "live",
        },
      },
      { status: 200 }
    );
  } catch {
    return serverErrorResponse();
  }
}
