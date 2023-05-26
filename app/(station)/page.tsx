import { getHome } from "@/sanity.client";
import ApplySection from "./apply";
import PartnersSection from "./partners";
import Image from "next/image";
import Badge from "@/components/badge";

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
            <Image
              alt="Voices Logo"
              className="invert"
              height={462}
              src="/voices.svg"
              width={430}
              priority
            />

            <div className="flex gap-2.5 justify-center">
              <Badge>Community</Badge>
              <Badge>Radio</Badge>
              <Badge>London</Badge>
            </div>

            <p className="whitespace-pre-line text-center text-inter-text">
              {home.schedule}
            </p>
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
