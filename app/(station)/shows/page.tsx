import PageHero from "../components/redesign/page-hero";
import ShowGrid from "../components/redesign/show-grid";
import { getShows } from "@/lib/voices/api";

export default async function ShowsPage() {
  const shows = await getShows();
  const matchedCopy =
    shows.length === 1
      ? "1 matched public show"
      : `${shows.length} matched public shows`;

  return (
    <main>
      <PageHero
        eyebrow="Shows"
        title="Listen back"
        description="Matched public shows from the Voices archive, keyed by backend ObjectId routes."
      />
      <section className="mx-auto max-w-[1280px] px-4 py-10 md:px-8">
        <p className="mb-5 font-asap text-sm font-bold uppercase text-voicesNext-secondary">
          {matchedCopy}
        </p>
        <ShowGrid shows={shows} />
      </section>
    </main>
  );
}
