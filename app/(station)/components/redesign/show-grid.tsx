import type { VoicesShow } from "@/lib/voices/types";
import ShowCard from "./show-card";

export default function ShowGrid({ shows }: { shows: VoicesShow[] }) {
  if (!shows.length) {
    return (
      <p className="rounded-voices-sm border border-voicesNext-border p-6 font-gabarito text-voicesNext-secondary">
        No matched shows are available yet.
      </p>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {shows.map((show, index) => (
        <ShowCard key={show.id} show={show} priority={index < 3} />
      ))}
    </div>
  );
}
