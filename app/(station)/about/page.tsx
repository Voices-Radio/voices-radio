import { getAbout } from "@/sanity.client";
import { Metadata } from "next";
import AboutStory from "./about-story";

export const metadata: Metadata = {
  title: "About",
  openGraph: { title: "About" },
  twitter: { title: "About" },
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const about = await getAbout();

  if (!about) {
    return (
      <main id="main-content" className="scroll-mt-24">
        <section className="relative flex aspect-[4/3] items-center justify-center bg-slate-800 md:aspect-[4/2]">
          <div className="text-center text-white">
            <h1 className="mb-4 text-2xl font-bold">About Voices Radio</h1>
            <p>Content loading...</p>
          </div>
        </section>
      </main>
    );
  }

  return <AboutStory about={about} />;
}
