import { Suspense } from "react";
import { getSettings } from "@/sanity.client";
import ExploreLiveStrip from "../../explore/explore-live-strip";
import ArchiveMiniPlayer from "./archive-mini-player";
import { ArchivePlayerProvider } from "./archive-player-context";
import { FavouritesProvider } from "./favourites-context";
import SaveIntentReplay from "./save-intent-replay";
import SiteFooter from "./site-footer";
import SiteHeader from "./site-header";

export default async function RedesignShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <ArchivePlayerProvider>
      <FavouritesProvider>
        <div className="min-h-screen bg-voicesNext-background px-2 text-voicesNext-cream md:px-0">
          <a
            href="#main-content"
            className="sr-only z-[60] rounded-full bg-voicesNext-cream px-4 py-2 font-gabarito text-sm font-bold text-voicesNext-background focus:not-sr-only focus:fixed focus:left-2 focus:top-2"
          >
            Skip to content
          </a>
          <SiteHeader
            settings={{
              contactLink: settings?.contact_link,
              storeLink: settings?.store_link,
              instagramLink: settings?.instagram_link,
              mixcloudLink: settings?.mixcloud_link,
            }}
          />
          <ExploreLiveStrip />
          {children}
          <SiteFooter contactUrl={settings?.contact_link} />
          <ArchiveMiniPlayer />
          {/* useSearchParams() inside requires its own Suspense boundary
              so it never opts the rest of this (otherwise static) shell
              into client-only rendering. */}
          <Suspense fallback={null}>
            <SaveIntentReplay />
          </Suspense>
        </div>
      </FavouritesProvider>
    </ArchivePlayerProvider>
  );
}
