import { getHome } from "@/sanity.client";
import { urlForImage } from "@/sanity.image";
import Image from "next/image";

export default async function ApplySection() {
  const home = await getHome();

  return (
    <section className="relative z-auto overflow-hidden px-8 py-40">
      <Image
        src={urlForImage(home.apply_background).url()}
        className="object-cover"
        sizes="100vw"
        quality={25}
        alt=""
        fill
      />

      <div className="absolute inset-0 backdrop-blur-xl" />

      <div className="relative flex flex-col items-center gap-8 px-6 text-white">
        <h2 className="text-center font-kinfolk text-mobile-kinfolk-headline uppercase md:text-kinfolk-headline">
          {home.apply_heading}
        </h2>

        <p className="max-w-xl text-center text-mobile-inter-text md:text-inter-text">
          {home.apply_subheading}
        </p>

        <a
          href={home.apply_cta_url}
          className="whitespace-nowrap rounded-full bg-transparent px-20 py-[1.125rem] text-mobile-inter-text text-white ring-4 ring-inset ring-white md:text-inter-text"
        >
          {home.apply_cta_text}
        </a>
      </div>

      <svg
        className="sr-only"
        aria-hidden="true"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <path
            id="wave"
            d="M0,135L10,122.5C20,110,40,85,60,67.5C80,50,100,40,120,50C140,60,160,90,180,95C200,100,220,80,240,70C260,60,280,60,300,67.5C320,75,340,90,360,92.5C380,95,400,85,420,75C440,65,460,55,480,57.5C500,60,520,75,540,80C560,85,580,80,600,75C620,70,640,65,660,70C680,75,700,90,720,102.5C740,115,760,125,780,130C800,135,820,135,840,125C860,115,880,95,900,85C920,75,940,75,960,65C980,55,1000,35,1020,40C1040,45,1060,75,1080,75C1100,75,1120,45,1140,47.5C1160,50,1180,85,1200,92.5C1220,100,1240,80,1260,80C1280,80,1300,100,1320,95C1340,90,1360,60,1380,52.5C1400,45,1420,60,1430,67.5L1440,75L1440,150L1430,150C1420,150,1400,150,1380,150C1360,150,1340,150,1320,150C1300,150,1280,150,1260,150C1240,150,1220,150,1200,150C1180,150,1160,150,1140,150C1120,150,1100,150,1080,150C1060,150,1040,150,1020,150C1000,150,980,150,960,150C940,150,920,150,900,150C880,150,860,150,840,150C820,150,800,150,780,150C760,150,740,150,720,150C700,150,680,150,660,150C640,150,620,150,600,150C580,150,560,150,540,150C520,150,500,150,480,150C460,150,440,150,420,150C400,150,380,150,360,150C340,150,320,150,300,150C280,150,260,150,240,150C220,150,200,150,180,150C160,150,140,150,120,150C100,150,80,150,60,150C40,150,20,150,10,150L0,150Z"
          />
        </defs>
      </svg>

      <div className="pointer-events-none absolute -bottom-0.5 left-0 right-0 max-w-none">
        <svg
          className="text-voices-gray"
          viewBox="0 0 1440 150"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <use href="#wave" fill="currentColor" />
        </svg>
      </div>

      <div className="pointer-events-none absolute -top-0.5 left-0 right-0 max-w-none">
        <svg
          className="rotate-180 text-voices-beige"
          viewBox="0 0 1440 150"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <use href="#wave" fill="currentColor" />
        </svg>
      </div>
    </section>
  );
}
