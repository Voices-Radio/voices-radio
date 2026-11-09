import Link from "next/link";
import Image from "next/image";

export default function BrandMark() {
  return (
    <Link
      href="/"
      className="group block h-12 w-12 focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background md:h-14 md:w-14"
      aria-label="Voices Radio home"
    >
      <Image
        aria-hidden="true"
        src="/VOICESLOGO_LIGHTBOX.png"
        alt=""
        width={56}
        height={56}
        className="h-12 w-12 object-contain md:h-14 md:w-14"
        priority
      />
      <span className="sr-only">Voices</span>
    </Link>
  );
}
