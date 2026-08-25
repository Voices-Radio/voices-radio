"use client";

import { cn } from "@/lib/utils";
import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import type { VoicesLiveStationId } from "@/lib/voices/config";
import ScheduleList from "./list";

export default function ScheduleDialog({
  classNames = "",
  children = "Schedule",
  label,
  initialStation,
}: {
  classNames?: string;
  children?: ReactNode;
  label?: string;
  initialStation?: VoicesLiveStationId;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          aria-label={label}
          className={cn(
            "rounded-full bg-black text-white focus:outline-none",
            classNames,
          )}
        >
          {children}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 overflow-y-auto bg-black/20 backdrop-blur-xl">
          <Dialog.Content className="relative flex min-h-full flex-col focus:outline-none">
            <ScheduleList initialStation={initialStation} />

            <div className="sticky bottom-6 flex justify-center pb-6">
              <Dialog.Close asChild>
                <button className="rounded-full bg-black px-14 py-3 text-mobile-inter-small text-white focus:outline-none focus:ring-2 focus:ring-white md:px-16 md:text-mobile-inter-text">
                  Close
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
