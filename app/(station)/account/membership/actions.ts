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
  toTierId?: string;
  toCadence?: "monthly" | "annual";
}): Promise<PreviewResult> {
  const result = await previewChange(input);
  return result.ok
    ? { ok: true, data: result.data }
    : { ok: false, message: result.message };
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

export async function upgradeAction(toTierId: string): Promise<ActionResult> {
  const result = await upgrade(toTierId, crypto.randomUUID());
  return afterMutation(result);
}

export async function downgradeAction(toTierId: string): Promise<ActionResult> {
  const result = await downgrade(toTierId, crypto.randomUUID());
  return afterMutation(result);
}

export async function changeCadenceAction(
  toCadence: "monthly" | "annual",
): Promise<ActionResult> {
  const result = await changeCadence(toCadence, crypto.randomUUID());
  return afterMutation(result);
}

export async function cancelAction(reason?: string): Promise<ActionResult> {
  const result = await cancelMembership(reason, crypto.randomUUID());
  return afterMutation(result);
}

export async function resumeAction(): Promise<ActionResult> {
  const result = await resumeMembership(crypto.randomUUID());
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
