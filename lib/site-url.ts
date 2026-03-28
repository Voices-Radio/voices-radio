/**
 * Canonical site origin for sitemap, robots, and metadata.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://www.voicesradio.co.uk).
 */
export function getBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  const vercel = process.env.VERCEL_URL?.replace(/\/$/, "");
  if (vercel) return `https://${vercel}`;

  return "https://www.voicesradio.co.uk";
}
