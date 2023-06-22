import { getHome, getSettings } from "@/sanity.client";
import SocialLink from "../social-link";
import Link from "next/link";
import Image from "next/image";

export default async function MenuDialog() {
  const settings = await getSettings();
  const home = await getHome();

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-6 lg:gap-10">
        <Link
          className="text-kinfolk-navigation text-center font-kinfolk text-white"
          href="/about"
        >
          About
        </Link>

        <a
          className="text-kinfolk-navigation text-center font-kinfolk text-white"
          href={settings.mixcloud_link}
          target="_blank"
          rel="noopener"
        >
          Archive
        </a>

        <a
          className="text-kinfolk-navigation text-center font-kinfolk text-white"
          href={settings.store_link}
          target="_blank"
          rel="noopener"
        >
          Store
        </a>

        <a
          className="text-kinfolk-navigation text-center font-kinfolk text-white"
          href={home.apply_cta_url}
          target="_blank"
          rel="noopener"
        >
          Apply!
        </a>

        <a
          className="text-kinfolk-navigation text-center font-kinfolk text-white"
          href={settings.contact_link}
        >
          Contact
        </a>
      </div>

      <Image
        src="/voices.svg"
        width={310 * 0.6}
        height={333 * 0.6}
        alt=""
        priority
        className="mx-auto mt-14 object-contain invert lg:hidden"
      />

      <div className="mt-14 flex justify-center gap-8">
        <SocialLink type="twitter" url={settings.twitter_link} />

        <SocialLink type="instagram" url={settings.instagram_link} />

        <SocialLink type="facebook" url={settings.facebook_link} />

        <SocialLink type="linkedin" url={settings.linkedin_link} />

        <SocialLink type="mixcloud" url={settings.mixcloud_link} />
      </div>
    </div>
  );
}
