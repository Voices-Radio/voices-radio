import Image from "next/image";
import Link from "next/link";
import type { VoicesShow } from "@/lib/voices/types";
import ArchivePlayPanel from "../../components/redesign/archive-play-panel";

/**
 * "Listen while you read" — the show an article is about, playable in place.
 *
 * The station already runs a persistent archive player that survives
 * navigation, so starting a show here means the audio follows the reader
 * down the page and off it. A post about a show that makes you leave the
 * post to hear the show is the obvious thing a blog does; this is the thing
 * only a radio station's blog can.
 *
 * Renders nothing unless the post names a show that actually has an archive
 * — an empty `relatedShowId`, a deleted show, or a show with no recording
 * all leave the article exactly as it was.
 */
export default function ListenWhileReading({ show }: { show: VoicesShow }) {
  if (!show.archiveMedia) return null;

  return (
    <aside className="my-9 border border-voicesNext-border bg-voicesNext-surface p-4 md:p-5">
      <p className="font-outfit text-[12px] font-black uppercase leading-none tracking-[1px] text-voicesNext-orangeText">
        Listen while you read
      </p>

      <div className="mt-4 flex items-center gap-4">
        {show.artwork?.src && (
          <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden border border-voicesNext-border">
            <Image
              src={show.artwork.src}
              alt=""
              fill
              sizes="72px"
              className="object-cover"
            />
          </div>
        )}

        <div className="min-w-0">
          <h2 className="line-clamp-2 font-gabarito text-[19px] font-bold leading-tight text-voicesNext-cream">
            <Link
              href={`/shows/${show.id}`}
              className="transition-colors hover:text-voicesNext-orangeText focus:outline-none focus-visible:underline focus-visible:decoration-voicesNext-orange focus-visible:decoration-2 focus-visible:underline-offset-4"
            >
              {show.title}
            </Link>
          </h2>
          {show.genres?.length > 0 && (
            <p className="mt-1 font-asap text-[12px] font-bold uppercase leading-none tracking-[0.5px] text-voicesNext-secondary">
              {show.genres.slice(0, 3).join(" · ")}
            </p>
          )}
        </div>
      </div>

      <ArchivePlayPanel media={show.archiveMedia} className="mt-4" />
    </aside>
  );
}
