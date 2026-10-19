import Link from "next/link";
import { cn } from "@/lib/utils";
import type { FavouriteListApi } from "@/lib/voices/favourites/schemas";

/**
 * The list filter chips on /account/favourites. Navigation only — renaming
 * and deleting a playlist live in playlist-header.tsx, on the playlist itself.
 */
export default function FavouritesListNav({
  lists,
  activeListId,
}: {
  lists: FavouriteListApi[];
  activeListId?: string;
}) {
  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-4 py-2 font-gabarito text-sm font-bold transition-colors",
      active
        ? "border-voicesNext-orange bg-voicesNext-orange text-voicesNext-background"
        : "border-voicesNext-border text-voicesNext-cream hover:border-voicesNext-orange",
    );

  return (
    <nav aria-label="Favourite lists" className="flex flex-wrap gap-2">
      <Link href="/account/favourites" className={chip(!activeListId)}>
        All
      </Link>
      {lists.map((list) => (
        <Link
          key={list.id}
          href={`/account/favourites?list=${encodeURIComponent(list.id)}`}
          className={chip(activeListId === list.id)}
        >
          {list.name} <span className="opacity-60">({list.showCount})</span>
        </Link>
      ))}
    </nav>
  );
}
