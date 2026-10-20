import type { ReactNode } from "react";
import { Check, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FieldReview } from "./field-review";

const MARKS = {
  approved: { Icon: Check, text: "Approved", className: "text-green-400" },
  rejected: { Icon: X, text: "Not approved", className: "text-red-400" },
  pending: { Icon: Clock, text: "In review", className: "text-voicesNext-cream/60" },
} as const;

export function reviewReasonId(fieldId: string): string {
  return `${fieldId}-review-reason`;
}

/**
 * Puts the latest review result on the field it is about: a mark at the end
 * of the label line, and the reason for a rejection under the input. Every
 * field component starts with its label, so the mark lines up with it
 * without each component knowing about reviews.
 */
export default function ReviewedField({
  fieldId,
  review,
  children,
}: {
  fieldId: string;
  review: FieldReview | undefined;
  children: ReactNode;
}) {
  if (!review) return <>{children}</>;

  const { Icon, text, className } = MARKS[review.status];
  const showReason = review.status === "rejected" && review.reason;

  return (
    <div data-review={review.status} className="relative flex flex-col gap-1.5">
      <span
        className={cn(
          "absolute right-0 top-0 inline-flex items-center gap-1 font-gabarito text-xs font-bold",
          className,
        )}
      >
        <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={3} />
        {text}
      </span>
      {children}
      {showReason && (
        <p
          id={reviewReasonId(fieldId)}
          className="font-asap text-sm text-red-400"
        >
          {review.reason}
        </p>
      )}
    </div>
  );
}
