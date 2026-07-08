"use client";

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
      className="overflow-hidden rounded-voices-sm border border-voicesNext-border bg-voicesNext-surface"
      aria-label="Archive player"
    >
      <div className="border-b border-voicesNext-border px-4 py-3">
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
        className="h-[120px] w-full"
        allow="autoplay"
      />
    </section>
  );
}
