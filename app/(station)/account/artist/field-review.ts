import type { ArtistProfile } from "@/lib/voices/membership/schemas";

type ReviewedField = NonNullable<ArtistProfile["profileReview"]>["fields"][number];

export type FieldReview = {
  status: ReviewedField["status"];
  reason: string | null;
  proposed: unknown;
};

export type FieldReviews = Readonly<Record<string, FieldReview>>;

/**
 * The latest review keyed by form input name. The backend reports social
 * links as `socialLinks.<name>`; the form posts them as bare `<name>`.
 */
export function reviewByField(
  review: ArtistProfile["profileReview"],
): FieldReviews {
  if (!review) return {};
  return Object.fromEntries(
    review.fields.map((field) => [
      field.field.replace(/^socialLinks\./, ""),
      {
        status: field.status,
        reason: field.rejectionReason ?? null,
        proposed: field.proposed,
      },
    ]),
  );
}

// A field that is not approved yet shows what the DJ sent, not the live
// value, so a rejection reason sits next to the text it is about.
function showsProposal(review: FieldReview | undefined): review is FieldReview {
  return Boolean(review && review.status !== "approved");
}

export function shownText(
  review: FieldReview | undefined,
  live: string | null | undefined,
): string | null {
  if (showsProposal(review) && typeof review.proposed === "string") {
    return review.proposed;
  }
  return live ?? null;
}

export function shownList(
  review: FieldReview | undefined,
  live: string[],
): string[] {
  if (
    showsProposal(review) &&
    Array.isArray(review.proposed) &&
    review.proposed.every((item) => typeof item === "string")
  ) {
    return review.proposed;
  }
  return live;
}
