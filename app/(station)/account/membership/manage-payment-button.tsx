"use client";

import { useState } from "react";
import { portalSessionAction } from "./actions";

/**
 * Hosted Stripe Customer Portal redirect (contract §5) — chosen specifically
 * to keep zero PCI scope on our side, so this is a redirect, never an
 * embedded card form.
 */
export default function ManagePaymentButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    const result = await portalSessionAction();
    if (result.ok) {
      window.location.href = result.url;
      return;
    }
    setLoading(false);
    setError(result.message);
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-busy={loading}
        className="inline-flex h-11 items-center justify-center rounded-full border border-voicesNext-border px-5 font-gabarito text-sm font-bold text-voicesNext-cream transition-colors hover:border-voicesNext-orange hover:text-voicesNext-orange focus:outline-none focus:ring-2 focus:ring-voicesNext-orange disabled:opacity-60"
      >
        {loading ? "Opening…" : "Manage payment method"}
      </button>
      {error && (
        <p role="alert" className="mt-2 font-gabarito text-sm text-voicesNext-orange">
          {error}
        </p>
      )}
    </div>
  );
}
