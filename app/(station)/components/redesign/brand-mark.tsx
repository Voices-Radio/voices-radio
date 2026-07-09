import Link from "next/link";
import Image from "next/image";

export default function BrandMark() {
  return (
    <Link
      href="/"
      className="group relative block h-9 w-[114px] focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background md:h-[46px] md:w-[145px]"
      aria-label="Voices Radio home"
    >
      <Image
        aria-hidden="true"
        src="/voices-wordmark.svg"
        alt=""
        fill
        sizes="(min-width: 768px) 145px, 114px"
        className="object-contain"
        priority
      />
      <span className="sr-only">Voices</span>
    </Link>
  );
}
