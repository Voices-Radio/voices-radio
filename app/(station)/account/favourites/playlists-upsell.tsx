import Link from "next/link";

/** Shown to free accounts on /account/favourites: one list for everyone, playlists for members. */
export default function PlaylistsUpsell() {
  return (
    <p className="font-gabarito text-sm text-voicesNext-cream/80">
      Want to organise your favourites into playlists?{" "}
      <Link
        href="/join"
        className="font-bold text-voicesNext-cream underline underline-offset-2 transition-colors hover:text-voicesNext-orange"
      >
        Become a member
      </Link>
    </p>
  );
}
