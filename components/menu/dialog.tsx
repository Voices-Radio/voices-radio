"use server";

import { getHome, getSettings } from "@/sanity.client";
import SocialLink from "../social-link";
import Link from "next/link";
import Image from "next/image";

export default async function MenuDialog() {
  const settings = await getSettings();
  const home = await getHome();

  return (
    <div className="relative mt-16 space-y-14">
      <Image
        src="/voices-element-left.svg"
        width={201}
        height={330}
        alt=""
        priority
        className="absolute left-16 top-1/2 hidden -translate-y-1/2 lg:block xl:left-24"
      />

      <Image
        src="/voices-element-right.svg"
        width={293}
        height={216}
        alt=""
        priority
        className="absolute right-16 top-1/2 hidden -translate-y-1/2 lg:block xl:right-24"
      />

      <nav className="flex flex-col items-center gap-6 lg:gap-10">
        <Link
          className="text-kinfolk-navigation text-center font-kinfolk text-white"
          href="/about"
        >
          About
        </Link>

        <a
          className="text-kinfolk-navigation text-center font-kinfolk text-white"
          href={settings.mixcloud_link}
        >
          Archive
        </a>

        <a
          className="text-kinfolk-navigation text-center font-kinfolk text-white"
          href={settings.store_link}
        >
          Store
        </a>

        <a
          className="text-kinfolk-navigation text-center font-kinfolk text-white"
          href={home.apply_cta_url}
        >
          Apply!
        </a>

        <a
          className="text-kinfolk-navigation text-center font-kinfolk text-white"
          href={settings.contact_link}
        >
          Contact
        </a>
      </nav>

      <Image
        src="/voices-element-left.svg"
        width={96}
        height={157}
        alt=""
        priority
        className="mx-auto lg:hidden"
      />

      <div className="mt-14 flex flex-1 justify-center gap-8">
        <SocialLink type="twitter" url={settings.twitter_link} />

        <SocialLink type="instagram" url={settings.instagram_link} />

        <SocialLink type="facebook" url={settings.facebook_link} />

        <SocialLink type="mixcloud" url={settings.mixcloud_link} />
      </div>
    </div>
  );
}
