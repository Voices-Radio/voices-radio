import { Metadata } from "next";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "About",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  return (
    <main>
      <section className="p-8">
        <h1>About Page</h1>
      </section>
    </main>
  );
}
