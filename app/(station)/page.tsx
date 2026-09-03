import type { Metadata } from "next";
import ApplySection from "./components/apply";
import CommunitySection from "./components/community";
import HeroSection from "./components/hero";
import PartnersSection from "./components/partners";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <main>
      <HeroSection />

      <CommunitySection />

      <ApplySection />

      <PartnersSection />
    </main>
  );
}
