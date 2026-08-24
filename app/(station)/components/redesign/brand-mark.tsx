import Link from "next/link";
import Image from "next/image";

export default function BrandMark() {
  return (
    <Link
      href="/"
      className="group block h-9 w-[114px] focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background md:h-[46px] md:w-[145px]"
      aria-label="Voices Radio home"
    >
      <Image
        aria-hidden="true"
        src="/voices-wordmark.svg"
        alt=""
        width={145}
        height={46}
        className="h-9 w-[114px] object-contain md:h-[46px] md:w-[145px]"
        priority
      />
      <span className="sr-only">Voices</span>
    </Link>
  );
}
