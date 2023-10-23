"use client";

import useLiveInfoV2 from "@/hooks/use-live-info-v2";
import Play from "@/icons/play";
import Spinner from "@/icons/spinner";
import Stop from "@/icons/stop";
import { unescapeString } from "@/lib/unescape";
import { format } from "date-fns";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { FallbackProps } from "react-error-boundary";
import Marquee from "react-fast-marquee";

function formatDateToHour(date: Date | string) {
  return format(new Date(date), "HH:mm");
}

export default function NowPlaying({
  style,
  withPlayer = true,
}: {
  style: CSSProperties;
  withPlayer?: boolean;
}) {
  const { data } = useLiveInfoV2();

  const ref = useRef<HTMLAudioElement>(null);

  const [loading, loadingSet] = useState(false);
  const [playing, playingSet] = useState(false);

  const play = async () => {
    const el = ref.current;
    if (!el) {
      return;
    }

    loadingSet(true);

    el.src = "https://voicesradio.out.airtime.pro/voicesradio_a";

    await el.play();

    loadingSet(false);

    playingSet(true);
  };

  const stop = () => {
    const el = ref.current;
    if (!el) {
      return;
    }

    el.src = "";

    playingSet(false);
  };

  useEffect(() => {
    if ("mediaSession" in navigator && data) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: data.shows.current
          ? unescapeString(data.shows.current.name)
          : "Live DJ",
        artist: "Voices Radio",
      });
    }
  }, [playing, data]);

  return (
    <div
      className="relative h-12 rounded-lg bg-white p-2 lg:mr-10"
      style={style}
    >
      {withPlayer ? <audio ref={ref} controls={false} hidden /> : null}

      <div className="flex gap-4 overflow-hidden">
        {withPlayer ? (
          playing ? (
            <button className="h-8 w-8" onClick={stop}>
              <Stop />
              <div className="sr-only">Stop</div>
            </button>
          ) : loading || !data ? (
            <div className="p-1">
              <Spinner />
            </div>
          ) : (
            <button className="h-8 w-8" onClick={play}>
              <Play />
              <div className="sr-only">Play</div>
            </button>
          )
        ) : null}

        <div className="min-w-0 flex-1">
          {data ? (
            data.shows.current ? (
              <Marquee
                autoFill
                gradient
                gradientColor="#ffffff"
                gradientWidth={40}
              >
                <div className="mr-14 inline-flex gap-5 whitespace-nowrap text-inter-text-black">
                  <p className="font-semibold tabular-nums">
                    {formatDateToHour(data.shows.current.starts)} &ndash;{" "}
                    {formatDateToHour(data.shows.current.ends)}
                  </p>
                  <p>
                    {data.shows.current
                      ? unescapeString(data.shows.current.name)
                      : "Live DJ"}
                  </p>
                </div>
              </Marquee>
            ) : data.shows.current === null &&
              data.tracks.current &&
              data.tracks.current?.type === "livestream" ? (
              <Marquee
                autoFill
                gradient
                gradientColor="#ffffff"
                gradientWidth={40}
              >
                <p className="mr-10 whitespace-nowrap text-inter-text-black uppercase">
                  Live DJ
                </p>
              </Marquee>
            ) : (
              <Marquee
                autoFill
                gradient
                gradientColor="#ffffff"
                gradientWidth={40}
              >
                <p className="mr-10 whitespace-nowrap text-inter-text-black uppercase">
                  Station Offline
                </p>
              </Marquee>
            )
          ) : (
            <p className="text-inter-text-black uppercase">
              Loading Station...
            </p>
          )}
        </div>
      </div>

      {/* Tail */}
      <svg
        className="absolute -right-11 top-1/2 hidden -translate-y-1/2 lg:inline"
        width="44"
        height="17"
        viewBox="0 0 44 17"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12.6888 9.06325C9.62128 8.85873 6.95873 7.77153 4.86053 5.42478C3.28111 3.65767 1.67934 1.91021 0.0776504 0.162839L0 0.078125L7.51084e-08 11.9047C1.25242 12.9978 2.58794 13.979 4.06581 14.7724C8.30567 17.0485 12.5913 17.0298 16.9038 15.0306C19.0848 14.0192 21.0506 12.676 22.7717 10.9912C23.6602 10.1196 24.5159 9.21403 25.3913 8.32882C27.4754 6.21821 29.8851 4.62126 32.7222 3.70069C34.7726 3.03381 36.8814 2.77376 39.0345 2.79143C40.5318 2.80532 42.0275 2.79371 43.5224 2.78523C43.6767 2.78317 43.883 2.86191 44 2.58069C43.8239 2.47661 43.658 2.35351 43.471 2.27157C39.4726 0.523367 35.3317 0.00745414 31.0378 0.838051C29.3442 1.16435 27.7434 1.77469 26.2599 2.63382C24.9682 3.38224 23.7863 4.30725 22.7793 5.43465C22.2112 6.07128 21.5821 6.64811 20.8542 7.11316C18.3576 8.71021 15.6054 9.25734 12.6888 9.06325Z"
          fill="#fff"
        />
      </svg>
    </div>
  );
}

export function NowPlayingFallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <div
      className="relative h-12 rounded-lg bg-white p-2 lg:mr-10"
      style={{ gridArea: "player" }}
    >
      <div className="flex gap-4 overflow-hidden">
        <button className="h-8 w-8" onClick={() => resetErrorBoundary()}>
          <Play />
          <div className="sr-only">Play</div>
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-inter-text-black uppercase">
            Error Loading Station...
          </p>
        </div>
      </div>

      {/* Tail */}
      <svg
        className="absolute -right-11 top-1/2 hidden -translate-y-1/2 lg:inline"
        width="44"
        height="17"
        viewBox="0 0 44 17"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12.6888 9.06325C9.62128 8.85873 6.95873 7.77153 4.86053 5.42478C3.28111 3.65767 1.67934 1.91021 0.0776504 0.162839L0 0.078125L7.51084e-08 11.9047C1.25242 12.9978 2.58794 13.979 4.06581 14.7724C8.30567 17.0485 12.5913 17.0298 16.9038 15.0306C19.0848 14.0192 21.0506 12.676 22.7717 10.9912C23.6602 10.1196 24.5159 9.21403 25.3913 8.32882C27.4754 6.21821 29.8851 4.62126 32.7222 3.70069C34.7726 3.03381 36.8814 2.77376 39.0345 2.79143C40.5318 2.80532 42.0275 2.79371 43.5224 2.78523C43.6767 2.78317 43.883 2.86191 44 2.58069C43.8239 2.47661 43.658 2.35351 43.471 2.27157C39.4726 0.523367 35.3317 0.00745414 31.0378 0.838051C29.3442 1.16435 27.7434 1.77469 26.2599 2.63382C24.9682 3.38224 23.7863 4.30725 22.7793 5.43465C22.2112 6.07128 21.5821 6.64811 20.8542 7.11316C18.3576 8.71021 15.6054 9.25734 12.6888 9.06325Z"
          fill="#fff"
        />
      </svg>
    </div>
  );
}
