import { getHome } from "@/sanity.client";
import Link from "next/link";

export default async function CommunitySection() {
  const home = await getHome();

  return (
    <section
      className="px-6 md:px-8 pt-6 pb-12 md:py-28 relative overflow-hidden bg-voices-beige"
      id="community"
    >
      <div className="flex flex-col lg:flex-row-reverse gap-8 mb-16 items-center">
        <div className="flex-1">
          <div className="flex items-center justify-center">
            <div className="aspect-video w-[450px] bg-white flex items-center justify-center">
              IMAGE CAROUSEL HERE
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center gap-8 md:gap-10">
          <h2 className="text-center font-kinfolk text-mobile-kinfolk-headline md:text-kinfolk-headline uppercase">
            {home.community_heading}
          </h2>

          <p className="text-mobile-inter-text md:text-inter-text text-center max-w-lg">
            {home.community_subheading}
          </p>

          <Link
            className="rounded-full bg-transparent ring-4 ring-inset ring-black text-black px-20 py-[1.125rem] text-mobile-inter-text md:text-inter-text"
            href={home.community_cta_url}
          >
            {home.community_cta_text}
          </Link>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-center">
        <div className="flex-1">
          <div className="flex items-center justify-center">
            <div className="aspect-[9/16] h-[450px] bg-white flex items-center justify-center">
              IMAGE CAROUSEL HERE
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center gap-8 md:gap-10">
          <h2 className="text-center font-kinfolk text-mobile-kinfolk-headline md:text-kinfolk-headline uppercase">
            {home.community_heading}
          </h2>

          <p className="text-mobile-inter-text md:text-inter-text text-center max-w-lg">
            {home.community_subheading}
          </p>

          <Link
            className="rounded-full bg-transparent ring-4 ring-inset ring-black text-black px-20 py-[1.125rem] text-mobile-inter-text md:text-inter-text"
            href={home.community_cta_url}
          >
            {home.community_cta_text}
          </Link>
        </div>
      </div>
    </section>
  );
}
