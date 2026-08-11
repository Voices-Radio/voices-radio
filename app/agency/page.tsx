import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowDown,
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Megaphone,
  Music2,
  Radio,
  Sparkles,
} from "lucide-react";

const briefHref =
  "mailto:bookings@voicesradio.co.uk?subject=Voices%20Agency%20Brief";

export const metadata: Metadata = {
  metadataBase: new URL("https://voicesradio.co.uk"),
  title: "Voices Agency | Music Programming and Talent Curation",
  description:
    "Voices Agency designs and manages culturally credible music programmes for venues, hospitality groups, brands and events.",
  keywords: [
    "music programming",
    "DJ bookings",
    "venue music programming",
    "brand activations",
    "Voices Agency",
    "London music agency",
  ],
  alternates: { canonical: "/agency" },
  openGraph: {
    title: "Voices Agency | Music Programming and Talent Curation",
    description:
      "London's music community, programmed for your space. Music programming and talent curation for venues, brands and events.",
    url: "/agency",
    type: "website",
  },
  twitter: {
    title: "Voices Agency | Music Programming and Talent Curation",
    description:
      "Music programming and talent curation for venues, brands and events.",
    card: "summary_large_image",
  },
};

const navItems = [
  { label: "Offer", href: "#offer" },
  { label: "Formats", href: "#formats" },
  { label: "Work", href: "#work" },
  { label: "Process", href: "#process" },
  { label: "Brief", href: "#brief" },
];

const services = [
  {
    icon: Building2,
    title: "Venue music programming",
    description:
      "Music strategy, talent curation and managed calendars for hospitality venues, destinations and cultural spaces.",
  },
  {
    icon: Music2,
    title: "Talent bookings",
    description:
      "DJs, live artists and creative talent selected around your audience, setting, atmosphere and budget.",
  },
  {
    icon: Megaphone,
    title: "Brand activations",
    description:
      "Culturally credible talent, workshops, panels and music-led experiences for brands and public programmes.",
  },
  {
    icon: Radio,
    title: "Production and content",
    description:
      "Optional event, broadcast, podcast and content support through the wider Voices platform.",
  },
];

const formats = [
  {
    label: "One-off booking",
    bestFor: "Launches, parties, private events and individual dates.",
    rhythm: "Single date",
  },
  {
    label: "Residency",
    bestFor: "Weekly or monthly programming with a consistent identity.",
    rhythm: "Recurring",
  },
  {
    label: "Fully managed programme",
    bestFor: "Venues or groups requiring an entire calendar to be managed.",
    rhythm: "Calendar",
  },
  {
    label: "Cultural activation",
    bestFor:
      "Brands seeking a larger concept, audience experience or content opportunity.",
    rhythm: "Campaign",
  },
];

