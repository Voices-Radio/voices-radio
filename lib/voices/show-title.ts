/**
 * Archive titles arrive from the API with broadcast bookkeeping appended, e.g.
 * "In Situ Show w/ DJoe - 02/09/26 - Voices Radio". On a show page the date is
 * already in the transmission line and the station is already the site you are
 * on, so rendering the raw title repeats both — three times over, once in the
 * heading, once on the artwork and once in the mini player.
 *
 * Strips only trailing bookkeeping segments, and only ones that are
 * unambiguously a date or the station name. The first segment is always kept,
 * so a title that is nothing but bookkeeping survives intact.
 */

const SEGMENT_SEPARATOR = /\s+[-–—]\s+/;

// dd/mm/yy, dd.mm.yyyy, yyyy-mm-dd and friends.
const DATE_LIKE = /^\d{1,4}[./-]\d{1,2}[./-]\d{2,4}$/;

const STATION_NAMES = new Set(["voices", "voices radio", "voicesradio"]);

function isBookkeeping(segment: string) {
  const normalized = segment.trim().toLowerCase();
  return DATE_LIKE.test(normalized) || STATION_NAMES.has(normalized);
}

export function formatShowDisplayTitle(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) return "";

  const segments = trimmed.split(SEGMENT_SEPARATOR);

  // Always keep the first segment: "Voices Radio" or a bare date is still the
  // only name this show has.
  let end = segments.length;
  while (end > 1 && isBookkeeping(segments[end - 1])) {
    end -= 1;
  }

  return segments.slice(0, end).join(" - ");
}
