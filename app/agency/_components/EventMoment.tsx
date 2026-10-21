import Image from "next/image";

// Full-bleed photo break between the service copy and the case studies -
// gives the page a "here's the proof" pivot before Selected work, and
// bridges visually into that section's dark background below.
export function EventMoment() {
  return (
    <section className="relative flex min-h-[420px] items-end overflow-hidden bg-slate-950 sm:min-h-[520px] md:min-h-[640px]">
      <Image
        src="/agency/two-tribes-birthday-dj-booth.webp"
        alt="Two DJs sharing a laugh behind the decks at Voices' 2nd birthday party at Two Tribes Campfire"
        fill
        sizes="100vw"
        className="object-cover"
        priority={false}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(15, 23, 42, 0.05) 0%, rgba(15, 23, 42, 0.15) 45%, rgba(15, 23, 42, 0.92) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 md:pb-14 lg:px-8">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-voices-purple md:text-sm">
          On the ground
        </p>
        <p className="max-w-2xl text-xl font-black leading-tight text-white sm:text-2xl md:text-3xl">
          Voices&rsquo; own 2nd birthday party, run at Two Tribes Campfire —
          one of the six programmes below.
        </p>
      </div>
    </section>
  );
}
