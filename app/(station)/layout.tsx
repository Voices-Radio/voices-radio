import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://voicesradio.co.uk"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: new URL("https://voicesradio.co.uk"),
  },
};

export default function StationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
