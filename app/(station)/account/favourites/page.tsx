import type { Metadata } from "next";
import { getFavouriteLists, getFavourites } from "@/lib/voices/favourites/client";
import { canOrganisePlaylists } from "@/lib/voices/membership/capabilities";
import { lookupCapabilities } from "@/lib/voices/membership/session";
import { AccountPageIntro } from "../components/account-surface";
import PlaylistsUpsell from "./playlists-upsell";
import FavouritesListNav from "./favourites-list-nav";
import FavouritesLoadMore from "./favourites-load-more";
import NewPlaylistForm from "./new-playlist-form";
import PlaylistHeader from "./playlist-header";

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

  const [listsResult, favouritesResult, capabilities] = await Promise.all([
    getFavouriteLists(),
    getFavourites({ listId: list }),
    lookupCapabilities(),
  ]);

  // Playlists are for members. Only a confirmed non-member sees the upsell: if
  // the lookup is down we say nothing rather than tell a member to join.
  const isFreeAccount =
    capabilities.status === "ok" &&
    !canOrganisePlaylists(capabilities.data.member);

  const activeCustomList =
    list && listsResult.ok
      ? listsResult.data.find((l) => l.id === list && !l.isDefault)
      : undefined;

  return (
    <div>
      <AccountPageIntro
        eyebrow="Saved"
        title="Your favourites"
        description={
          isFreeAccount
            ? "The artists and shows you've saved."
            : "Shows you've saved, organised into My Favourites and your own playlists."
        }
      />

      {isFreeAccount && (
        <div className="mt-4">
          <PlaylistsUpsell />
        </div>
      )}

      {!isFreeAccount && (
        <div className="mt-6 flex flex-col gap-4">
          <NewPlaylistForm />
          {listsResult.ok && listsResult.data.length > 0 && (
            <FavouritesListNav lists={listsResult.data} activeListId={list} />
          )}
          {activeCustomList && <PlaylistHeader list={activeCustomList} />}
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
              ? "Nothing in this playlist yet — tap the bookmark on any show and choose it."
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
