import Link from "next/link";
import JoinChat from "./join-chat";
import NowPlaying from "./now-playing";

export default function Navigation() {
  return (
    <header className="z-50 absolute inset-x-0 top-0">
      <nav className="grid grid-template-navigation items-center p-3 md:backdrop-blur-3xl shadow-xl">
        <div style={{ gridArea: "player" }}>
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
          className="uppercase font-kinfolk text-center text-white text-5xl leading-none"
          style={{ gridArea: "logo" }}
        >
          Voices
        </Link>

        <div style={{ gridArea: "menu" }}>
          <div className="flex justify-end md:justify-normal md:gap-10">
            <JoinChat />

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
