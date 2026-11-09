import type { PortableTextBlock, PortableTextSpan } from "sanity";

/**
 * The bookings field is authored as Portable Text even though each span is a
 * single artist name. Keep the editorial order rather than using the old
 * page's alphabetical sort: it is the order the CMS author supplied and it
 * also makes the new typographic field deterministic.
 */
export function getBookingNames(
  bookings: PortableTextBlock[] | undefined,
): string[] {
  return (
    bookings
      ?.flatMap((block) => block.children)
      .map((child) => (child as PortableTextSpan)?.text?.trim())
      .filter((name): name is string => Boolean(name)) ?? []
  );
}
