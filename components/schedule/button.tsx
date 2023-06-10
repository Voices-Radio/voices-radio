"use client";

import * as Dialog from "@radix-ui/react-dialog";
import clsx from "clsx";
import ScheduleList from "./list";

const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

export default function ScheduleButton({
  classNames = "",
}: {
  classNames?: string;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          className={clsx(
            classNames,
            "rounded-full bg-black text-white focus:outline-none"
          )}
        >
          Schedule
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 overflow-y-auto bg-black/20 backdrop-blur-xl">
          <Dialog.Content className="relative flex h-full flex-col focus:outline-none">
            <ScheduleList />

            <div className="sticky bottom-8 flex justify-center">
              <Dialog.Close asChild>
                <button className="text-inter-mobile-text rounded-full bg-black px-20 py-4 text-white focus:outline-none">
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
