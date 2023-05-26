import { getHome } from "@/sanity.client";
import Image from "next/image";
import background from "./apply_background.jpg";

export default async function ApplySection() {
  const home = await getHome();

  return (
    <section className="px-8 py-40 relative overflow-hidden">
      <div className="absolute -bottom-px left-0 right-0 z-[1] pointer-events-none max-w-none">
        <svg
          className="text-voices-gray"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1920 182"
        >
          <path
            fill="currentColor"
            d="M-0.000144958 182C-301.833 157.167 72.3332 44.0001 109 33.0001C145.667 22.0001 182.333 113.333 220 116C257.667 118.667 297.333 38.8334 335 49.0001C372.667 59.1668 408.167 168.833 446 177C483.833 185.167 523.833 124 562 98.0001C600.167 72.0001 637.5 13.6668 675 21.0001C712.5 28.3334 749.667 137 787 142C824.333 147 860.833 62.3334 899 51.0001C937.167 39.6668 978.167 69.6668 1016 74.0001C1053.83 78.3334 1088.67 73.3334 1126 77.0001C1163.33 80.6668 1202 103 1240 96.0001C1278 89.0001 1316.17 38.1668 1354 35.0001C1391.83 31.8334 1429.67 57.5001 1467 77.0001C1504.33 96.5001 1540.33 147.833 1578 152C1615.67 156.167 1655.33 107.333 1693 102C1730.67 96.6668 1766.17 106.667 1804 120C1841.83 133.333 2220.67 171.667 1920 182"
          />
        </svg>
      </div>

      <div className="absolute -top-px left-0 right-0 z-[1] pointer-events-none max-w-none rotate-180">
        <svg
          className="text-voices-beige"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1920 182"
        >
          <path
            fill="currentColor"
            d="M-0.000144958 182C-301.833 157.167 72.3332 44.0001 109 33.0001C145.667 22.0001 182.333 113.333 220 116C257.667 118.667 297.333 38.8334 335 49.0001C372.667 59.1668 408.167 168.833 446 177C483.833 185.167 523.833 124 562 98.0001C600.167 72.0001 637.5 13.6668 675 21.0001C712.5 28.3334 749.667 137 787 142C824.333 147 860.833 62.3334 899 51.0001C937.167 39.6668 978.167 69.6668 1016 74.0001C1053.83 78.3334 1088.67 73.3334 1126 77.0001C1163.33 80.6668 1202 103 1240 96.0001C1278 89.0001 1316.17 38.1668 1354 35.0001C1391.83 31.8334 1429.67 57.5001 1467 77.0001C1504.33 96.5001 1540.33 147.833 1578 152C1615.67 156.167 1655.33 107.333 1693 102C1730.67 96.6668 1766.17 106.667 1804 120C1841.83 133.333 2220.67 171.667 1920 182"
          />
        </svg>
      </div>

      <Image src={background} className="object-cover" alt="" fill priority />

      <div className="absolute inset-0 backdrop-blur-xl" />

      <div className="relative text-white flex flex-col gap-8 items-center">
        <h2 className="font-black text-center font-kinfolk text-kinfolk-headline uppercase">
          {home.apply_heading}
        </h2>

        <p className="text-center text-inter-text-semibold max-w-xl">
          {home.apply_subheading}
        </p>

        <a
          href={home.apply_cta_url}
          className="rounded-full bg-transparent border-4 border-white text-white px-20 pt-[calc(1.125rem-4px)] pb-[calc(1.25rem-4px)] text-inter-text-semibold"
        >
          {home.apply_cta_text}
        </a>
      </div>
    </section>
  );
}
