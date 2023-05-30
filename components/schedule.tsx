"use client";

import * as Dialog from "@radix-ui/react-dialog";

export default function Schedule({
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
        <Dialog.Overlay className="bg-black/20 backdrop-blur-xl fixed inset-0" />

        <Dialog.Content className="fixed inset-0 focus:outline-none overflow-y-scroll">
          <div className="max-w-5xl mx-auto p-10 mt-[4.5rem]">{children}</div>

          <Dialog.Close asChild>
            <button className="fixed bottom-8 left-1/2 -translate-x-1/2 text-inter-mobile-text bg-black rounded-full px-20 py-4 text-white focus:outline-none">
              Close
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
