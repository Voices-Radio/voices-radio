import { Metadata } from "next";
import ApplySection from "../apply";
import PartnersSection from "../partners";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "About",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  return (
    <main>
      <section className="px-6 md:px-8 pt-6 pb-12 md:py-28 relative overflow-hidden bg-voices-beige"></section>

      {/* @ts-expect-error Async Server Components */}
      <ApplySection />

      {/* @ts-expect-error Async Server Components */}
      <PartnersSection />
    </main>
  );
}
