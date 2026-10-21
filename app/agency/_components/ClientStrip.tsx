import Image from "next/image";
import { clientLogos, type ClientLogo } from "../content";

function LogoMark({ client }: { client: ClientLogo }) {
  if (!client.logo) {
    return (
      <span className="whitespace-nowrap text-sm font-black uppercase tracking-[0.1em] text-white/70">
        {client.name}
      </span>
    );
  }

  const image = (
    <Image
      src={client.logo}
      alt={client.name}
      width={client.width}
      height={client.height}
      className="h-7 w-auto object-contain opacity-90 transition duration-300 hover:opacity-100 sm:h-8"
    />
  );

  // A handful of marks are dark/near-black - invisible against the strip's
  // slate-900 background - so they get a small light chip to sit on instead.
  if (!client.chip) return image;

  return (
    <span className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5">
      {image}
    </span>
  );
}

function ClientList({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <ul
      aria-hidden={ariaHidden}
      className="flex shrink-0 items-center gap-8 pr-8"
    >
      {clientLogos.map((client, index) => (
        <li key={`${client.name}-${index}`} className="flex items-center">
          <LogoMark client={client} />
        </li>
      ))}
    </ul>
  );
}

export function ClientStrip() {
  return (
    <div className="border-b border-white/10 bg-slate-900 py-4">
      {/* Desktop: static wrapped line. Mobile: CSS marquee, duplicated list for a seamless loop. */}
      <div className="mx-auto hidden max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 sm:flex sm:px-6 lg:px-8">
        {clientLogos.map((client) => (
          <div key={client.name} className="flex items-center">
            <LogoMark client={client} />
          </div>
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
