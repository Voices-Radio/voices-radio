"use client";

import Link from "next/link";
import NowPlaying from "./now-playing";

export default function Navigation() {
  return (
    <header className="from-black/30 to-white bg-gradient-to-b pb-10">
      <nav className="grid grid-template-navigation items-center p-3 md:backdrop-blur-3xl">
        <div style={{ gridArea: "player" }}>
          {/* @ts-ignore */}
          <NowPlaying />
        </div>

        <Link
          href="/chat"
          className="text-sm px-4 bg-white rounded-full py-0.5 leading-6 justify-self-start md:hidden"
          style={{ gridArea: "chat" }}
        >
          Chat
        </Link>

        <Link
          href="/"
          className="uppercase text-center text-white font-black text-[1.375rem] md:text-[1.875rem] leading-[1.125rem] md:leading-6 line"
          style={{ gridArea: "logo" }}
        >
          Voices
          <br />
          Radio
        </Link>

        <div style={{ gridArea: "menu" }}>
          <div className="flex justify-end md:justify-normal md:gap-10">
            <button
              className="px-4 bg-white rounded-full py-0.5 leading-6 text-lg hidden md:block whitespace-nowrap"
              type="button"
            >
              Join Chat
            </button>

            <button
              className="hidden md:block bg-black rounded-full text-lg text-white leading-8 py-1 px-9 ml-auto"
              type="button"
            >
              Schedule
            </button>

            <button
              className="flex bg-black rounded-lg text-white p-2"
              type="button"
            >
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
          </div>
        </div>
      </nav>
    </header>
  );
}
