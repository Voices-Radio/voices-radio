import Link from "next/link";
import ChatLink from "./chat-link";
import JoinChat from "./join-chat";
import MenuButton from "./menu/button";
import MenuDialog from "./menu/dialog";
import NowPlaying from "./now-playing";
import ScheduleButton from "./schedule/button";
import ScheduleDialog from "./schedule/dialog";

export default function Navigation() {
  return (
    <header className="z-10 absolute inset-x-0 top-0">
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

          <ScheduleButton classNames="hidden lg:block text-inter-text-small leading-8 py-1 px-9 ml-auto">
            {/* @ts-expect-error Async Server Components */}
            <ScheduleDialog />
          </ScheduleButton>

          <MenuButton>
            {/* @ts-expect-error Async Server Components */}
            <MenuDialog />
          </MenuButton>
        </div>
      </nav>
    </header>
  );
}
