import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/data/i18n";
import { isSupportedLocale, type Locale } from "@/lib/utils";
import type { LocalePageProps } from "@/types/ministry";
import { hasAdminSession } from "@/lib/adminAuth";
import { AdminPortalClient } from "@/components/admin/AdminPortalClient";

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale } = await params;
  const loc: Locale = isSupportedLocale(locale) ? locale : "en";
  const dict = getDictionary(loc);
  return {
    title: dict.admin.pageTitle,
    robots: { index: false, follow: false },
  };
}

/**
 * Passcode-protected Ministry Admin Portal. Auth is checked here too
 * (not just client-side) so an already-signed-in staff member lands
 * straight on the dashboard instead of a login-form flash.
 */
export default async function AdminPage({ params }: LocalePageProps) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();

  const isAuthenticated = await hasAdminSession();

  return <AdminPortalClient locale={locale} initialAuthenticated={isAuthenticated} />;
}
