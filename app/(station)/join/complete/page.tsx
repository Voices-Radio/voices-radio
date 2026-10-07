import type { Metadata } from "next";
import { getSession, requireSession } from "@/lib/voices/membership/session";
import CompletePoller from "./complete-poller";
import GuestComplete from "./guest-complete";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Confirming your membership",
};

/**
 * Stripe's checkout successUrl (contract §3 — the backend appends
 * ?session_id=... automatically). Reconciliation itself happens client-side.
 *
 * Two audiences:
 *   - a signed-in member (CompletePoller)
 *   - someone who paid through the payment-first join and has no password or
 *     session yet (GuestComplete): they are told to open the emailed link that
 *     confirms their address and lets them choose a password
 * With neither a session nor a Stripe session id there is nothing to show, so
 * the visitor is sent to sign in.
 */
export default async function JoinCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  const session = await getSession();

  if (!session && sessionId) {
    return (
      <main
        id="main-content"
        className="mx-auto max-w-[520px] scroll-mt-24 px-4 py-16 text-center md:px-0"
      >
        <h1 className="font-outfit text-3xl font-black uppercase text-voicesNext-cream">
          Almost there
        </h1>
        <div className="mt-4">
          <GuestComplete sessionId={sessionId} />
        </div>
      </main>
    );
  }

  await requireSession("/join/complete");

  return (
    <main
      id="main-content"
      className="mx-auto max-w-[520px] scroll-mt-24 px-4 py-16 text-center md:px-0"
    >
      <h1 className="font-outfit text-3xl font-black uppercase text-voicesNext-cream">
        Almost there
      </h1>
      <div className="mt-4">
        <CompletePoller />
      </div>
    </main>
  );
}
