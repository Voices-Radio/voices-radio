import { getSettings } from "@/sanity.client";
import Image from "next/image";
import SocialLink from "./social-link";

export default async function Footer() {
  const settings = await getSettings();

  return (
    <footer className="bg-black p-10 pb-20 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-8 md:flex-row">
          <div className="hidden flex-1 md:block">
            <address className="whitespace-pre-line text-inter-text-small not-italic">
              {settings.address}
            </address>
          </div>

          <div className="flex flex-1 justify-center gap-8">
            <SocialLink type="twitter" url={settings.twitter_link} />

            <SocialLink type="instagram" url={settings.instagram_link} />

            <SocialLink type="facebook" url={settings.facebook_link} />

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
            src="/voices.svg"
            className="w-64 md:w-auto"
            width={310}
            height={333}
            alt="Voices Logo"
          />
        </div>
      </div>
    </footer>
  );
}
