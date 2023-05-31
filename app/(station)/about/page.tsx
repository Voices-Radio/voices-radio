import { Metadata } from "next";
import Image from "next/image";
import ApplySection from "../apply";
import CommunitySection from "../community";
import PartnersSection from "../partners";

export const runtime = "edge";

export const revalidate = 10;

export const metadata: Metadata = {
  title: "About",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  return (
    <main>
      <section className="relative aspect-[16/8]">
        <Image
          alt=""
          className="object-cover"
          draggable={false}
          fill
          priority
          src="/brutalism.jpeg"
        />
      </section>

      {/* @ts-expect-error Async Server Components */}
      <CommunitySection />

      {/* @ts-expect-error Async Server Components */}
      <ApplySection />

      {/* @ts-expect-error Async Server Components */}
      <PartnersSection />
    </main>
  );
}
