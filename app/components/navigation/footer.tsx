import { getSettings } from "@/sanity.client";
import Image from "next/image";
import SocialLink from "./social-link";
import { PortableText } from "@portabletext/react";

export default async function Footer() {
  const settings = await getSettings();

  return (
    <footer className="bg-black p-10 pb-20 text-white">
      <div className="mx-auto max-w-[90rem]">
        <div className="flex flex-col gap-8 md:flex-row">
          <div className="hidden flex-1 md:block">
            <address className="whitespace-pre-line text-inter-text-small not-italic">
              <PortableText value={settings.address} />
            </address>
          </div>

          <div className="flex flex-1 justify-center gap-8">
            <SocialLink type="twitter" url={settings.twitter_link} />

            <SocialLink type="instagram" url={settings.instagram_link} />

            <SocialLink type="facebook" url={settings.facebook_link} />

            <SocialLink type="linkedin" url={settings.linkedin_link} />

            <SocialLink type="mixcloud" url={settings.mixcloud_link} />
          </div>

          <div className="flex flex-1 justify-center md:justify-end">
            <a
              className="text-center text-mobile-inter-text md:text-right md:text-inter-text"
              href={settings.contact_link}
            >
              Contact Us
            </a>
          </div>
        </div>

        <div className="mt-12 flex justify-center md:mt-0">
          <Image
            src="/voices-circle-old.svg"
            className="w-64 md:w-80"
            width={320}
            height={320}
            alt="Voices Logo"
          />
        </div>

        <p className="mt-12 text-center text-mobile-inter-xsmall">
          Designed by{" "}
          <a
            className="underline"
            target="_blank"
            rel="noopener"
            href="https://www.studiopanorama.de/?lang=en"
          >
            <span className="tracking-widest">panorama</span>
          </a>
          . Built by{" "}
          <a
            className="underline"
            target="_blank"
            rel="noopener"
            href="https://reiner.systems"
          >
            mirshko
          </a>
          . <br className="sm:hidden" />
          Powered by{" "}
          <a
            target="_blank"
            rel="noopener"
            href="https://vercel.com/?utm_source=voicesradio&utm_campaign=oss"
          >
            <Image
              className="inline h-3 w-auto"
              width={53}
              height={12}
              src="/vercel-logotype-light.svg"
              alt="Vercel"
            />
          </a>
        </p>
      </div>
    </footer>
  );
}
