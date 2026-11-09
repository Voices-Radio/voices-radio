"use server";

import { revalidatePath } from "next/cache";
import { redeemBenefit } from "@/lib/voices/membership/membership-mutations";

export type RedeemResult =
  { ok: true; code: string | null } | { ok: false; message: string };

/**
 * The idempotency key is generated once, client-side, per redeem-button
 * mount (see redeem-button.tsx) and passed straight through here — NOT
 * regenerated per submit. That's what makes a double-click (or a retried
 * request) resolve to the backend's durable per-key dedup (contract §7)
 * rather than two distinct redemption attempts.
 */
export async function redeemAction(
  benefitId: string,
  idempotencyKey: string,
): Promise<RedeemResult> {
  const result = await redeemBenefit(benefitId, idempotencyKey);

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  revalidatePath("/account/benefits");
  revalidatePath("/account");
  revalidatePath("/account/redemptions");
  return { ok: true, code: result.data.benefit.code ?? null };
}
