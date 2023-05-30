import { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Chat",
  alternates: { canonical: "/chat" },
};

export default async function ChatPage() {
  return (
    <Script
      id="cid0020000285987468774"
      strategy="lazyOnload"
      src="https://st.chatango.com/js/gz/emb.js"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
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
            fwtickm: 1,
            showx: 0,
          },
        }),
      }}
    />
  );
}
