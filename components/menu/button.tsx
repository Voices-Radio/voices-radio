"use client";

import * as Dialog from "@radix-ui/react-dialog";

export default function MenuButton({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="flex bg-black rounded-lg text-white p-2">
          <span className="sr-only">Menu</span>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="bg-black fixed inset-0 md:top-[4.5rem] overflow-y-auto">
          <Dialog.Content className="focus:outline-none">
            <div className="max-w-5xl mx-auto md:p-10">{children}</div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
