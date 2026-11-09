"use client";

import { useScript } from "@/hooks/use-script";
import Spinner from "@/icons/spinner";
import { useRef } from "react";
import PageHero from "../components/redesign/page-hero";

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
    <main id="main-content" className="scroll-mt-24">
      <PageHero
        eyebrow="Live"
        title="Chat"
        description="Talk to the studio and the rest of the room while KX and East are on air."
      />

      <div className="mx-auto max-w-[1280px] px-4 py-10 md:px-8 md:py-16">
        {/* Chatango's embed is configured with b/r: 100 — percentage width and
            height — so it needs a parent with a resolved size rather than the
            viewport-filling `absolute inset-0` this page used before it moved
            inside the station shell. */}
        <div className="relative h-[70dvh] max-h-[820px] min-h-[520px] overflow-hidden rounded-voices-md border border-voicesNext-border bg-voicesNext-surface">
          {status === "loading" ? (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Spinner className="text-voicesNext-cream" />
            </div>
          ) : null}

          <div className="absolute inset-0" ref={ref} />
        </div>
      </div>
    </main>
  );
}
