import { getHome } from "@/sanity.client";
import { PortableText } from "@portabletext/react";
import Link from "next/link";
import Carousel from "../../components/carousel";

export default async function CommunitySection() {
  const home = await getHome();

  return (
    <section
      className="relative overflow-hidden bg-voices-beige px-6 pb-12 pt-6 md:px-8 md:py-28"
      id="community"
    >
      <div className="mx-auto mb-16 flex max-w-[90rem] flex-col items-center gap-8 lg:flex-row-reverse">
        <div className="flex-1">
          <Carousel images={home.community_carousel} />
        </div>

        <div className="flex flex-1 flex-col items-center gap-8 md:gap-10">
          <h2 className="text-center font-kinfolk text-mobile-kinfolk-headline uppercase md:text-kinfolk-headline">
            {home.community_heading}
          </h2>

          <div className="max-w-lg space-y-4 text-center text-mobile-inter-text md:text-inter-text">
            <PortableText value={home.community_subheading} />
          </div>

          {home.community_cta_text && home.community_cta_url && (
            <Link
              className="rounded-full bg-transparent px-20 py-[1.125rem] text-mobile-inter-text text-black ring-4 ring-inset ring-black md:text-inter-text"
              href={home.community_cta_url}
            >
              {home.community_cta_text}
            </Link>
          )}
        </div>
      </div>

      <div className="mx-auto flex max-w-[90rem] flex-col items-center gap-8 lg:flex-row">
        <div className="flex-1">
          <Carousel images={home.community_carousel_secondary} flipped />
        </div>

        <div className="flex flex-1 flex-col items-center gap-8 md:gap-10">
          <h2 className="text-center font-kinfolk text-mobile-kinfolk-headline uppercase md:text-kinfolk-headline">
            {home.community_heading_secondary}
          </h2>

          <div className="max-w-lg space-y-4 text-center text-mobile-inter-text md:text-inter-text">
            <PortableText value={home.community_subheading_secondary} />
          </div>

          {home.community_cta_url_secondary &&
            home.community_cta_text_secondary && (
              <Link
                className="rounded-full bg-transparent px-20 py-[1.125rem] text-mobile-inter-text text-black ring-4 ring-inset ring-black md:text-inter-text"
                href={home.community_cta_url_secondary}
              >
                {home.community_cta_text_secondary}
              </Link>
            )}
        </div>
      </div>
    </section>
  );
}
