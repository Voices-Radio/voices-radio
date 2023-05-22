"use client";

import Link from "next/link";

export default function Navigation() {
  return (
    <header className="from-black/30 to-white bg-gradient-to-b pb-10">
      <nav className="grid grid-cols-3 items-center p-3">
        <Link
          href="/chat"
          className="text-sm px-4 bg-white rounded-full py-0.5 leading-6 justify-self-start"
        >
          Chat
        </Link>

        <Link href="/" className="uppercase text-center leading-none">
          Voices
          <br />
          Radio
        </Link>

        <button
          className="bg-black rounded-lg text-white p-2 justify-self-end"
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
      </nav>
    </header>
  );
}
