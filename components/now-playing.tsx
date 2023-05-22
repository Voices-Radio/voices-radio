"use client";

import useLiveInfoV2 from "@/hooks/use-live-info-v2";
import { format } from "date-fns";
import { useEffect } from "react";
import { useGlobalAudioPlayer } from "react-use-audio-player";

export default async function NowPlaying() {
  const { data } = useLiveInfoV2();

  const { load, stop, play, playing } = useGlobalAudioPlayer();

  const title = data?.shows?.current?.name ?? "Live DJ";

  useEffect(() => {
    if ("mediaSession" in navigator && playing && data) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: title,
        artist: "Voices Radio",
      });
    }
  }, [data, playing]);

  return (
    <div className="flex gap-4 p-2 bg-white rounded">
      <div>
        {playing ? (
          <button onClick={() => stop()}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path
                fillRule="evenodd"
                d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="sr-only">Stop</div>
          </button>
        ) : (
          <button
            onClick={() => {
              load("https://voicesradio.out.airtime.pro/voicesradio_a", {
                html5: true,
                format: "mp3",
              });

              play();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path
                fillRule="evenodd"
                d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                clipRule="evenodd"
              />
            </svg>
            <div className="sr-only">Play</div>
          </button>
        )}
      </div>

      {data ? (
        <>
          <p>{`${format(new Date(data.shows.current.starts), "HH:mm")} - 
  ${format(new Date(data.shows.current.ends), "HH:mm")}`}</p>
          <p>{data?.shows?.current?.name ?? "Live DJ"}</p>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
