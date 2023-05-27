"use client";

import useLiveInfoV2, { Show } from "@/hooks/use-live-info-v2";
import { format } from "date-fns";
import { useGlobalAudioPlayer } from "react-use-audio-player";

function renderTimetable(show: Show) {
  return `${format(new Date(show.starts), "HH:mm")} - 
${format(new Date(show.ends), "HH:mm")}`;
}

export default function NowPlaying() {
  const { data } = useLiveInfoV2();

  const { load, stop, play, playing } = useGlobalAudioPlayer();

  // const title = data?.shows?.current?.name ?? "Live DJ";

  // useEffect(() => {
  //   if ("mediaSession" in navigator && playing && data) {
  //     navigator.mediaSession.metadata = new MediaMetadata({
  //       title: title,
  //       artist: "Voices Radio",
  //     });
  //   }
  // }, [data, playing]);

  return (
    <div className="relative h-12 flex gap-4 p-2 bg-white rounded-lg mr-10">
      <div>
        {playing ? (
          <button onClick={() => stop()}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-8 h-8"
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
                onplay() {
                  console.log("play");
                },
              });

              play();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-8 h-8"
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
        <p className="text-inter-text-black whitespace-nowrap">
          <span className="font-semibold tabular-nums">
            {renderTimetable(data.shows.current)}
          </span>
          <span> </span>
          <span>{data?.shows?.current?.name ?? "Live DJ"}</span>
        </p>
      ) : (
        <p className="text-inter-text-black uppercase">Loading...</p>
      )}

      <svg
        className="absolute -right-11 top-1/2 -translate-y-1/2"
        width="44"
        height="17"
        viewBox="0 0 44 17"
        fill="none"
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
