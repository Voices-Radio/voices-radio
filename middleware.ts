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

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
