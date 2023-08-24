import ApplySection from "./apply";
import CommunitySection from "./community";
import HeroSection from "./hero";
import PartnersSection from "./partners";

export const runtime = "edge";

export const revalidate = false;

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
