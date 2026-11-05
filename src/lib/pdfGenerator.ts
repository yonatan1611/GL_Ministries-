import { promises as fs } from "node:fs";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import type { Book } from "@/types/ministry";
import type { BookOrderItem } from "@/lib/db";

const NAVY = rgb(0.059, 0.09, 0.165);
const AMBER = rgb(0.78, 0.447, 0.024);
const SLATE = rgb(0.4, 0.447, 0.506);
const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 56;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const ETHIOPIC_FONTS_DIR = path.join(
  process.cwd(),
  "node_modules",
  "@fontsource",
  "noto-sans-ethiopic",
  "files"
);

async function loadEthiopicFontBytes(weight: "400" | "700"): Promise<Buffer> {
  const file = path.join(ETHIOPIC_FONTS_DIR, `noto-sans-ethiopic-ethiopic-${weight}-normal.woff`);
  return fs.readFile(file);
}

/** Greedy word-wrap using the font's actual glyph metrics — pdf-lib
 *  never wraps text on its own. */
function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

interface DrawCursor {
  y: number;
}

function drawParagraph(
  page: PDFPage,
  cursor: DrawCursor,
  text: string,
  font: PDFFont,
  size: number,
  color = NAVY,
  lineHeight = size * 1.5
): void {
  for (const line of wrapText(text, font, size, CONTENT_WIDTH)) {
    cursor.y -= lineHeight;
    page.drawText(line, { x: MARGIN, y: cursor.y, size, font, color });
  }
}

const ETHIOPIC_BLOCK = /[ሀ-᎟]/;

/**
 * The Ethiopic-script embedded font only carries glyphs for the
 * Ethiopic Unicode block — it has no Latin digits or punctuation. Our
 * Amharic strings sometimes mix in Latin tokens as separate
 * space-delimited words (e.g. "ክፍል 1", "ከ20 ዓመት"), so each word must
 * pick its own font or those glyphs render as missing-glyph boxes.
 * Wraps and draws a line at a time, left-to-right, mixing fonts per
 * word as needed.
 */
function drawMixedScriptParagraph(
  page: PDFPage,
  cursor: DrawCursor,
  text: string,
  size: number,
  ethiopicFont: PDFFont,
  latinFont: PDFFont,
  color = NAVY,
  lineHeight = size * 1.5
): void {
  const spaceWidth = latinFont.widthOfTextAtSize(" ", size);
  const words = text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const font = ETHIOPIC_BLOCK.test(word) ? ethiopicFont : latinFont;
      return { text: word, font, width: font.widthOfTextAtSize(word, size) };
    });

  const lines: (typeof words)[] = [];
  let current: typeof words = [];
  let currentWidth = 0;
  for (const word of words) {
    const addedWidth = (current.length > 0 ? spaceWidth : 0) + word.width;
    if (current.length === 0 || currentWidth + addedWidth <= CONTENT_WIDTH) {
      current.push(word);
      currentWidth += addedWidth;
    } else {
      lines.push(current);
      current = [word];
      currentWidth = word.width;
    }
  }
  if (current.length > 0) lines.push(current);

  for (const line of lines) {
    cursor.y -= lineHeight;
    let x = MARGIN;
    for (const word of line) {
      page.drawText(word.text, { x, y: cursor.y, size, font: word.font, color });
      x += word.width + spaceWidth;
    }
  }
}

export interface BookPdfContext {
  book: Book;
  item: Pick<BookOrderItem, "quantity" | "format">;
  orderNumber: string;
  purchaserName: string;
  purchasedAt: string;
}

/**
 * Generates a real, formatted bilingual (EN/AM) digital certificate for
 * a purchased eBook — title, author, synopsis, and order details, with
 * Amharic rendered in actual Ethiopic glyphs (Noto Sans Ethiopic,
 * embedded from `@fontsource/noto-sans-ethiopic` via fontkit).
 *
 * This is an order confirmation / digital certificate, not the book's
 * full manuscript — we don't hold the actual publisher files for
 * Apostle Daniel Makonnen's titles, so generating invented "book
 * content" under his name would misrepresent authored work that isn't
 * ours to fabricate. The honest, useful artifact is a real, working,
 * properly authorized download: this certificate plus GLM Press's
 * follow-up email fulfillment of the actual file.
 */
