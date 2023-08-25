import { getSettings } from "@/sanity.client";
import Link from "next/link";
import { ErrorBoundary } from "react-error-boundary";
import ScheduleButton from "../schedule/button";
import ChatLink from "./chat-link";
import NavigationDialog from "./dialog";
import JoinChat from "./join-chat";
import NowPlaying, { NowPlayingFallback } from "./now-playing";

export default async function Navigation() {
  const settings = await getSettings();

  return (
    <header className="fixed inset-x-0 top-0 z-10 flex bg-gradient-to-b from-black to-transparent lg:bg-none lg:shadow-xl lg:backdrop-blur-3xl">
      <nav className="grid-template-navigation mx-auto grid w-full max-w-[90rem] items-center p-3">
        <ErrorBoundary FallbackComponent={NowPlayingFallback}>
          <NowPlaying style={{ gridArea: "player" }} />
        </ErrorBoundary>

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

          <ScheduleButton classNames="hidden lg:block text-inter-text-small leading-8 py-1 px-9 ml-auto animate-color-shift delay-[800ms]" />

          <NavigationDialog settings={settings} />
        </div>
      </nav>
    </header>
  );
}
