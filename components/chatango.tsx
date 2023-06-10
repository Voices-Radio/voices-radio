"use client";

import { useScript } from "@/hooks/use-script";
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

  return <div className="absolute inset-0" ref={ref}></div>;
}
