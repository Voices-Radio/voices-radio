"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useState, type RefObject } from "react";
import { cn } from "@/lib/utils";

export function isSafeRestreamUrl(url?: string) {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      (parsed.hostname === "restream.io" ||
        parsed.hostname.endsWith(".restream.io"))
    );
  } catch {
    return false;
  }
}

export default function RestreamVideoModal({
  label,
  videoUrl,
  className,
  children,
  open,
  onOpenChange,
  returnFocusRef,
}: {
  label: string;
  videoUrl?: string;
  className?: string;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  returnFocusRef?: RefObject<HTMLElement>;
}) {
  const enabled = isSafeRestreamUrl(videoUrl);
  const [internalOpen, setInternalOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const duration = shouldReduceMotion ? 0.01 : 0.28;

  function handleOpenChange(nextOpen: boolean) {
    if (!isControlled) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      {children && (
        <Dialog.Trigger asChild disabled={!enabled}>
          <button
            type="button"
            className={cn(
              className,
              !enabled && "pointer-events-none opacity-50",
            )}
            aria-label={`${label} video`}
            aria-disabled={!enabled}
          >
            {children}
          </button>
        </Dialog.Trigger>
      )}
      <Dialog.Portal forceMount>
        <AnimatePresence>
          {isOpen && enabled && (
            <>
              <Dialog.Overlay asChild forceMount>
                <motion.div
                  className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: duration * 0.75, ease: "easeOut" }}
                />
              </Dialog.Overlay>
              <Dialog.Content
                asChild
                forceMount
                onCloseAutoFocus={(event) => {
                  if (!returnFocusRef?.current) return;
                  event.preventDefault();
                  returnFocusRef.current.focus();
                }}
              >
                <motion.div
                  className="fixed inset-0 z-[51] flex h-[100dvh] w-screen items-center justify-center bg-black/95 focus:outline-none"
                  initial={{
                    opacity: 0,
                    scale: shouldReduceMotion ? 1 : 0.985,
                    y: shouldReduceMotion ? 0 : 14,
                  }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    scale: shouldReduceMotion ? 1 : 0.99,
                    y: shouldReduceMotion ? 0 : 8,
                  }}
                  transition={{
                    duration,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  onPointerDown={(event) => {
                    if (event.target === event.currentTarget) {
                      handleOpenChange(false);
                    }
                  }}
                >
                  <Dialog.Title className="bg-black/65 absolute left-4 top-4 z-10 rounded-full px-4 py-2 font-asap text-sm font-bold uppercase tracking-wide text-voicesNext-cream backdrop-blur-sm md:left-6 md:top-6">
                    {label} live video
                  </Dialog.Title>
                  <Dialog.Close className="bg-black/65 absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full text-voicesNext-cream backdrop-blur-sm transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus:ring-2 focus:ring-voicesNext-orange md:right-6 md:top-6">
                    <X aria-hidden="true" size={22} />
                    <span className="sr-only">Close video player</span>
                  </Dialog.Close>
                  <div className="aspect-video w-full max-w-[177.7778dvh] overflow-hidden bg-black shadow-2xl">
                    <iframe
                      src={videoUrl}
                      title={`${label} Restream video player`}
                      className="h-full w-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
