"use client";

import { X } from "lucide-react";
import { useMemo } from "react";

function getMixcloudFeedPath(url: string) {
  try {
    const parsed = new URL(url);
    if (
      parsed.hostname !== "www.mixcloud.com" &&
      parsed.hostname !== "mixcloud.com"
    ) {
      return null;
    }

    const path = parsed.pathname.replace(/^\/+|\/+$/g, "");
    return path ? `/${path}/` : null;
  } catch {
    return null;
  }
}

export default function MixcloudArchivePlayer({
  title,
  url,
}: {
  title: string;
  url: string;
}) {
  const feedPath = useMemo(() => getMixcloudFeedPath(url), [url]);

  if (!feedPath) return null;

  const src = `https://www.mixcloud.com/widget/iframe/?hide_cover=1&light=1&feed=${encodeURIComponent(feedPath)}`;

  return (
    <section
      className="overflow-hidden border border-[#4d4d4d] bg-voicesNext-surface md:rounded-voices-sm md:border-voicesNext-border"
      aria-label="Archive player"
    >
      <div className="relative h-[88px] border-b border-[#4d4d4d] px-[63px] pt-[13px] md:hidden">
        <h2 className="truncate font-gabarito text-[14px] font-bold leading-none text-voicesNext-cream">
          {title}
        </h2>
        <p className="mt-1 font-asap text-[11px] leading-none text-[#b3b3b3]">
          KX • Archive
        </p>
        <div className="absolute left-[63px] right-8 top-[59px] h-1 rounded-full bg-[#4d4d4d]">
          <div className="h-full w-1/3 rounded-full bg-voicesNext-orange" />
          <span className="absolute left-[31%] top-1/2 size-[10px] -translate-y-1/2 rounded-full bg-voicesNext-orange" />
        </div>
        <span className="absolute left-[63px] top-[70px] font-asap text-[10px] leading-none text-voicesNext-cream">
          12:34
        </span>
        <span className="absolute right-8 top-[70px] font-asap text-[10px] leading-none text-voicesNext-cream">
          -25:48
        </span>
        <button
          type="button"
          className="absolute right-3 top-3 inline-flex size-6 items-center justify-center text-voicesNext-cream"
          aria-label="Close archive player"
          disabled
        >
          <X aria-hidden="true" size={16} strokeWidth={3} />
        </button>
      </div>
      <div className="hidden border-b border-voicesNext-border px-4 py-3 md:block">
        <p className="font-asap text-xs font-bold uppercase text-voicesNext-orange">
          Listen back
        </p>
        <h2 className="font-gabarito text-lg font-bold text-voicesNext-cream">
          {title}
        </h2>
      </div>
      <iframe
        title={`${title} Mixcloud player`}
        src={src}
        className="h-[96px] w-full md:h-[120px]"
        allow="autoplay"
      />
    </section>
  );
}
