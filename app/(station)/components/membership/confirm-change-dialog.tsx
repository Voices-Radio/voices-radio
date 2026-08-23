"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import {
  formatMembershipDate,
  formatMinorUnits,
} from "@/lib/voices/membership/format";
import type { PreviewChangeResponse } from "@/lib/voices/membership/schemas";
import { cn } from "@/lib/utils";
import {
  accountPrimaryButtonClassName,
  accountSecondaryButtonClassName,
} from "../../account/components/account-surface";

type PreviewResult =
  | { ok: true; data: PreviewChangeResponse }
  | { ok: false; message: string };

type ConfirmResult = { ok: true } | { ok: false; message: string };

/**
 * Every membership change (upgrade/downgrade/cadence/cancel) must show its
 * exact financial and date consequence before the member can confirm
 * (contract §5, brief requirement) — modelled on the Radix dialog pattern
 * in restream-video-modal.tsx (real Dialog.Title, onCloseAutoFocus focus
 * return), the most complete existing example in this repo.
 */
export default function ConfirmChangeDialog({
  triggerLabel,
  triggerClassName,
  title,
  currency = "gbp",
  loadPreview,
  onConfirm,
  confirmLabel,
  onSuccess,
}: {
  triggerLabel: string;
  triggerClassName?: string;
  title: string;
  currency?: string;
  loadPreview: () => Promise<PreviewResult>;
  onConfirm: () => Promise<ConfirmResult>;
  confirmLabel: string;
  onSuccess?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const duration = shouldReduceMotion ? 0.01 : 0.2;

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setPreview(null);
      setConfirmError(null);
      void loadPreview().then(setPreview);
    }
  }

  async function handleConfirm() {
    setConfirming(true);
    setConfirmError(null);
    const result = await onConfirm();
    setConfirming(false);

    if (result.ok) {
      setOpen(false);
      onSuccess?.();
    } else {
      setConfirmError(result.message);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button ref={triggerRef} type="button" className={triggerClassName}>
          {triggerLabel}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal forceMount>
        <AnimatePresence>
          {open && (
            <>
              <Dialog.Overlay asChild forceMount>
                <motion.div
                  className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration }}
                />
              </Dialog.Overlay>
              <Dialog.Content
                asChild
                forceMount
                onCloseAutoFocus={(event) => {
                  event.preventDefault();
                  triggerRef.current?.focus();
                }}
              >
                <motion.div
                  className="fixed inset-0 z-[51] flex items-center justify-center p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration }}
                >
                  <motion.div
                    className="w-full max-w-[440px] rounded-voices-md border border-voicesNext-border bg-voicesNext-surface p-6 focus:outline-none"
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
                    transition={{ duration }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <Dialog.Title className="font-gabarito text-lg font-bold text-voicesNext-cream">
                        {title}
                      </Dialog.Title>
                      <Dialog.Close className="shrink-0 rounded-full p-1 text-voicesNext-cream/70 transition-colors hover:text-voicesNext-cream focus:outline-none focus:ring-2 focus:ring-voicesNext-orange">
                        <X aria-hidden="true" size={18} />
                        <span className="sr-only">Close</span>
                      </Dialog.Close>
                    </div>

                    <div className="mt-4">
                      {!preview && (
                        <div className="flex items-center gap-2 font-gabarito text-sm text-voicesNext-cream/70">
                          <Loader2
                            aria-hidden="true"
                            size={16}
                            className="animate-spin"
                          />
                          Checking what this changes…
                        </div>
                      )}

                      {preview && !preview.ok && (
                        <p
                          role="alert"
                          className="font-gabarito text-sm text-voicesNext-orange"
                        >
                          {preview.message}
                        </p>
                      )}

                      {preview?.ok && (
                        <dl className="flex flex-col gap-2 font-gabarito text-sm text-voicesNext-cream/90">
                          <div className="flex justify-between gap-4">
                            <dt className="text-voicesNext-cream/70">
                              Effective
                            </dt>
                            <dd>
                              {formatMembershipDate(preview.data.effectiveAt)}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-4">
                            <dt className="text-voicesNext-cream/70">
                              New price
                            </dt>
                            <dd>
                              {formatMinorUnits(
                                preview.data.priceMinor,
                                currency,
                              )}
                            </dd>
                          </div>
                          {typeof preview.data.proratedAmountMinor ===
                            "number" && (
                            <div className="flex justify-between gap-4">
                              <dt className="text-voicesNext-cream/70">
                                Prorated today
                              </dt>
                              <dd>
                                {formatMinorUnits(
                                  preview.data.proratedAmountMinor,
                                  currency,
                                )}
                              </dd>
                            </div>
                          )}
                          <p className="mt-1 text-voicesNext-cream/90">
                            {preview.data.description}
                          </p>
                        </dl>
                      )}

                      {confirmError && (
                        <p
                          role="alert"
                          className="mt-3 font-gabarito text-sm text-voicesNext-orange"
                        >
                          {confirmError}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                      <Dialog.Close asChild>
                        <button
                          type="button"
                          className={cn(
                            accountSecondaryButtonClassName,
                            "h-11 px-5 text-sm",
                          )}
                        >
                          Cancel
                        </button>
                      </Dialog.Close>
                      <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={!preview?.ok || confirming}
                        aria-busy={confirming}
                        className={cn(
                          accountPrimaryButtonClassName,
                          "h-11 px-5 text-sm",
                        )}
                      >
                        {confirming ? "Confirming…" : confirmLabel}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
