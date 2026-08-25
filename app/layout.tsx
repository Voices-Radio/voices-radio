import type { Metadata, Viewport } from "next";
import { Asap_Condensed, Gabarito, Inter, Outfit } from "next/font/google";
import localFont from "next/font/local";
import { SAFE_AREA_COLOR } from "@/lib/design-tokens";
import Fathom from "./components/fathom";
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

const gabarito = Gabarito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-gabarito",
});

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

const asapCondensed = Asap_Condensed({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-asap-condensed",
});

export const viewport: Viewport = {
  // Declared per colour scheme rather than as a single flat value — with
  // `colorScheme: "dark"` also set below, Safari has been unreliable about
  // honouring an unqualified themeColor in dark appearance, which is part of
  // why the Dynamic Island area was reading as plain black instead of this
  // grey.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: SAFE_AREA_COLOR },
    { media: "(prefers-color-scheme: dark)", color: SAFE_AREA_COLOR },
  ],
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`antialiased ${kinfolk.variable} ${inter.variable} ${gabarito.variable} ${outfit.variable} ${asapCondensed.variable}`}
    >
      <body>
        {children}
        <Fathom />
      </body>
    </html>
  );
}
