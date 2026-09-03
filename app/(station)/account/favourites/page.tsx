import type { Metadata } from "next";
import { getFavouriteLists, getFavourites } from "@/lib/voices/favourites/client";
import { AccountPageIntro } from "../components/account-surface";
import FavouritesListNav from "./favourites-list-nav";
import FavouritesLoadMore from "./favourites-load-more";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Your favourites",
};

export default async function AccountFavouritesPage({
  searchParams,
}: {
  searchParams: Promise<{ list?: string }>;
}) {
  const { list } = await searchParams;

  const [listsResult, favouritesResult] = await Promise.all([
    getFavouriteLists(),
    getFavourites({ listId: list }),
  ]);

  return (
    <div>
      <AccountPageIntro
        eyebrow="Saved"
        title="Your favourites"
        description="Shows you've saved, organised into My Favourites and any lists you've created from a show's save button."
      />

      {listsResult.ok && listsResult.data.length > 0 && (
        <div className="mt-6">
          <FavouritesListNav lists={listsResult.data} activeListId={list} />
        </div>
      )}

      <div className="mt-8">
        {!favouritesResult.ok ? (
          <p
            role="alert"
            className="font-gabarito text-sm text-voicesNext-cream/90"
          >
            {favouritesResult.message}
          </p>
        ) : favouritesResult.data.favourites.length === 0 ? (
          <p className="font-gabarito text-sm text-voicesNext-cream/70">
            {list
              ? "Nothing saved to this list yet."
              : "Nothing saved yet — tap the bookmark on any show to save it here."}
          </p>
        ) : (
          <FavouritesLoadMore
            initialShows={favouritesResult.data.favourites
              .map((row) => row.show)
              .filter((show): show is NonNullable<typeof show> => Boolean(show))}
            initialCursor={favouritesResult.data.nextCursor}
            listId={list}
          />
        )}
      </div>
    </div>
  );
}
