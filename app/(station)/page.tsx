import Schedule from "@/components/schedule";
import PartnersSection from "./partners";

export const runtime = "edge";

export const revalidate = 10;

export default async function Home() {
  return (
    <main>
      {/* @ts-ignore */}
      <Schedule />

      {/* @ts-ignore */}
      <PartnersSection />
    </main>
  );
}
