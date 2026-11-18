import { Video } from "lucide-react";
import { VOICES_MIXCLOUD_LIVE_URL } from "@/lib/voices/config";

/** Desktop strip video cell; matches the 35px play cell beside it. */
export const DESKTOP_VIDEO_CLASS =
  "inline-flex h-[34px] w-[35px] shrink-0 items-center justify-center border-l border-black transition-colors hover:bg-voicesNext-background hover:text-voicesNext-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-voicesNext-orange disabled:cursor-not-allowed disabled:text-voicesNext-secondary disabled:hover:bg-transparent disabled:hover:text-voicesNext-secondary";

/**
 * The "watch live" control that sits to the right of a station's play button.
 * KX opens the Mixcloud Live stream in a new tab, the same target as the
 * home page's "Watch live" action. A station without video (East, until it
 * launches) gets the same icon as a disabled button, so the rows stay aligned
 * and nothing about it is clickable.
 */
export default function StationVideoButton({
  label,
  available,
  className,
  iconSize = 16,
}: {
  /** Station name used to build the accessible label, e.g. "KX". */
  label: string;
  available: boolean;
  className?: string;
  iconSize?: number;
}) {
  const icon = <Video aria-hidden="true" size={iconSize} strokeWidth={2.4} />;

  if (!available) {
    return (
      <button
        type="button"
        disabled
        className={className}
        aria-label={`${label} live video unavailable`}
      >
        {icon}
      </button>
    );
  }

  return (
    <a
      href={VOICES_MIXCLOUD_LIVE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={`Watch ${label} live video on Mixcloud`}
    >
      {icon}
    </a>
  );
}
