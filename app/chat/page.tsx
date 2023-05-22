import { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Chat",
  alternates: { canonical: "/chat" },
};

export default function ChatPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Script
        id="c039080020000285987468774"
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
              k: "FFFFFF",
              l: "000000",
              m: "000000",
              n: "FFFFFF",
              p: "10",
              q: "000000",
              r: 100,
              allowpm: 0,
              showx: 0,
              surl: 0,
            },
          }),
        }}
      />

      {/* 
      <style jsx global>{`
        iframe {
          position: absolute;

          top: 0px;
          right: 0px;
          left: 0px;
          bottom: 0px;

          width: 100%;
          height: 100%;
        }
      `}</style> */}
    </div>
  );
}
