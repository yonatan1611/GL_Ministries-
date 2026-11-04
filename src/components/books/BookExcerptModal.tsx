"use client";

import { getDictionary } from "@/data/i18n";
import type { Locale } from "@/lib/utils";
import type { Book } from "@/types/ministry";
import { Modal } from "@/components/ui/Modal";

interface BookExcerptModalProps {
  locale: Locale;
  book: Book | null;
  onClose: () => void;
}

/**
 * Reader preview: full synopsis plus a key-themes outline built from
 * the book's own topic tags — a study preview without inventing
 * chapter-by-chapter content the ministry hasn't published here.
 */
export function BookExcerptModal({ locale, book, onClose }: BookExcerptModalProps) {
  const dict = getDictionary(locale);
  if (!book) return null;

  const title = locale === "am" ? book.titleAm : book.titleEn;
  const synopsis = locale === "am" ? book.synopsisAm : book.synopsisEn;
  const author = locale === "am" ? book.authorAm : book.authorEn;

  return (
    <Modal isOpen={Boolean(book)} onClose={onClose} title={title} closeLabel={dict.buttons.close}>
      <div className="flex flex-col gap-4 text-sm text-slate-700">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{author}</p>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {dict.booksPage.aboutBookLabel}
          </p>
          <p className="mt-1 leading-relaxed">{synopsis}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {dict.booksPage.keyThemesLabel}
          </p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {book.topics.map((topic) => (
              <li key={topic} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" aria-hidden="true" />
                {topic}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-slate-400">
          {book.pages} {dict.booksPage.pagesLabel} · {dict.booksPage.isbnLabel} {book.isbn}
        </p>
      </div>
    </Modal>
  );
}
