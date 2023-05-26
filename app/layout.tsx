import localFont from "next/font/local";
import "./globals.css";

const kinfolk = localFont({
  src: "./subset-BNKinfolkRounded.woff2",
  display: "swap",
  variable: "--font-kinfolk",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${kinfolk.variable}`}>
      <body>{children}</body>
    </html>
  );
}
