import ApplySection from "./apply";
import PartnersSection from "./partners";

export const runtime = "edge";

export const revalidate = 10;

export default async function Home() {
  return (
    <main>
      {/* @ts-ignore */}
      <ApplySection />

      {/* @ts-ignore */}
      <PartnersSection />
    </main>
  );
}
