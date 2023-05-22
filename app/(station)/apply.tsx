import { getHome } from "@/sanity.client";
import Image from "next/image";
import background from "./apply_background.jpg";

export default async function ApplySection() {
  const home = await getHome();

  return (
    <section className="px-8 py-40 relative">
      <Image src={background} className="object-cover" alt="" fill priority />

      <div className="absolute inset-0 backdrop-blur-xl" />

      <div className="relative text-white flex flex-col gap-8 items-center">
        <h2 className="text-3xl font-black text-center">
          {home.apply_heading}
        </h2>

        <p className="text-center text-2xl max-w-xl">{home.apply_subheading}</p>

        <a
          href={home.apply_cta_url}
          className="rounded-full bg-black text-white px-20 py-4 text-xl"
          target="_blank"
          rel="noopener noreferrer"
        >
          {home.apply_cta_text}
        </a>
      </div>
    </section>
  );
}
