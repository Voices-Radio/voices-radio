"use server";

import { revalidatePath } from "next/cache";
import {
  cancelMembership,
  changeCadence,
  createPortalSession,
  downgrade,
  previewChange,
  resumeMembership,
  upgrade,
} from "@/lib/voices/membership/membership-mutations";
import { getBaseUrl } from "@/lib/site-url";
import type { PreviewChangeResponse } from "@/lib/voices/membership/schemas";

export type ActionResult =
  | { ok: true }
  | { ok: false; message: string };

export type PreviewResult =
  | { ok: true; data: PreviewChangeResponse }
  | { ok: false; message: string };

/**
 * Every membership change previews its exact financial/date consequence
 * before the member can confirm (contract §5, brief requirement). Called
 * from ConfirmChangeDialog the moment it opens.
 */
export async function previewChangeAction(input: {
  action: "upgrade" | "downgrade" | "change_cadence" | "cancel";
  toAmountMinor?: number;
  toCadence?: "monthly" | "annual";
}): Promise<PreviewResult> {
  const result = await previewChange(input);
  return result.ok
    ? { ok: true, data: result.data }
    : { ok: false, message: result.message };
}

/**
 * The idempotency key is minted by the CLIENT, once per confirmation attempt,
 * and reused if that attempt is retried or double-submitted. Minting it here
 * gave every retry a fresh key, so the backend could not dedupe them and a
 * double-click applied the change twice. It arrives from the browser, so it is
 * validated rather than trusted.
 */
function requireKey(idempotencyKey: string): string {
  if (!/^[\w-]{8,100}$/.test(idempotencyKey)) {
    throw new Error("Invalid idempotency key.");
  }
  return idempotencyKey;
}

function afterMutation(result: { ok: boolean; message?: string }): ActionResult {
  if (result.ok) {
    // Every mutation returns the authoritative new state; refreshing here
    // (rather than trusting optimistic client state) is how stale renders
    // in another tab/session get corrected — see plan's stale-state note.
    revalidatePath("/account");
    revalidatePath("/account/membership");
    return { ok: true };
  }
  return { ok: false, message: result.message ?? "Something went wrong." };
}

export async function upgradeAction(
  toAmountMinor: number,
  idempotencyKey: string,
): Promise<ActionResult> {
  const result = await upgrade(toAmountMinor, requireKey(idempotencyKey));
  return afterMutation(result);
}

export async function downgradeAction(
  toAmountMinor: number,
  idempotencyKey: string,
): Promise<ActionResult> {
  const result = await downgrade(toAmountMinor, requireKey(idempotencyKey));
  return afterMutation(result);
}

export async function changeCadenceAction(
  toCadence: "monthly" | "annual",
  idempotencyKey: string,
): Promise<ActionResult> {
  const result = await changeCadence(toCadence, requireKey(idempotencyKey));
  return afterMutation(result);
}

export async function cancelAction(
  idempotencyKey: string,
  reason?: string,
): Promise<ActionResult> {
  const result = await cancelMembership(reason, requireKey(idempotencyKey));
  return afterMutation(result);
}

export async function resumeAction(
  idempotencyKey: string,
): Promise<ActionResult> {
  const result = await resumeMembership(requireKey(idempotencyKey));
  return afterMutation(result);
}

export async function portalSessionAction(): Promise<
  { ok: true; url: string } | { ok: false; message: string }
> {
  const result = await createPortalSession(`${getBaseUrl()}/account/membership`);
  return result.ok
    ? { ok: true, url: result.data.url }
    : { ok: false, message: result.message };
}
