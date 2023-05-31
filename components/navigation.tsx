import Link from "next/link";
import JoinChat from "./join-chat";
import NowPlaying from "./now-playing";
import Schedule from "./schedule";
import ScheduleContent from "./schedule-content";
import ChatLink from "./chat-link";

export default function Navigation() {
  return (
    <header className="z-50 absolute inset-x-0 top-0">
      <nav className="grid grid-template-navigation items-center p-3 lg:backdrop-blur-3xl lg:bg-none bg-gradient-to-b from-black to-transparent lg:shadow-xl w-full">
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

          <Schedule classNames="hidden lg:block text-inter-text-small leading-8 py-1 px-9 ml-auto">
            {/* @ts-expect-error Async Server Components */}
            <ScheduleContent />
          </Schedule>

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
      </nav>
    </header>
  );
}
