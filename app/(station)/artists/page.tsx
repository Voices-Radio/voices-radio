import Link from "next/link";
import ArtistCard from "../components/redesign/artist-card";
import { getArtists } from "@/lib/voices/api";
import { matchesStationOrLocation } from "@/lib/voices/normalizers";
import type { VoicesArtist } from "@/lib/voices/types";

const filterPills = ["GENRES", "KX", "EAST", "LONDON", "WORLD"];

function sortArtists(artists: VoicesArtist[]) {
  return [...artists].sort((a, b) => a.name.localeCompare(b.name));
}

function DiscoveryTabs() {
  return (
    <nav
      className="border-b border-black bg-voicesNext-cream text-voicesNext-background"
      aria-label="Explore sections"
    >
      <div className="mx-auto flex h-[68px] max-w-[1280px] items-center px-4 lg:px-[482px]">
        <div className="flex items-center gap-7 font-gabarito text-[20px] font-bold">
          <Link href="/explore" className="text-voicesNext-secondary">
            Shows
          </Link>
          <Link href="/artists" className="relative">
            Artists
            <span className="absolute -bottom-[22px] left-0 h-[2px] w-[60px] bg-voicesNext-orange" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

function FilterStrip() {
  return (
    <section className="mx-auto flex h-auto max-w-[1280px] flex-wrap items-center gap-[9px] px-4 py-8 md:h-[109px] md:px-[60px] md:py-0">
      <p className="font-asap text-[14px] uppercase text-voicesNext-cream">
        FILTERS:
      </p>
      {filterPills.map((pill) => (
        <button
          key={pill}
          type="button"
          className="inline-flex h-[22px] items-center justify-center rounded-full border border-voicesNext-cream px-4 font-asap text-[12px] font-bold uppercase leading-none text-voicesNext-cream"
          aria-pressed="false"
        >
          {pill}
          {pill === "GENRES" && <span className="ml-2">⌄</span>}
        </button>
      ))}
    </section>
  );
}

function ArtistSection({
  title,
  description,
  artists,
}: {
  title: string;
  description: string;
  artists: VoicesArtist[];
}) {
  if (!artists.length) return null;

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-10 md:px-[70px] md:py-[54px]">
      <div className="mb-[30px] flex items-end justify-between gap-4">
        <div>
          <h1 className="font-gabarito text-[24px] font-bold leading-none text-voicesNext-cream">
            {title}
          </h1>
          <p className="mt-2 font-asap text-[14px] text-voicesNext-secondary">
            {description}
          </p>
        </div>
        <span className="font-asap text-[16px] font-bold lowercase text-voicesNext-cream">
          a → z
        </span>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {artists.slice(0, 9).map((artist) => (
          <div key={artist.id} className="h-[350px] w-full max-w-[350px]">
            <ArtistCard artist={artist} />
          </div>
        ))}
      </div>
      {artists.length > 9 && (
        <div className="mt-10 text-center">
          <button
            type="button"
            className="rounded-full border border-voicesNext-cream px-[17px] py-1 font-asap text-[16px] font-bold uppercase text-voicesNext-cream"
          >
            Load More
          </button>
        </div>
      )}
    </section>
  );
}

export default async function ArtistsPage() {
  const artists = await getArtists();
  const activeArtists = sortArtists(
    artists.filter((artist) => artist.isActive),
  );
  const kxArtists = activeArtists.filter((artist) =>
    matchesStationOrLocation(artist, "kx"),
  );
  const eastArtists = activeArtists.filter((artist) =>
    matchesStationOrLocation(artist, "east"),
  );
  const hasExplicitStationGroups =
    kxArtists.length > 0 || eastArtists.length > 0;

  return (
    <main>
      <DiscoveryTabs />
      <FilterStrip />
      {hasExplicitStationGroups ? (
        <>
          <ArtistSection
            title="Voices KX"
            description="Browse the hosts at our Kings Cross studio."
            artists={kxArtists}
          />
          <ArtistSection
            title="Voices EAST"
            description="Browse the hosts at our Hackney Wick studio."
            artists={eastArtists}
          />
        </>
      ) : (
        <ArtistSection
          title="Artists"
          description="Browse all Voices artists, presenters and hosts."
          artists={activeArtists}
        />
      )}
    </main>
  );
}
