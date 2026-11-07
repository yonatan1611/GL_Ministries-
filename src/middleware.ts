import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, isSupportedLocale } from "@/lib/utils";

/**
 * Legacy WordPress `?page_id=` -> clean semantic route map.
 *
 * The legacy site (glministries.org) served every page off `/` with a
 * raw database query string. Search engines and years of shared links
 * point at these URLs, so they get permanent (301) redirects rather than
 * silently 404ing — that preserves inbound SEO equity and keeps old
 * bookmarks/links working indefinitely.
 */
const LEGACY_PAGE_ID_REDIRECTS: Record<string, string> = {
  "28263": "/en/about#overview", // Legacy About Us
  "28322": "/en/about#vision", // Legacy Vision (100% duplicate of About Us)
  "28318": "/en/about#history", // Legacy History
  "28320": "/en/about#apostle-daniel", // Legacy Apostle Daniel Makonnen bio
  "28597": "/en/about#pastor-aberham", // Legacy Pastor Aberham Bedasso stub
  "28288": "/en/sermons", // Legacy Sermon archive
  "28418": "/en/sermons#live", // Legacy GLM Live Stream (broken) page
  "28327": "/en/books", // Legacy Books page
  "28324": "/en/locations", // Legacy Locations page
  "28360": "/en/give", // Legacy Give stub
  "28329": "/en#stay-connected", // Legacy Subscribe page
  "499": "/en/legal/privacy", // Legacy Terms/Privacy boilerplate
};

/**
 * Content-Security-Policy, assembled as directives rather than one long
 * literal so each third-party allowance is easy to audit:
 *  - YouTube embeds (sermon player, live stream) + thumbnails/avatars
 *  - glministries.org / gospellightethiopia.org (real ministry photo
 *    assets, hotlinked from the ministry's own legacy WordPress media
 *    library and sister HQ site)
 *  - Facebook Graph API (verified page profile photos)
 *  - Stripe (USD giving + book store checkout)
 *
 * `'unsafe-eval'` is added to `script-src` in development only: Next.js
 * dev mode's React Fast Refresh / HMR runtime evaluates code via
 * `eval()`, and without it the entire client bundle throws on load
 * (`EvalError: ... violates ... script-src`), which silently breaks
 * React hydration site-wide — every button, modal, and effect stops
 * working even though the server-rendered HTML still looks correct.
 * Production builds don't use `eval()`, so the strict policy stays in
 * place there.
 */
const SCRIPT_SRC = [
  "'self'",
  "'unsafe-inline'",
  ...(process.env.NODE_ENV !== "production" ? ["'unsafe-eval'"] : []),
  "https://js.stripe.com",
].join(" ");

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  `script-src ${SCRIPT_SRC}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data: https://i.ytimg.com https://img.youtube.com https://yt3.googleusercontent.com https://glministries.org https://gospellightethiopia.org https://graph.facebook.com https://*.fbcdn.net https://platform-lookaside.fbsbx.com",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://js.stripe.com",
  "connect-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self), interest-cohort=()"
  );
  response.headers.set("Content-Security-Policy", CONTENT_SECURITY_POLICY);
  return response;
}

/** Builds a secured 301 redirect to a clean route, splitting off any `#hash`. */
function permanentRedirect(request: NextRequest, destination: string): NextResponse {
  const [path = "/", hash] = destination.split("#");
  const url = request.nextUrl.clone();
  url.pathname = path;
  url.search = "";
  url.hash = hash ? `#${hash}` : "";
  return applySecurityHeaders(NextResponse.redirect(url, 301));
}

export function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const { pathname, searchParams } = nextUrl;

  // 1. Legacy WordPress query-string 301 redirects. These only ever lived
  //    on the bare `/` route, so we only inspect query params there.
  if (pathname === "/") {
    const pageId = searchParams.get("page_id");
    if (pageId && LEGACY_PAGE_ID_REDIRECTS[pageId]) {
      return permanentRedirect(request, LEGACY_PAGE_ID_REDIRECTS[pageId]);
    }
    // Legacy category archive, single-post, and monthly-archive query
    // shapes (`?cat=`, `?p=`, `?m=`) all resolved to posts in the old
    // WordPress blog — the closest living equivalent is the sermon archive.
    if (searchParams.has("cat") || searchParams.has("p") || searchParams.has("m")) {
      return permanentRedirect(request, "/en/sermons");
    }
  }

  // API routes have no locale segment — skip locale routing, but still
  // get the security headers applied below.
  if (pathname.startsWith("/api")) {
    return applySecurityHeaders(NextResponse.next());
  }

  // `sitemap.ts`/`robots.ts` are served at the bare root by Next.js
  // convention — search engines expect exactly `/robots.txt` and
  // `/sitemap.xml`, never a locale-prefixed path, so these must never
  // be swept into the locale redirect below.
  if (pathname === "/robots.txt" || pathname === "/sitemap.xml") {
    return applySecurityHeaders(NextResponse.next());
  }

  // 2. Locale routing: every page lives under /en/... or /am/.... Anything
  //    requested without a locale prefix is redirected to the default
  //    locale (`en`), preserving the rest of the path. This is a
  //    temporary (307) redirect, not a 301 — unlike the legacy WordPress
  //    migration above, the "no locale" -> "default locale" mapping isn't
  //    a permanent SEO redirect, it's just routing. Note: the URL
  //    fragment (`#hash`) never reaches the server, so browsers
  //    automatically reapply it after a redirect whose Location carries
  //    none — nothing extra to do here to "preserve" it.
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  if (!firstSegment || !isSupportedLocale(firstSegment)) {
    const url = nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
    return applySecurityHeaders(NextResponse.redirect(url, 307));
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files; run on everything else.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp4|webm)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
