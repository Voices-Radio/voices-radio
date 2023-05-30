import Link from "next/link";
import JoinChat from "./join-chat";
import NowPlaying from "./now-playing";
import Schedule from "./schedule";
import ScheduleContent from "./schedule-content";

export default function Navigation() {
  return (
    <header className="z-50 absolute inset-x-0 top-0">
      <nav className="grid grid-template-navigation items-center p-3 md:backdrop-blur-3xl md:bg-none bg-gradient-to-b from-black to-transparent md:shadow-xl w-full">
        <div style={{ gridArea: "player" }} className="">
          <NowPlaying />
        </div>

        <Link
          href="/chat"
          className="inline-flex text-mobile-inter-small px-4 bg-white rounded-full py-1.5 justify-self-start md:hidden relative mr-7"
          style={{ gridArea: "chat" }}
        >
          <span>Chat</span>

          <svg
            className="absolute -right-7 top-1/2 -translate-y-1/2"
            width="32"
            height="12"
            viewBox="0 0 44 17"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.6888 9.06325C9.62128 8.85873 6.95873 7.77153 4.86053 5.42478C3.28111 3.65767 1.67934 1.91021 0.0776504 0.162839L0 0.078125L7.51084e-08 11.9047C1.25242 12.9978 2.58794 13.979 4.06581 14.7724C8.30567 17.0485 12.5913 17.0298 16.9038 15.0306C19.0848 14.0192 21.0506 12.676 22.7717 10.9912C23.6602 10.1196 24.5159 9.21403 25.3913 8.32882C27.4754 6.21821 29.8851 4.62126 32.7222 3.70069C34.7726 3.03381 36.8814 2.77376 39.0345 2.79143C40.5318 2.80532 42.0275 2.79371 43.5224 2.78523C43.6767 2.78317 43.883 2.86191 44 2.58069C43.8239 2.47661 43.658 2.35351 43.471 2.27157C39.4726 0.523367 35.3317 0.00745414 31.0378 0.838051C29.3442 1.16435 27.7434 1.77469 26.2599 2.63382C24.9682 3.38224 23.7863 4.30725 22.7793 5.43465C22.2112 6.07128 21.5821 6.64811 20.8542 7.11316C18.3576 8.71021 15.6054 9.25734 12.6888 9.06325Z"
              fill="#fff"
            />
          </svg>
        </Link>

        <Link
          href="/"
          className="uppercase font-kinfolk text-center text-white text-kinfolk-logo"
          style={{ gridArea: "logo" }}
        >
          Voices
        </Link>

        <div style={{ gridArea: "menu" }}>
          <div className="flex justify-end md:justify-normal md:gap-10">
            <JoinChat />

            <Schedule classNames="hidden md:block text-inter-text-small leading-8 py-1 px-9 ml-auto">
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
        </div>
      </nav>
    </header>
  );
}
