import Image from "next/image";

export default function MobileAppBadges({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`relative h-10 w-[270px] ${className}`}>
      <Image
        src="/mobile-app-badges.png"
        alt="Get it on Google Play and download on the App Store"
        fill
        sizes="270px"
        className="object-contain"
      />
    </div>
  );
}
