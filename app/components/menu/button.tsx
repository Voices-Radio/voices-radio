"use client";

import type { Settings } from "@/sanity.queries";
import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import SocialLink from "../social-link";

export default function MenuButton({ settings }: { settings: Settings }) {
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
        <Dialog.Overlay className="fixed inset-0 z-50 overflow-y-auto bg-black">
          <Dialog.Content className="relative mx-auto flex h-full w-full max-w-[90rem] flex-col focus:outline-none">
            <Image
              src="/voices-element-left.svg"
              width={201}
              height={330}
              alt=""
              priority
              className="absolute left-4 top-1/2 hidden -translate-y-1/2 lg:block"
            />

            <Image
              src="/voices-element-right.svg"
              width={293}
              height={216}
              alt=""
              priority
              className="absolute right-4 top-1/2 hidden -translate-y-1/2 lg:block"
            />

            <nav className="grid grid-cols-[minmax(0,1fr)_min-content_minmax(0,1fr)] items-center p-3">
              <div className="h-10 w-10 lg:h-12 lg:w-12" />

              <Dialog.Close asChild>
                <Link
                  href="/"
                  className="text-kinfolk-logo text-center font-kinfolk uppercase text-white"
                >
                  Voices
                </Link>
              </Dialog.Close>

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
            </nav>

            <div className="flex flex-1 flex-col items-center justify-center">
              <div className="flex flex-col items-center gap-6 lg:gap-10">
                <Dialog.Close asChild>
                  <Link
                    className="text-kinfolk-navigation text-center font-kinfolk text-white"
                    href="/about"
                  >
                    About
                  </Link>
                </Dialog.Close>

                <a
                  className="text-kinfolk-navigation text-center font-kinfolk text-white"
                  href={settings.mixcloud_link}
                  target="_blank"
                  rel="noopener"
                >
                  Archive
                </a>

                <a
                  className="text-kinfolk-navigation text-center font-kinfolk text-white"
                  href={settings.store_link}
                  target="_blank"
                  rel="noopener"
                >
                  Store
                </a>

                <a
                  className="text-kinfolk-navigation text-center font-kinfolk text-white"
                  href={settings.apply_link}
                  target="_blank"
                  rel="noopener"
                >
                  Apply!
                </a>

                <a
                  className="text-kinfolk-navigation text-center font-kinfolk text-white"
                  href={settings.contact_link}
                >
                  Contact
                </a>
              </div>

              <Image
                src="/voices.svg"
                width={310 * 0.6}
                height={333 * 0.6}
                alt=""
                priority
                className="mx-auto mt-14 object-contain invert lg:hidden"
              />

              <div className="mt-14 flex justify-center gap-8">
                <SocialLink type="twitter" url={settings.twitter_link} />

                <SocialLink type="instagram" url={settings.instagram_link} />

                <SocialLink type="facebook" url={settings.facebook_link} />

                <SocialLink type="linkedin" url={settings.linkedin_link} />

                <SocialLink type="mixcloud" url={settings.mixcloud_link} />
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
