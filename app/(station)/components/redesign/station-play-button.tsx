"use client";

import { Play, Square } from "lucide-react";
import Spinner from "@/icons/spinner";
import { cn } from "@/lib/utils";

/**
 * The single play control for every live station surface.
 *
 * Before this existed, each strip hand-rolled its own button and used the
 * `loading` flag from useStationAudio for exactly one thing — disabling
 * itself. A greyed-out button with a frozen Play icon reads as "this station
 * is unavailable", not "connecting", so on a slow connection tapping play
 * looked like the site had broken. The pre-redesign player
 * (app/components/navigation/now-playing.tsx, still live on main) rendered a
 * spinner here; this restores that.
 *
 * State ownership stays with the caller: useStationAudio coordinates
 * stop/play across players through window events, and the <audio> element it
 * needs a ref to lives in the strip. This component only decides what the
 * button looks like and what it announces.
 */
export type StationPlayButtonProps = {
  /** Station name used to build the accessible label, e.g. "KX". */
  label: string;
  playing: boolean;
  loading: boolean;
  /** Last play attempt failed. Pressing again retries. */
  error?: boolean;
  /** No stream configured, or the station hasn't launched yet. */
  unavailable?: boolean;
  onToggle: () => void;
  className?: string;
  iconSize?: number;
  /** Tailwind size for the spinner; twMerge overrides Spinner's default h-6 w-6. */
  spinnerClassName?: string;
};

export function stationPlayButtonLabel({
  label,
  playing,
  loading,
  error,
}: Pick<StationPlayButtonProps, "label" | "playing" | "loading" | "error">) {
  if (loading) return `Connecting to ${label}`;
  if (playing) return `Pause ${label}`;
  // "Retry" rather than "Play" so the control explains the failure it is
  // recovering from — the failure text itself sits in the station row.
  if (error) return `Retry ${label}`;
  return `Play ${label}`;
}

export default function StationPlayButton({
  label,
  playing,
  loading,
  error = false,
  unavailable = false,
  onToggle,
  className,
  iconSize = 14,
  spinnerClassName,
}: StationPlayButtonProps) {
  const accessibleLabel = stationPlayButtonLabel({
    label,
    playing,
    loading,
    error,
  });

  return (
    <button
      type="button"
      // Still disabled while loading: cancelling mid-connect means pausing a
      // pending play() promise, which rejects as an AbortError and would
      // surface as a spurious "stream unavailable". Tracked as a follow-up in
      // tasks/todo.md — the feedback problem is the part that matters here.
      disabled={unavailable || loading}
      aria-busy={loading || undefined}
      onClick={onToggle}
      className={className}
      aria-label={accessibleLabel}
    >
      {loading ? (
        <Spinner className={cn("h-4 w-4", spinnerClassName)} />
      ) : playing ? (
        <Square aria-hidden="true" size={12} fill="currentColor" />
      ) : (
        <Play aria-hidden="true" size={iconSize} fill="currentColor" />
      )}
    </button>
  );
}
