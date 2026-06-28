import Link from "next/link";

export default function BrandMark() {
  return (
    <Link
      href="/"
      className="group relative block h-9 w-[150px] overflow-hidden focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background md:h-[46px] md:w-[189px]"
      aria-label="Voices Radio home"
    >
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 h-[56px] w-[230px] origin-top-left scale-[0.65] bg-no-repeat md:scale-[0.82]"
        style={{
          backgroundImage: "url('/voices-header-reference.png')",
          backgroundPosition: "-45px -22px",
          backgroundSize: "1280px 100px",
        }}
      />
      <span className="sr-only">Voices</span>
    </Link>
  );
}
