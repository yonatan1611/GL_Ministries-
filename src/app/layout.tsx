import type { ReactNode } from "react";

/**
 * Root layout. Deliberately does not render <html>/<body> — the locale
 * segment layout (`src/app/[locale]/layout.tsx`) owns that, since it's
 * the only place the active locale (and therefore `lang`/font variables)
 * is known. This mirrors the standard Next.js App Router i18n pattern.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