const caseStudies = [
  {
    title: "Hackney Bridge",
    subtitle: "Building a distinctive music programme at Nico's",
    type: "Venue programme",
    location: "Hackney Wick",
    status: "Artwork pending approval",
    brief:
      "Build and manage a sustainable music and events programme across Hackney Bridge's venue spaces, with a consistent cultural offer and one retained partner.",
    delivered:
      "Voices supports programme development, promoter outreach, event sourcing, booking coordination, calendar management and marketing liaison. At Nico's, Voices creates DJ line-ups for live-music dates, weekly DJ sets, day parties and larger takeovers.",
    scale:
      "The public programming relationship began with Around the World with Nico in March 2024. A formal retained promoter arrangement started in January 2025 and remains ongoing. Internal records evidence at least 17 dated bookings between 7 May and 15 July 2026.",
    proof:
      "Hackney Bridge publicly credits Voices with creating Nico's DJ line-ups, and the weekly programme continued to be advertised as curated by Voices in 2026. Maria Hanlon presents: Soul Satisfaction was selected as a Resident Advisor Pick.",
  },
  {
    title: "Two Tribes Campfire",
    subtitle: "Building a year-round music identity",
    type: "Venue and cultural programme",
    location: "Tileyard, King's Cross",
    status: "Artwork pending approval",
    brief:
      "Develop Campfire as a music destination as well as a brewery and taproom, combining regular trading-night programming with larger headline events and cultural moments.",
    delivered:
      "As Campfire's retained promoter, Voices curates and promotes the ongoing music programme, including regular DJ programming, artist and collective sourcing, headline-led day parties, guest takeovers, record fairs, showcases and annual Voices birthday events.",
    scale:
      "The documented partnership extends from at least June 2022 to the present. Campfire's public venue information describes Voices DJs performing regularly on Thursday, Friday and Saturday evenings.",
    proof:
      "Voices birthday events at Campfire in 2022, 2023 and 2024 were publicly listed as sold out. The 2023 birthday and 2026 fifth-birthday event were selected as Resident Advisor Picks.",
  },
  {
    title: "Tate Modern",
    subtitle: "Cultural programme case study",
    type: "Cultural programme",
    location: "London",
    status: "Placeholder pending final details",
    brief:
      "Placeholder for a cultural-programming brief once the exact relationship, scope and approved public wording are confirmed.",
    delivered:
      "Placeholder for what Voices delivered, such as talent curation, programming support, artist liaison, event coordination or broadcast/content support.",
    scale:
      "Placeholder for dates, number of artists, rooms, programme duration or other approved scale details.",
    proof:
      "Placeholder for an approved public proof point. Do not publish attendance, revenue, footfall or impact claims without confirmed evidence.",
  },
  {
    title: "Aperol",
    subtitle: "Brand activation case study",
    type: "Brand activation",
    location: "London",
    status: "Placeholder pending final details",
    brief:
      "Placeholder for a brand-activation brief once the exact campaign, audience, venue context and approved public wording are confirmed.",
    delivered:
      "Placeholder for what Voices delivered, such as DJ or host curation, music-led experience design, workshops, panels, production coordination or content support.",
    scale:
      "Placeholder for dates, number of artists, event format, campaign period or other approved scale details.",
    proof:
      "Placeholder for an approved proof point. Avoid implying commercial performance, audience growth or media impact until substantiated.",
  },
];

const process = [
  {
    title: "Brief",
    description:
      "We understand the space, audience, objectives, dates and budget.",
  },
  {
    title: "Curate",
    description:
      "We shape the musical direction and recommend appropriate talent.",
  },
  {
    title: "Confirm",
    description:
      "We agree the programme, commercial terms and production requirements.",
  },
  {
    title: "Deliver",
    description:
      "We manage artist communication and the agreed delivery scope.",
  },
  {
    title: "Refine",
    description:
      "For recurring programmes, we review and evolve the calendar over time.",
  },
];

function SectionHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center md:mb-14">
      <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-voices-purple">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-black leading-tight text-slate-900 sm:text-4xl md:text-5xl">
        {title}
      </h2>
      <div className="mt-5 text-base font-semibold leading-relaxed text-slate-600 md:text-lg">
        {children}
      </div>
    </div>
  );
}

