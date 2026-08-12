import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { briefHref, navItems } from "../content";

export function Nav() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a href="#home" className="flex h-11 items-center gap-2">
          <Image
            src="/VOICESLOGO_LIGHTBOX.png"
            alt="Voices Agency"
            width={34}
            height={34}
            className="h-8 w-auto"
            priority
          />
          <span className="text-lg font-black text-white">Voices Agency</span>
        </a>

        <div className="hidden items-center gap-5 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-bold text-white/80 transition-colors hover:text-voices-purple focus:outline-none focus:ring-2 focus:ring-voices-purple focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              {item.label}
            </a>
          ))}
        </div>

        <a
          href={briefHref}
          aria-label="Start a brief"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-voices-purple px-4 py-2 text-sm font-black text-white transition hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-voices-purple focus:ring-offset-2 focus:ring-offset-slate-950"
        >
          <span className="lg:hidden">Brief</span>
          <span className="hidden lg:inline">Start a brief</span>
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </nav>
  );
}
