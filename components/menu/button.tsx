"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ChatLink from "../chat-link";
import NowPlaying from "../now-playing";
import JoinChat from "../join-chat";

export default function MenuButton({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="flex rounded-lg bg-black p-2 text-white">
          <span className="sr-only">Menu</span>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
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
        <Dialog.Overlay className="fixed inset-0 z-50 overflow-y-auto bg-black md:top-[4.5rem]">
          <Dialog.Content className="focus:outline-none">
            <nav className="grid-template-navigation grid items-center p-3">
              <NowPlaying style={{ gridArea: "player" }} />

              <ChatLink style={{ gridArea: "chat" }} />

              <Link
                href="/"
                className="text-kinfolk-logo text-center font-kinfolk uppercase text-white"
                style={{ gridArea: "logo" }}
              >
                Voices
              </Link>

              <div
                className="flex justify-end lg:justify-normal lg:gap-10"
                style={{ gridArea: "menu" }}
              >
                <JoinChat />

                <Dialog.Close asChild>
                  <button className="ml-auto h-10 w-10 rounded-full bg-white p-1 text-black">
                    <span className="sr-only">Close</span>

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-8 w-8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </Dialog.Close>
              </div>
            </nav>

            {children}
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
