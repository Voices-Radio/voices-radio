"use client";

import NowPlaying from "@/app/components/navigation/now-playing";
import { useScript } from "@/hooks/use-script";
import Spinner from "@/icons/spinner";
import Link from "next/link";
import { useRef } from "react";

export default function Chatango() {
  const ref = useRef<HTMLDivElement>(null);

  const status = useScript("https://st.chatango.com/js/gz/emb.js", {
    removeOnUnmount: true,
    id: "cid0020000285987468774",
    ref: ref,
    data: JSON.stringify({
      handle: "voicesradiokx",
      arch: "js",
      styles: {
        a: "000000",
        b: 100,
        c: "FFFFFF",
        d: "FFFFFF",
        k: "000000",
        l: "000000",
        m: "000000",
        n: "FFFFFF",
        p: "10",
        q: "000000",
        r: 100,
        showx: 0,
        surl: 0,
      },
    }),
  });

  return (
    <main className="relative min-h-screen supports-[min-height:100dvh]:min-h-[100dvh]">
      <nav className="grid-template-navigation mx-auto grid w-full max-w-[90rem] items-center self-start p-3">
        <NowPlaying style={{ gridArea: "player" }} withPlayer={false} />

        <Link
          href="/"
          className="text-kinfolk-logo text-center font-kinfolk uppercase text-white"
          style={{ gridArea: "logo" }}
        >
          Voices
        </Link>
      </nav>

      {status === "loading" ? (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Spinner className="text-white" />
        </div>
      ) : null}

      <div className="absolute inset-0 mt-[120px] lg:mt-[72px]" ref={ref} />
    </main>
  );
}
