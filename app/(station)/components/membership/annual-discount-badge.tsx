/**
 * Renders the server-derived annual discount ("Save 14%"), never a
 * client-computed or hardcoded figure — see
 * docs/plans/sliding-scale-membership.md R5. Renders nothing when the
 * discount is absent or not positive, so a pricing change that erases the
 * saving can never leave a stale or nonsensical badge on screen.
 */
export default function AnnualDiscountBadge({
  discountPercent,
}: {
  discountPercent: number | null;
}) {
  if (!discountPercent || discountPercent <= 0) return null;

  return (
    <span className="inline-flex items-center rounded-full bg-voicesNext-orangeButton px-2 py-0.5 font-asap text-[10px] font-bold uppercase tracking-[0.5px] text-white">
      Save {discountPercent}%
    </span>
  );
}
