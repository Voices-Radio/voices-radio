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

      if ("mediaSession" in navigator) {
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
    }
  }, [isMounted, load, title]);

  return (
    <div>
      {playing ? (
        <button onClick={() => stop()}>Stop</button>
      ) : (
        <button onClick={() => play()}>Play</button>
      )}
    </div>
  );
}