export async function generateBookCertificatePdf(ctx: BookPdfContext): Promise<Uint8Array> {
  const { book, item, orderNumber, purchaserName, purchasedAt } = ctx;

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  pdfDoc.setTitle(`${book.titleEn} — Gospel Light Ministries International`);
  pdfDoc.setAuthor(book.authorEn);
  pdfDoc.setSubject("GLM Press Digital Edition Certificate");

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const [ethiopicRegularBytes, ethiopicBoldBytes] = await Promise.all([
    loadEthiopicFontBytes("400"),
    loadEthiopicFontBytes("700"),
  ]);
  const ethiopicRegular = await pdfDoc.embedFont(ethiopicRegularBytes, { subset: true });
  const ethiopicBold = await pdfDoc.embedFont(ethiopicBoldBytes, { subset: true });

  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const cursor: DrawCursor = { y: PAGE_HEIGHT - MARGIN };

  // First line only: draw directly at the starting cursor position (top
  // margin). Every element after this uses the decrement-then-draw
  // convention shared with drawParagraph/drawMixedScriptParagraph, so
  // cursor.y always means "baseline of the last thing drawn."
  page.drawText("GOSPEL LIGHT MINISTRIES INTERNATIONAL", {
    x: MARGIN,
    y: cursor.y,
    size: 11,
    font: helveticaBold,
    color: NAVY,
  });

  function drawLine(text: string, font: PDFFont, size: number, color = NAVY, gap = size * 1.4): void {
    cursor.y -= gap;
    page.drawText(text, { x: MARGIN, y: cursor.y, size, font, color });
  }

  drawLine("GLM PRESS — DIGITAL EDITION CERTIFICATE", helveticaBold, 9, AMBER, 16);

  cursor.y -= 10;
  page.drawLine({
    start: { x: MARGIN, y: cursor.y },
    end: { x: PAGE_WIDTH - MARGIN, y: cursor.y },
    thickness: 1,
    color: AMBER,
  });

  cursor.y -= 10;
  drawParagraph(page, cursor, book.titleEn, helveticaBold, 20, NAVY, 24);
  drawMixedScriptParagraph(page, cursor, book.titleAm, 15, ethiopicBold, helveticaBold, NAVY, 20);

  drawLine(`by ${book.authorEn}`, helveticaOblique, 11, SLATE, 22);
  drawMixedScriptParagraph(page, cursor, book.authorAm, 11, ethiopicRegular, helvetica, SLATE, 16);

  cursor.y -= 18;
  page.drawLine({
    start: { x: MARGIN, y: cursor.y },
    end: { x: PAGE_WIDTH - MARGIN, y: cursor.y },
    thickness: 0.5,
    color: rgb(0.85, 0.85, 0.85),
  });

  drawLine("About This Title", helveticaBold, 12, NAVY, 26);
  drawParagraph(page, cursor, book.synopsisEn, helvetica, 10.5, NAVY);

  cursor.y -= 6;
  drawMixedScriptParagraph(page, cursor, `ርዕስ፦ ${book.titleAm}`, 11, ethiopicBold, helveticaBold, NAVY, 20);
  drawMixedScriptParagraph(page, cursor, book.synopsisAm, 10.5, ethiopicRegular, helvetica, NAVY);

  drawLine(`Topics: ${book.topics.join(" · ")}`, helveticaOblique, 9.5, SLATE, 18);

  cursor.y -= 30;
  page.drawRectangle({
    x: MARGIN,
    y: cursor.y - 86,
    width: CONTENT_WIDTH,
    height: 86,
    color: rgb(0.973, 0.961, 0.929),
    borderColor: AMBER,
    borderWidth: 1,
  });
  const boxTextX = MARGIN + 14;
  let boxY = cursor.y - 18;
  page.drawText("ORDER DETAILS", { x: boxTextX, y: boxY, size: 9, font: helveticaBold, color: AMBER });
  boxY -= 16;
  page.drawText(`Order Number: ${orderNumber}`, { x: boxTextX, y: boxY, size: 10, font: helvetica, color: NAVY });
  boxY -= 14;
  page.drawText(`Purchased By: ${purchaserName}`, { x: boxTextX, y: boxY, size: 10, font: helvetica, color: NAVY });
  boxY -= 14;
  page.drawText(
    `Format: Digital PDF · Quantity: ${item.quantity} · ISBN ${book.isbn} · ${book.pages} pages`,
    { x: boxTextX, y: boxY, size: 10, font: helvetica, color: NAVY }
  );
  boxY -= 14;
  page.drawText(`Date: ${new Date(purchasedAt).toLocaleDateString("en-US")}`, {
    x: boxTextX,
    y: boxY,
    size: 10,
    font: helvetica,
    color: NAVY,
  });

  cursor.y -= 100;
  drawParagraph(
    page,
    cursor,
    "This certificate confirms your paid digital order. GLM Press will email the complete book file to the address on your order within one business day of purchase.",
    helveticaOblique,
    9,
    SLATE
  );

  page.drawText("Gospel Light Ministries International · glministries.org", {
    x: MARGIN,
    y: MARGIN - 10,
    size: 8,
    font: helvetica,
    color: SLATE,
  });
  page.drawText("85 South Bragg St, Suite 200, Alexandria, VA 22312", {
    x: MARGIN,
    y: MARGIN - 22,
    size: 8,
    font: helvetica,
    color: SLATE,
  });

  return pdfDoc.save();
}
