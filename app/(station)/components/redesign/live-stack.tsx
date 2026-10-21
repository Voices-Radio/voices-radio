"use client";

import { useRef, useState } from "react";
import {
  getVoicesLiveStation,
  VOICES_MIXCLOUD_LIVE_URL,
  type VoicesLiveStationId,
} from "@/lib/voices/config";
import type { HomeLiveStreamConfig } from "@/lib/voices/home";
import { stopLiveAudio } from "@/hooks/use-station-audio";
import { EastComingSoonCard } from "./east-coming-soon";
import { useLiveAudio } from "./live-audio-context";
import LiveStationCard from "./live-station-card";
import RestreamVideoModal from "./restream-video-modal";

// The station image, used until the live feed names the artist on air (see
// LiveStationCard). Never the latest upload: that show is no longer on air.
function getLiveArtwork(
  fallback: HomeLiveStreamConfig | undefined,
  station: "KX" | "East",
) {
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
  kxFallback,
  eastFallback,
  mixcloudLiveUrl,
}: {
  kxFallback?: HomeLiveStreamConfig;
  eastFallback?: HomeLiveStreamConfig;
  mixcloudLiveUrl?: string;
}) {
  const kxArtwork = getLiveArtwork(kxFallback, "KX");
  const eastArtwork = getLiveArtwork(eastFallback, "East");
  const kxStation = getVoicesLiveStation("kx");
  const eastStation = getVoicesLiveStation("east");
  const [selectedStation, setSelectedStation] =
    useState<VoicesLiveStationId | null>(null);
  const [videoStation, setVideoStation] = useState<VoicesLiveStationId | null>(
    null,
  );
  const [videoOpen, setVideoOpen] = useState(false);
  const kxAudio = useLiveAudio("kx");
  const eastAudio = useLiveAudio("east");
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

  function listenLive(stationId: VoicesLiveStationId) {
    const station = getVoicesLiveStation(stationId);
    if (!station?.streamUrl || station.comingSoon) return;

    setSelectedStation(stationId);
    setVideoOpen(false);
    // Same instance the header strip uses, so this and its play/pause stay in step.
    void (stationId === "kx" ? kxAudio : eastAudio).toggle();
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
          title={kxStation?.title ?? "Live from Voices KX"}
          artwork={kxArtwork.src}
          artworkAlt={kxArtwork.alt}
          videoUrl={kxStation?.videoUrl}
          watchLiveUrl={mixcloudLiveUrl ?? VOICES_MIXCLOUD_LIVE_URL}
          canListenLive={Boolean(kxStation?.streamUrl)}
          listenPlaying={kxAudio.playing}
          listenLoading={kxAudio.loading}
          selected={selectedStation === "kx"}
          onSelect={() => setSelectedStation("kx")}
          onWatchLive={() => watchLive("kx")}
          onListenLive={() => listenLive("kx")}
        />
        {eastStation?.comingSoon ? (
          <EastComingSoonCard />
        ) : (
          <LiveStationCard
            cardRef={eastCardRef}
            stationId="east"
            station="EAST"
            title={eastStation?.title ?? "Live from Voices East"}
            artwork={eastArtwork.src}
            artworkAlt={eastArtwork.alt}
            videoUrl={eastStation?.videoUrl}
            canListenLive={Boolean(eastStation?.streamUrl)}
            listenPlaying={eastAudio.playing}
            listenLoading={eastAudio.loading}
            selected={selectedStation === "east"}
            onSelect={() => setSelectedStation("east")}
            onWatchLive={() => watchLive("east")}
            onListenLive={() => listenLive("east")}
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
