import Chatango from "@/components/chatango";
import NowPlaying from "@/components/now-playing";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Chat",
  alternates: { canonical: "/chat" },
};

export default function ChatPage() {
  return (
    <div>
      <header className="fixed inset-x-0 top-0 z-10 flex bg-gradient-to-b from-black to-transparent lg:bg-none lg:shadow-xl lg:backdrop-blur-3xl">
        <nav className="grid-template-navigation mx-auto grid w-full max-w-[90rem] items-center p-3">
          <NowPlaying style={{ gridArea: "player" }} />

          <Link
            href="/"
            className="text-kinfolk-logo text-center font-kinfolk uppercase text-white"
            style={{ gridArea: "logo" }}
          >
            Voices
          </Link>
        </nav>
      </header>

      <div className="relative mt-[120px] min-h-[calc(100vh-120px)] lg:mt-[72px] lg:min-h-[calc(100vh-72px)]">
        <Chatango />
      </div>
    </div>
  );
}
