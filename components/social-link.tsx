import Image from "next/image";

type SocialLinkType =
  | "twitter"
  | "instagram"
  | "facebook"
  | "mixcloud"
  | "tiktok";

export default function SocialLink({
  url,
  type,
}: {
  url: string;
  type: SocialLinkType;
}) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      <Image
        src={`/${type}.svg`}
        alt={`${type} Logo`}
        width={24}
        height={24}
        className="invert"
      />
    </a>
  );
}
