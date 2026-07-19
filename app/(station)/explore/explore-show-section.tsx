"use client";

import { useEffect, useMemo, useState } from "react";
import ShowCard from "../components/redesign/show-card";
import type { VoicesShow } from "@/lib/voices/types";

const INITIAL_SHOW_COUNT = 9;

function chunkShows(shows: VoicesShow[]) {
  const chunks: VoicesShow[][] = [];

  for (let index = 0; index < shows.length; index += INITIAL_SHOW_COUNT) {
    chunks.push(shows.slice(index, index + INITIAL_SHOW_COUNT));
  }

  return chunks;
}

export default function ExploreShowSection({
  title,
  description,
  shows,
  emptyMessage,
}: {
  title: string;
  description: string;
  shows: VoicesShow[];
  emptyMessage: string;
}) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_SHOW_COUNT);
  const showKey = shows.map((show) => show.id).join("|");
  const visibleShows = shows.slice(0, visibleCount);
  const visibleShowGroups = useMemo(
    () => chunkShows(visibleShows),
    [visibleShows],
  );
  const hasMore = visibleCount < shows.length;

  useEffect(() => {
    setVisibleCount(INITIAL_SHOW_COUNT);
  }, [showKey]);

  return (
    <section className="mx-auto max-w-[1280px] px-4 md:px-[70px]">
      <div className="mb-5 flex items-end justify-between gap-4 md:mb-[30px]">
        <div>
          <h1 className="font-gabarito text-[20px] font-bold leading-none text-voicesNext-cream md:text-[24px]">
            {title}
          </h1>
          <p className="mt-1 font-asap text-[13px] leading-tight text-voicesNext-secondary md:mt-2 md:text-[14px]">
            {description}
          </p>
        </div>
      </div>

      {visibleShows.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto px-0 pb-6 md:block md:space-y-5 md:overflow-visible md:pb-0">
          {visibleShowGroups.map((group, groupIndex) => (
            <div
              key={`${title}-${groupIndex}`}
              className="contents md:grid md:gap-5 md:sm:grid-cols-2 md:xl:grid-cols-3"
            >
              {group.map((show, index) => (
                <div
                  key={show.id}
                  className="w-[350px] shrink-0 md:w-auto md:shrink"
                >
                  <ShowCard
                    show={show}
                    priority={groupIndex === 0 && index < 3}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-voicesNext-border p-6 font-gabarito text-voicesNext-secondary">
          {emptyMessage}
        </div>
      )}

      {hasMore && (
        <div className="mt-10 text-center">
          <button
            type="button"
            className="rounded-full border border-voicesNext-cream px-[17px] py-1 font-asap text-[16px] font-bold uppercase text-voicesNext-cream transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
            onClick={() =>
              setVisibleCount((count) =>
                Math.min(count + INITIAL_SHOW_COUNT, shows.length),
              )
            }
          >
            Load More Shows
          </button>
        </div>
      )}
    </section>
  );
}
