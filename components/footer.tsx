import { getSettings } from "@/sanity.client";
import Image from "next/image";
import SocialLink from "./social-link";

export default async function Footer() {
  const settings = await getSettings();

  return (
    <div className="bg-black text-white p-10 pb-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex md:flex-row flex-col gap-8">
          <div className="flex-1 hidden md:block">
            <address className="text-inter-text-small not-italic whitespace-pre-line">
              {settings.address}
            </address>
          </div>

          <div className="flex-1 flex justify-center gap-8">
            <SocialLink type="twitter" url={settings.twitter_link} />

            <SocialLink type="instagram" url={settings.instagram_link} />

            <SocialLink type="facebook" url={settings.facebook_link} />

            <SocialLink type="mixcloud" url={settings.mixcloud_link} />
          </div>

          <div className="flex-1 flex justify-center md:justify-end">
            <a
              className="text-center text-mobile-inter-text md:text-right md:text-inter-text"
              href={settings.contact_link}
            >
              Contact Us
            </a>
          </div>
        </div>

        <div className="flex justify-center mt-12 md:mt-0">
          <Image src="/voices.svg" width={310} height={333} alt="Voices Logo" />
        </div>
      </div>
    </div>
  );
}
