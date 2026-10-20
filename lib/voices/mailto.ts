/**
 * Read the address out of a `mailto:` link.
 *
 * Returns null for any other scheme, so a caller can skip the email-specific
 * parts of its user interface when the CMS points the link at a page instead.
 */
export function readEmailFromMailto(href: string | null | undefined): string | null {
  if (!href) return null;
  if (!href.toLowerCase().startsWith("mailto:")) return null;

  const address = href.slice("mailto:".length).split("?")[0];
  if (!address) return null;

  try {
    return decodeURIComponent(address);
  } catch {
    return address;
  }
}
