import type { Metadata } from "next";
import { requireSession } from "@/lib/voices/membership/session";
import CompletePoller from "./complete-poller";

export const metadata: Metadata = {
  title: "Confirming your membership",
};

/**
 * Stripe's checkout successUrl (contract §3 — the backend appends
 * ?session_id=... automatically). Reconciliation itself happens
 * client-side in CompletePoller; this page only guards the session and
 * renders the shell so a signed-out visitor can't land here directly.
 */
export default async function JoinCompletePage() {
  await requireSession("/join/complete");

  return (
    <div className="mx-auto max-w-[520px] px-4 py-16 text-center md:px-0">
      <h1 className="font-outfit text-3xl font-black uppercase text-voicesNext-cream">
        Almost there
      </h1>
      <div className="mt-4">
        <CompletePoller />
      </div>
    </div>
  );
}
