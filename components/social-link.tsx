import Image from "next/image";

type SocialLinkType =
  | "twitter"
  | "instagram"
  | "facebook"
  | "mixcloud"
  | "tiktok"
  | "linkedin";

export default function SocialLink({
  url,
  type,
}: {
  url: string;
  type: SocialLinkType;
}) {
  return (
    <a href={url} target="_blank" rel="noopener">
      <Image
        src={`/${type}.svg`}
        alt={`${type} Logo`}
        width={24}
        height={24}
        className="invert"
        priority
      />
    </a>
  );
}
