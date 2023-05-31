"use client";

import * as Dialog from "@radix-ui/react-dialog";

export default function ScheduleButton({
  children,
  classNames = "",
}: {
  children: React.ReactNode;
  classNames?: string;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          className={`${classNames} rounded-full bg-black text-white focus:outline-none`}
        >
          Schedule
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 overflow-y-auto bg-black/20 backdrop-blur-xl md:top-[4.5rem]">
          <Dialog.Content className="focus:outline-none">
            {children}
          </Dialog.Content>

          <Dialog.Close asChild>
            <button className="text-inter-mobile-text sticky bottom-8 left-1/2 -translate-x-1/2 rounded-full bg-black px-20 py-4 text-white focus:outline-none">
              Close
            </button>
          </Dialog.Close>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
