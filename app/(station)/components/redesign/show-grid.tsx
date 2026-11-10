import type { VoicesShow } from "@/lib/voices/types";
import ShowCard from "./show-card";

// Full class strings so Tailwind's scanner keeps both layouts.
const GRID_COLUMNS = {
  3: "sm:grid-cols-2 xl:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
} as const;

type ShowGridProps = {
  shows: VoicesShow[];
  columns?: keyof typeof GRID_COLUMNS;
};

export default function ShowGrid({ shows, columns = 3 }: ShowGridProps) {
  if (!shows.length) {
    return (
      <p className="rounded-voices-sm border border-voicesNext-border p-6 font-gabarito text-voicesNext-secondary">
        No matched shows are available yet.
      </p>
    );
  }

  return (
    <div className={`grid gap-5 ${GRID_COLUMNS[columns]}`}>
      {shows.map((show, index) => (
        <ShowCard key={show.id} show={show} priority={index < columns} />
      ))}
    </div>
  );
}
