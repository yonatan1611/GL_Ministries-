import amharicBibleRaw from "@/data/amharic-bible.json";

/**
 * Full 66-book Amharic Bible, bundled locally (`src/data/amharic-bible.json`,
 * ~5.7MB) so `/api/bible-lookup` never depends on a live Amharic API — none
 * of the free, key-free Bible APIs checked when that route was first built
 * serve Amharic at all (see the file-header note there). Source:
 * https://github.com/magna25/amharic-bible-json, statically imported so the
 * bundler ships it with the function — no runtime file-tracing to get wrong.
 *
 * `books` is in standard 1–66 canon order, 0-indexed, matching
 * `BibleBook.bookNumber - 1` in `src/data/bible-books.ts` exactly (verified
 * book-by-book against both title and chapter count before wiring this in).
 *
 * The dataset isn't perfect: ~480 of its ~30,750 verses (~1.5%) are blank —
 * scattered digitization gaps, not the handful of verses modern textual
 * criticism omits. `lookupAmharicVerse` returns `null` for those (and for
 * anything out of range) rather than ever returning a partial or fabricated
 * string for a multi-verse range.
 */
interface AmharicChapter {
  chapter: string;
  title: string;
  verses: string[];
}

interface AmharicBookEntry {
  title: string;
  abbv: string;
  chapters: AmharicChapter[];
}

interface AmharicBibleFile {
  title: string;
  books: AmharicBookEntry[];
}

const amharicBible = amharicBibleRaw as AmharicBibleFile;

/** Looks up Amharic text for a verse or verse range from the bundled full
 *  Bible. Returns `null` if the book/chapter doesn't exist, or if any verse
 *  in the requested range is one of the dataset's known blank gaps. */
export function lookupAmharicVerse(
  bookNumber: number,
  chapter: number,
  verseStart: number,
  verseEnd?: number
): string | null {
  const book = amharicBible.books[bookNumber - 1];
  if (!book) return null;

  const chapterEntry = book.chapters.find((c) => Number(c.chapter) === chapter);
  if (!chapterEntry) return null;

  const end = verseEnd ?? verseStart;
  const verses: string[] = [];
  for (let verse = verseStart; verse <= end; verse++) {
    const text = chapterEntry.verses[verse - 1]?.trim();
    if (!text) return null;
    verses.push(text);
  }
  return verses.join(" ");
}
