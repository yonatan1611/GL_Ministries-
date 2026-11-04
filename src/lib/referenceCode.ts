/** Generates a human-readable reference code (e.g. `GLM-2026-7K2QF9`) for
 *  receipts and confirmations across the giving, book order, RSVP, and
 *  contact API routes. Not a security token — just a support-lookup id. */
export function generateReferenceCode(prefix: string): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${year}-${random}`;
}
