import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const DEFAULT_STAGING_USER = "voices";

function isStagingAuthEnabled() {
  return (
    process.env.NEXT_PUBLIC_SITE_ENV !== "production" &&
    process.env.ENABLE_STAGING_AUTH === "true" &&
    Boolean(process.env.STAGING_PASSWORD)
  );
}

function getBasicAuthCredentials(request: NextRequest) {
  const header = request.headers.get("authorization");

  if (!header?.startsWith("Basic ")) {
    return null;
  }

  try {
    const decoded = atob(header.slice("Basic ".length));
    const separatorIndex = decoded.indexOf(":");

    if (separatorIndex === -1) {
      return null;
    }

    return {
      username: decoded.slice(0, separatorIndex),
      password: decoded.slice(separatorIndex + 1),
    };
  } catch {
    return null;
  }
}

function unauthorizedResponse() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Voices Radio Staging"',
    },
  });
}

export function middleware(request: NextRequest) {
  if (!isStagingAuthEnabled()) {
    return NextResponse.next();
  }

  const credentials = getBasicAuthCredentials(request);
  const expectedUser = process.env.STAGING_AUTH_USER || DEFAULT_STAGING_USER;

  if (
    credentials?.username === expectedUser &&
    credentials.password === process.env.STAGING_PASSWORD
  ) {
    return NextResponse.next();
  }

  return unauthorizedResponse();
}

/**
 * Staging gate coverage.
 *
 * Two deliberate carve-outs, both for routes that carry their own, stronger
 * authentication and would BREAK under basic auth:
 *
 *  - `api/revalidate` — Sanity's webhook cannot send basic auth credentials.
 *    It verifies its own HMAC signature (see the route), so gating it here
 *    would silently kill CMS publishing while looking like a security win.
 *  - `api/voices` — the Studio's admin routes authenticate the caller's Sanity
 *    token via requireStudioUser(). Those requests set their own
 *    `Authorization: Bearer …` header, which replaces the browser's basic-auth
 *    header, so they can never satisfy this check.
 *
 * Everything else under /api IS gated: previously the matcher excluded `api`
 * wholesale, which left every API route on staging publicly reachable.
 *
 * Static assets are excluded by explicit extension rather than the old
 * `.*\..*` catch-all, which let any dotted path (e.g. /private.json) skip the
 * gate entirely.
 */
export const config = {
  matcher: [
    "/((?!api/revalidate|api/voices|_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|css|js|map|woff|woff2|ttf|otf|eot|mp3|mp4|webm)$).*)",
  ],
};
