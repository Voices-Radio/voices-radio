import Link from "next/link";
import ChatLink from "./chat-link";
import JoinChat from "./join-chat";
import MenuButton from "./menu/button";
import MenuDialog from "./menu/dialog";
import NowPlaying from "./now-playing";
import ScheduleButton from "./schedule/button";

export default function Navigation() {
  return (
    <header className="absolute inset-x-0 top-0 z-10">
      <nav className="grid-template-navigation grid w-full items-center bg-gradient-to-b from-black to-transparent p-3 lg:bg-none lg:shadow-xl lg:backdrop-blur-3xl">
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

          <ScheduleButton classNames="hidden lg:block text-inter-text-small leading-8 py-1 px-9 ml-auto" />

          <MenuButton>
            {/* @ts-expect-error Async Server Components */}
            <MenuDialog />
          </MenuButton>
        </div>
      </nav>
    </header>
  );
}
