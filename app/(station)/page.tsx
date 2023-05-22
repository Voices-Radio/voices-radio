import { getHome } from "@/sanity.client";
import ApplySection from "./apply";
import PartnersSection from "./partners";

export const runtime = "edge";

export const revalidate = 10;

export default async function Home() {
  const home = await getHome();

  return (
    <main>
      <section>
        <div>
          <div>Video Here</div>
          <div>
            <p>Play Button Here</p>

            <p className="whitespace-pre-line text-center">{home.schedule}</p>
          </div>
        </div>
      </section>

      {/* @ts-ignore */}
      <ApplySection />

      {/* @ts-ignore */}
      <PartnersSection />
    </main>
  );
}
