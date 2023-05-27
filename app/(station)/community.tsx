import { getHome } from "@/sanity.client";
import Link from "next/link";

export default async function CommunitySection() {
  const home = await getHome();

  return (
    <section
      className="px-8 py-28 relative overflow-hidden bg-voices-beige"
      id="community"
    >
      <div className="flex flex-col md:flex-row-reverse gap-10">
        <div className="flex-1">IMAGE CAROUSEL HERE</div>

        <div className="flex-1 flex flex-col items-center gap-10">
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
