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
          className={`${classNames} bg-black rounded-full text-white focus:outline-none`}
        >
          Schedule
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/20 backdrop-blur-xl fixed inset-0 md:top-[4.5rem] overflow-y-auto">
          <Dialog.Content className="focus:outline-none">
            <div className="max-w-5xl mx-auto md:p-10">{children}</div>
          </Dialog.Content>

          <Dialog.Close asChild>
            <button className="sticky bottom-8 left-1/2 -translate-x-1/2 text-inter-mobile-text bg-black rounded-full px-20 py-4 text-white focus:outline-none">
              Close
            </button>
          </Dialog.Close>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
