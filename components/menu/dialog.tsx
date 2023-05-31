"use server";

import { getSettings } from "@/sanity.client";
import SocialLink from "../social-link";

export default async function MenuDialog() {
  const settings = await getSettings();

  return (
    <div>
      <div className="flex-1 flex justify-center gap-8">
        <SocialLink type="twitter" url={settings.twitter_link} />

        <SocialLink type="instagram" url={settings.instagram_link} />

        <SocialLink type="facebook" url={settings.facebook_link} />

        <SocialLink type="mixcloud" url={settings.mixcloud_link} />
      </div>
    </div>
  );
}
