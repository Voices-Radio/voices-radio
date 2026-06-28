import { voicesMediaConfig } from "@/lib/voices/config";
import type { HomeLiveStreamConfig } from "@/lib/voices/home";
import type { VoicesShow } from "@/lib/voices/types";
import LiveStationCard from "./live-station-card";

function getLiveArtwork(
  show: VoicesShow | undefined,
  fallback: HomeLiveStreamConfig | undefined,
  station: "KX" | "East",
) {
  if (show?.artist?.imageUrl) {
    return {
      src: show.artist.imageUrl,
      alt: `${show.artist.name} profile image`,
    };
  }

  if (fallback?.fallbackImageUrl) {
    return {
      src: fallback.fallbackImageUrl,
      alt: fallback.fallbackImageAlt ?? `${station} live artwork`,
    };
  }

  return {
    src: "/VOICESLOGO_LIGHTBOX.png",
    alt: "Voices Radio",
  };
}

export default function LiveStack({
  kxShow,
  eastShow,
  kxFallback,
  eastFallback,
}: {
  kxShow?: VoicesShow;
  eastShow?: VoicesShow;
  kxFallback?: HomeLiveStreamConfig;
  eastFallback?: HomeLiveStreamConfig;
}) {
  const kxArtwork = getLiveArtwork(kxShow, kxFallback, "KX");
  const eastArtwork = getLiveArtwork(eastShow, eastFallback, "East");

  return (
    <div className="grid gap-0 sm:grid-cols-2 md:w-[316px] md:grid-cols-1">
      <LiveStationCard
        station="KX"
        title={kxShow?.title ?? "The Breakfast Show w/ Maria Hanlon"}
        artwork={kxArtwork.src}
        artworkAlt={kxArtwork.alt}
        streamUrl={voicesMediaConfig.radioCult.kxStreamUrl}
        videoUrl={voicesMediaConfig.restream.kxEmbedUrl}
      />
      <LiveStationCard
        station="EAST"
        title={eastShow?.title ?? "Live from Voices East"}
        artwork={eastArtwork.src}
        artworkAlt={eastArtwork.alt}
        streamUrl={voicesMediaConfig.radioCult.eastStreamUrl}
        videoUrl={voicesMediaConfig.restream.eastEmbedUrl}
      />
    </div>
  );
}
