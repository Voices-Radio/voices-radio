import type { Metadata } from "next";
import { getBaseUrl } from "@/lib/site-url";
import { CallToAction } from "./_components/CallToAction";
import { ClientStrip } from "./_components/ClientStrip";
import { ContactBlock } from "./_components/ContactBlock";
import { EngagementFormats } from "./_components/EngagementFormats";
import { Footer } from "./_components/Footer";
import { Hero } from "./_components/Hero";
import { HowItWorks } from "./_components/HowItWorks";
import { Impact } from "./_components/Impact";
import { Nav } from "./_components/Nav";
import { Proposition } from "./_components/Proposition";
import { Questions } from "./_components/Questions";
import { SelectedWork } from "./_components/SelectedWork";
import { Testimonials } from "./_components/Testimonials";
import { WhoWeWorkWith } from "./_components/WhoWeWorkWith";
import { WhyVoices } from "./_components/WhyVoices";
import { SHOW_CONTACT_BLOCK, SHOW_TESTIMONIALS } from "./content";

const description =
  "Voices Agency designs and manages music programmes for venues, hotels, brands and cultural spaces across London, from single dates to fully managed multi-space calendars.";

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: "Voices Agency | Music Programming and Talent Curation",
  description,
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
    description,
    url: "/agency",
    type: "website",
  },
  twitter: {
    title: "Voices Agency | Music Programming and Talent Curation",
    description,
    card: "summary_large_image",
  },
};

export default function AgencyPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Nav />
      <Hero />
      <ClientStrip />
      <Proposition />
      <EngagementFormats />
      <WhoWeWorkWith />
      <SelectedWork />
      <WhyVoices />
      <HowItWorks />
      <Impact />
      {/* Testimonials: hold back until quotes are signed off - see content.ts */}
      {SHOW_TESTIMONIALS ? <Testimonials /> : null}
      <Questions />
      {/* Contact block: hold back until name/role/photo are supplied - see content.ts */}
      {SHOW_CONTACT_BLOCK ? <ContactBlock /> : null}
      <CallToAction />
      <Footer />
    </main>
  );
}
