"use client";

import { useCallback, useEffect, useRef } from "react";
import { useGlobalAudioPlayer } from "react-use-audio-player";

export default function LivePlayer({ title }: { title: string }) {
  const _isMounted = useRef(false);

  useEffect(() => {
    _isMounted.current = true;

    return () => {
      _isMounted.current = false;
    };
  }, []);

  const isMounted = useCallback(() => _isMounted.current, []);

  const { load, stop, play, playing } = useGlobalAudioPlayer();

  useEffect(() => {
    if (isMounted()) {
      load("https://voicesradio.out.airtime.pro/voicesradio_a", {
        html5: true,
        format: "mp3",
      });
    }
  }, [isMounted, load, title]);

  useEffect(() => {
    if ("mediaSession" in navigator && playing) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: title,
        artist: "Voices Radio",
        // artwork: [
        //   {
        //     src: scheduleData.liveNow.artwork,
        //     sizes: "1024x1024",
        //     type: "image/png",
        //   },
        // ],
      });
    }
  }, [title, playing]);

  return (
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
        <button onClick={() => play()}>
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
  );
}
