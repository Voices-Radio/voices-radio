import type { Metadata, Viewport } from "next";
import { Asap_Condensed, Gabarito, Inter, Outfit } from "next/font/google";
import localFont from "next/font/local";
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
  themeColor: "#161616",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`bg-black antialiased ${kinfolk.variable} ${inter.variable} ${gabarito.variable} ${outfit.variable} ${asapCondensed.variable}`}
    >
      <body>
        {children}
        <Fathom />
      </body>
    </html>
  );
}
