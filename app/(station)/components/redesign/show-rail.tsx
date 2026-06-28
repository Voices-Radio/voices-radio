import type { VoicesShow } from "@/lib/voices/types";
import SectionHeading from "./section-heading";
import ShowCard from "./show-card";

export default function ShowRail({
  title,
  description,
  shows,
}: {
  title: string;
  description: string;
  shows: VoicesShow[];
}) {
  return (
    <section className="overflow-hidden border-b border-voicesNext-border py-8 md:py-[50px]">
      <div className="w-full">
        <SectionHeading title={title} description={description} />
        {shows.length > 0 ? (
          <div className="mt-6 flex gap-4 overflow-x-auto pb-6 md:mt-7">
            {shows.map((show, index) => (
              <ShowCard key={show.id} show={show} priority={index === 0} rail />
            ))}
          </div>
        ) : (
          <div className="mt-6 border border-voicesNext-border p-6 font-gabarito text-voicesNext-secondary">
            No matched shows are available for this section yet.
          </div>
        )}
      </div>
    </section>
  );
}
