import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import Fathom from "./components/fathom";
import { getBaseUrl } from "@/lib/site-url";
import "./globals.css";

const kinfolk = localFont({
  src: "./subset-BNKinfolkRounded.woff2",
  display: "swap",
  variable: "--font-kinfolk",
});

const inter = Inter({
  weight: ["600", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: "#000000",
};

/**
 * Resolves every relative `alternates.canonical` and `openGraph.url` in the
 * tree against the real production origin. Without it, routes outside the
 * (station) group emitted relative canonicals like `<link rel="canonical"
 * href="/podcast">`.
 *
 * Deliberately NOT setting `alternates` here: canonical URLs belong to pages,
 * never to layouts. A canonical on a layout is inherited by every page beneath
 * it that does not set its own, which is how every blog post ended up
 * declaring the homepage as its canonical.
 */
export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`bg-black antialiased ${kinfolk.variable} ${inter.variable}`}
    >
      <body>
        {children}
        <Fathom />
      </body>
    </html>
  );
}
