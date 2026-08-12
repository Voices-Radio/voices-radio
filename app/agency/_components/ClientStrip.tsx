import { clientStrip } from "../content";

function ClientList({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <ul
      aria-hidden={ariaHidden}
      className="flex shrink-0 items-center gap-8 pr-8"
    >
      {clientStrip.map((client, index) => (
        <li
          key={`${client}-${index}`}
          className="whitespace-nowrap text-sm font-black uppercase tracking-[0.1em] text-white/70"
        >
          {client}
        </li>
      ))}
    </ul>
  );
}

export function ClientStrip() {
  return (
    <div className="border-b border-white/10 bg-slate-900 py-4">
      {/* Desktop: static wrapped line. Mobile: CSS marquee, duplicated list for a seamless loop. */}
      <div className="mx-auto hidden max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 sm:flex sm:px-6 lg:px-8">
        {clientStrip.map((client) => (
          <span
            key={client}
            className="whitespace-nowrap text-sm font-black uppercase tracking-[0.1em] text-white/70"
          >
            {client}
          </span>
        ))}
      </div>

      <div className="flex overflow-hidden sm:hidden">
        <div className="flex w-max animate-marquee motion-reduce:animate-none">
          <ClientList />
          <ClientList ariaHidden />
        </div>
      </div>
    </div>
  );
}
