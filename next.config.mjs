/**
 * Content Security Policy.
 *
 * Shipped as Report-Only deliberately. The embedded Sanity Studio at /studio
 * needs 'unsafe-eval' and blob: workers, and the site embeds several third
 * party players, so a blocking policy on day one would break the CMS and the
 * player. Collect violation reports first, tighten, then promote this to the
 * enforcing `Content-Security-Policy` header.
 *
 * Clickjacking is NOT left to the report-only policy: X-Frame-Options below
 * enforces that today.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.usefathom.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "connect-src 'self' https: wss:",
  "worker-src 'self' blob:",
  "frame-src 'self' https://www.mixcloud.com https://player.mixcloud.com https://w.soundcloud.com https://player.restream.io https://www.youtube.com https://www.google.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  // Without a report target the Report-Only policy above collects NOTHING —
  // browsers evaluate it and discard the result. report-uri is deprecated but
  // still the only directive Safari honours; report-to is the modern one. Ship
  // both so the sample isn't skewed by browser choice.
  "report-uri /api/csp-report",
  "report-to csp-endpoint",
].join("; ");

/** Names the group that `report-to` above refers to. */
const reportingEndpoints = "csp-endpoint=\"/api/csp-report\"";

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  { key: "Reporting-Endpoints", value: reportingEndpoints },
  { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicy },
];

/** @type {import('next').NextConfig} */
const config = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      {
        // 308, not 307: /discover was renamed to /explore and is not coming
        // back. A temporary redirect tells Google to keep /discover indexed.
        source: "/discover",
        destination: "/explore",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      { hostname: "cdn.sanity.io" },
      { hostname: "thumbnailer.mixcloud.com" },
      { hostname: "optq01mefvpkgp3p.public.blob.vercel-storage.com" },
      { hostname: "i1.sndcdn.com" },
      { hostname: "drive.google.com" },
    ],
  },
  webpack: (config) => {
    // Exclude the bolt folder from Next.js compilation
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ["**/bolt/**", "**/node_modules/**"],
    };
    return config;
  },
  // Exclude bolt folder from TypeScript compilation
  typescript: {
    ignoreBuildErrors: false,
  },
  // Exclude bolt folder from ESLint
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ["app", "components", "lib", "hooks", "icons", "schemas"],
  },
};

export default config;
