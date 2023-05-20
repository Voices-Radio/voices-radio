import { Metadata } from "next";
import Link from "next/link";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "About",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  return (
    <main>
      <h1>About Page</h1>

      <p>
        <Link href="/">Home</Link>
      </p>
    </main>
  );
}
