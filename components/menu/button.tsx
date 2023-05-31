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
        <Dialog.Overlay className="bg-black fixed inset-0 md:top-[4.5rem] overflow-y-auto z-50">
          <Dialog.Content className="focus:outline-none">
            <nav className="grid grid-template-navigation items-center p-3">
              <NowPlaying style={{ gridArea: "player" }} />

              <ChatLink style={{ gridArea: "chat" }} />

              <Link
                href="/"
                className="uppercase font-kinfolk text-center text-white text-kinfolk-logo"
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
                  <button className="rounded-full p-1 h-10 w-10 bg-white text-black ml-auto">
                    <span className="sr-only">Close</span>

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-8 h-8"
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
