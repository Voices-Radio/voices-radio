"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { trackMembershipEvent } from "@/lib/voices/membership/analytics";
import { redeemAction } from "./actions";

/**
 * Disables on click to blunt an accidental double-click, but that's only a
 * courtesy — correctness rests on the idempotency key below, generated
 * once per mount and reused for every attempt this button instance makes,
 * so even a genuine double-submit (double-click racing past the disabled
 * state, or a retried request) resolves to the backend's durable dedup
 * rather than two distinct redemption attempts.
 */
export default function RedeemButton({
  benefitId,
  benefitSlug,
  label,
}: {
  benefitId: string;
  benefitSlug: string;
  label: string;
}) {
  const idempotencyKeyRef = useRef<string | undefined>(undefined);
  idempotencyKeyRef.current ??= crypto.randomUUID();

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    const result = await redeemAction(benefitId, idempotencyKeyRef.current!);
    setLoading(false);

    if (result.ok) {
      trackMembershipEvent({ name: "membership_benefit_redeemed", benefitSlug });
      router.refresh();
    } else {
      setError(result.message);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-busy={loading}
        className="inline-flex h-10 items-center justify-center rounded-full bg-voicesNext-orangeButton px-4 font-gabarito text-sm font-bold text-white transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus:ring-2 focus:ring-voicesNext-orange disabled:opacity-60"
      >
        {loading ? "Working…" : label}
      </button>
      {error && (
        <p role="alert" className="mt-2 font-gabarito text-sm text-voicesNext-orange">
          {error}
        </p>
      )}
    </div>
  );
}