export default function AgencyPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <a href="#home" className="flex items-center gap-2">
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

          <div className="hidden items-center gap-6 md:flex">
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
            className="inline-flex items-center gap-2 rounded-full bg-voices-purple px-4 py-2 text-sm font-black text-white transition hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-voices-purple focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Start a brief
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </nav>

      <section
        id="home"
        className="relative flex min-h-screen items-center overflow-hidden bg-slate-950 px-4 pt-24 text-white sm:px-6 lg:px-8"
      >
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "radial-gradient(circle at 18% 22%, rgba(95, 92, 243, 0.35), transparent 28%), linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 0.76)), url('/studio-2.jpg')",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-center text-center">
          <div className="mx-auto max-w-4xl">
            <p className="mb-5 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-white/90">
              London music programming
            </p>
            <h1 className="text-4xl font-black leading-tight sm:text-5xl md:text-7xl">
              Voices Agency
              <span className="block text-voices-purple">
                programmed for your space.
              </span>
            </h1>
            <p className="mt-6 max-w-3xl text-lg font-semibold leading-relaxed text-slate-200 md:text-2xl">
              Music programming and talent curation for venues, hospitality
              groups, brands and events - from one-off bookings to fully managed
              calendars.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href={briefHref}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-voices-purple px-8 py-4 text-base font-black text-white transition hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-voices-purple focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Start a brief
                <ArrowRight className="h-5 w-5" />
              </a>
              <a
                href="#work"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white px-8 py-4 text-base font-black text-white transition hover:bg-white hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                See our work
              </a>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <a
            href="#offer"
            aria-label="Scroll to offer"
            className="text-white/85 flex flex-col items-center gap-2 transition hover:text-voices-purple"
          >
            <span className="text-xs font-black uppercase tracking-[0.18em]">
              Scroll
            </span>
            <ArrowDown className="h-7 w-7 animate-bounce" />
          </a>
        </div>
      </section>

      <section
        id="offer"
        className="bg-slate-50 px-4 py-16 sm:px-6 md:py-24 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="The proposition"
            title="More than filling a DJ slot."
          >
            <p>
              Music shapes how a space feels and how people experience it. We
              begin with your audience, venue, trading rhythm and creative
              ambition, then build the right programme around them.
            </p>
          </SectionHeader>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <article
                  key={service.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mb-5 inline-flex rounded-2xl bg-voices-purple/10 p-3 text-voices-purple">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-600">
                    {service.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="formats"
        className="bg-white px-4 py-16 sm:px-6 md:py-24 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Engagement formats"
            title="One brief, one programming partner."
          >
            <p>
              We can support a single date, a recurring residency, a complete
              calendar or a larger music-led activation.
            </p>
          </SectionHeader>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
            {formats.map((format, index) => (
              <div
                key={format.label}
                className="grid gap-4 border-b border-slate-200 p-6 last:border-b-0 md:grid-cols-[10rem_1fr_9rem] md:items-center"
              >
                <p className="font-mono text-sm font-black text-voices-purple">
                  {format.rhythm}
                </p>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {format.label}
                  </h3>
                  <p className="mt-1 font-semibold text-slate-600">
                    {format.bestFor}
                  </p>
                </div>
                <div className="flex gap-1 md:justify-end">
                  {Array.from({ length: 4 }).map((_, dotIndex) => (
                    <span
                      key={dotIndex}
                      className={`h-2.5 w-2.5 rounded-full ${
                        dotIndex <= index ? "bg-voices-purple" : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="work"
        className="bg-slate-950 px-4 py-16 text-white sm:px-6 md:py-24 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-10 max-w-3xl text-center md:mb-14">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-voices-purple">
              Selected work
            </p>
            <h2 className="text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl">
              Programmes with a point of view.
            </h2>
            <p className="mt-5 text-base font-semibold leading-relaxed text-slate-300 md:text-lg">
              Four proof blocks for the first production version. Confirmed case
              studies are condensed from the supplied brief; placeholders are
              intentionally cautious until final details are approved.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {caseStudies.map((study, index) => (
              <article
                key={study.title}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white text-slate-900 shadow-2xl"
              >
                <div className="min-h-56 relative overflow-hidden bg-slate-900 p-6 text-white">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, rgba(95, 92, 243, 0.55), rgba(15, 23, 42, 0.96)), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.24), transparent 24%)",
                    }}
                  />
                  <div className="absolute left-6 right-6 top-6 flex items-center justify-between gap-4">
                    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em]">
                      {study.type}
                    </span>
                    <span className="font-mono text-sm font-black text-white/70">
                      0{index + 1}
                    </span>
                  </div>
                  <div className="relative z-10 pt-20">
                    <h3 className="text-3xl font-black">{study.title}</h3>
                    <p className="mt-2 text-lg font-bold text-white/80">
                      {study.subtitle}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold text-white/75">
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-voices-purple" />
                        {study.location}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-voices-purple" />
                        {study.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 p-6 md:p-8">
                  {[
                    ["Brief", study.brief],
                    ["Delivered", study.delivered],
                    ["Scale", study.scale],
                    ["Proof point", study.proof],
                  ].map(([label, text]) => (
                    <div key={label}>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-voices-purple">
                        {label}
                      </p>
                      <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">
                        {text}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-voices-purple">
              Why Voices
            </p>
            <h2 className="text-3xl font-black leading-tight text-slate-900 sm:text-4xl md:text-5xl">
              Built inside a working music community.
            </h2>
            <p className="mt-5 text-lg font-semibold leading-relaxed text-slate-600">
              Our insight comes from daily contact with DJs, broadcasters,
              musicians and creative contributors. This allows us to discover
              new talent, understand different audiences and build programmes
              with a genuine point of view.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Curation rather than supply",
              "One-off and long-term capability",
              "Cultural credibility and commercial understanding",
              "Breadth across DJs, live talent, hosts and content",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <CheckCircle2 className="mb-4 h-6 w-6 text-voices-purple" />
                <p className="font-black text-slate-900">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="process"
        className="bg-white px-4 py-16 sm:px-6 md:py-24 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="How it works"
            title="From first brief to delivery."
          >
            <p>
              Clients get one accountable point of contact from curation through
              delivery, with clear programming decisions and consolidated
              communication.
            </p>
          </SectionHeader>

          <div className="grid gap-4 md:grid-cols-5">
            {process.map((step, index) => (
              <article
                key={step.title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <p className="font-mono text-sm font-black text-voices-purple">
                  0{index + 1}
                </p>
                <h3 className="mt-5 text-xl font-black text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-600">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-4 py-16 text-white sm:px-6 md:py-24 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-voices-purple">
              Impact
            </p>
            <h2 className="text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
              Commercial programming with a wider purpose.
            </h2>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-8">
            <p className="text-xl font-semibold leading-relaxed text-slate-100">
              Every commercial programme expands the paid opportunities
              available across our creative community and strengthens the wider
              Voices platform.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ["Hundreds", "creative contributors"],
                ["Regular", "paid opportunities"],
                ["London", "music community"],
              ].map(([stat, label]) => (
                <div key={stat} className="bg-slate-950/45 rounded-2xl p-4">
                  <p className="text-2xl font-black text-voices-purple">
                    {stat}
                  </p>
                  <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-slate-300">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="brief"
        className="bg-white px-4 py-16 sm:px-6 md:py-24 lg:px-8"
      >
        <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center shadow-lg md:p-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-voices-purple/10 text-voices-purple">
            <ClipboardList className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 md:text-5xl">
            Tell us what you are programming.
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg font-semibold leading-relaxed text-slate-600">
            Share the venue, event or programme you have in mind. Include the
            space, audience, dates, desired atmosphere, budget and any content
            requirements, and we will help shape the right approach.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={briefHref}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-voices-purple px-8 py-4 text-base font-black text-white transition hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-voices-purple focus:ring-offset-2 focus:ring-offset-white"
            >
              Start your brief
              <ArrowRight className="h-5 w-5" />
            </a>
            <a
              href="mailto:bookings@voicesradio.co.uk"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-slate-900 px-8 py-4 text-base font-black text-slate-900 transition hover:bg-slate-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 focus:ring-offset-white"
            >
              bookings@voicesradio.co.uk
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xl font-black">Voices Agency</p>
            <p className="mt-2 max-w-xl text-sm font-semibold text-slate-300">
              Music programming and talent curation for venues, brands and
              events. Operated through the Voices commercial platform.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm font-bold text-slate-300">
            <a href="#offer" className="transition hover:text-voices-purple">
              Offer
            </a>
            <a href="#work" className="transition hover:text-voices-purple">
              Work
            </a>
            <a href={briefHref} className="transition hover:text-voices-purple">
              Start a brief
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
