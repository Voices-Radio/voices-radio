import { getSettings } from "@/sanity.client";
import ExploreLiveStrip from "../../explore/explore-live-strip";
import SiteFooter from "./site-footer";
import SiteHeader from "./site-header";

export default async function RedesignShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <div className="min-h-screen bg-voicesNext-background px-2 text-voicesNext-cream md:px-0">
      <a
        href="#main-content"
        className="sr-only z-[60] rounded-full bg-voicesNext-cream px-4 py-2 font-gabarito text-sm font-bold text-voicesNext-background focus:not-sr-only focus:fixed focus:left-2 focus:top-2"
      >
        Skip to content
      </a>
      <SiteHeader
        settings={{
          applyLink: settings?.apply_link,
          contactLink: settings?.contact_link,
          storeLink: settings?.store_link,
          instagramLink: settings?.instagram_link,
          mixcloudLink: settings?.mixcloud_link,
        }}
      />
      <ExploreLiveStrip />
      {children}
      <SiteFooter
        supporterUrl={settings?.apply_link}
        contactUrl={settings?.contact_link}
      />
    </div>
  );
}
