"use client";

import { useRef, useState } from "react";
import {
  getVoicesLiveStation,
  type VoicesLiveStationId,
} from "@/lib/voices/config";
import type { HomeLiveStreamConfig } from "@/lib/voices/home";
import type { VoicesShow } from "@/lib/voices/types";
import { stopLiveAudio } from "@/hooks/use-station-audio";
import { EastComingSoonCard } from "./east-coming-soon";
import LiveStationCard from "./live-station-card";
import RestreamVideoModal from "./restream-video-modal";

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
  const kxStation = getVoicesLiveStation("kx");
  const eastStation = getVoicesLiveStation("east");
  const [selectedStation, setSelectedStation] =
    useState<VoicesLiveStationId | null>(null);
  const [videoStation, setVideoStation] = useState<VoicesLiveStationId | null>(
    null,
  );
  const [videoOpen, setVideoOpen] = useState(false);
  const kxCardRef = useRef<HTMLButtonElement>(null);
  const eastCardRef = useRef<HTMLButtonElement>(null);
  const activeVideoStation = videoStation
    ? getVoicesLiveStation(videoStation)
    : undefined;

  function watchLive(stationId: VoicesLiveStationId) {
    const station = getVoicesLiveStation(stationId);
    if (!station?.videoUrl || station.comingSoon) return;

    setSelectedStation(stationId);
    setVideoStation(stationId);
    stopLiveAudio();
    setVideoOpen(true);
  }

  function handleVideoOpenChange(open: boolean) {
    setVideoOpen(open);
    if (!open) setSelectedStation(null);
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-0 md:w-[316px] md:grid-cols-1">
        <LiveStationCard
          cardRef={kxCardRef}
          stationId="kx"
          station="KX"
          title={kxShow?.title ?? "The Breakfast Show w/ Maria Hanlon"}
          artwork={kxArtwork.src}
          artworkAlt={kxArtwork.alt}
          videoUrl={kxStation?.videoUrl}
          selected={selectedStation === "kx"}
          onSelect={() => setSelectedStation("kx")}
          onWatchLive={() => watchLive("kx")}
        />
        {eastStation?.comingSoon ? (
          <EastComingSoonCard />
        ) : (
          <LiveStationCard
            cardRef={eastCardRef}
            stationId="east"
            station="EAST"
            title={eastShow?.title ?? "Live from Voices East"}
            artwork={eastArtwork.src}
            artworkAlt={eastArtwork.alt}
            videoUrl={eastStation?.videoUrl}
            selected={selectedStation === "east"}
            onSelect={() => setSelectedStation("east")}
            onWatchLive={() => watchLive("east")}
          />
        )}
      </div>
      <RestreamVideoModal
        label={activeVideoStation?.label ?? "Voices"}
        videoUrl={activeVideoStation?.videoUrl}
        open={videoOpen}
        onOpenChange={handleVideoOpenChange}
        returnFocusRef={videoStation === "east" ? eastCardRef : kxCardRef}
      />
    </>
  );
}
