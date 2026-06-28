import { ProcessedDay } from "@/hooks/use-week-info";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

export default function Show({ day }: { day: ProcessedDay }) {
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    if (day.is_live) {
      ref.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "center",
      });
    }
  }, [day]);

  return (
    <li
      ref={ref}
      className={cn(
        "p-4 md:px-5 md:pb-0 md:pt-4",
        day.is_live ? "-mt-px bg-white text-black md:rounded-lg" : "text-white",
        day.is_past ? "opacity-50" : "",
      )}
    >
      <div className="flex items-center gap-4 md:gap-6">
        <p className="whitespace-nowrap text-mobile-inter-small tabular-nums md:text-inter-text-small">
          {day.show_start_hour} &ndash;
          <br className="md:hidden" /> {day.show_end_hour}
        </p>

        <p className="flex-1 text-2xl font-black uppercase leading-none md:text-4xl">
          {day.name}
        </p>

        {day.is_live && (
          <div className="flex items-center gap-2">
            <p className="text-mobile-inter-xsmall">Live</p>

            <div className="h-4 w-4 animate-pulse rounded-full bg-[#FF0000]" />
          </div>
        )}
      </div>

      <div className="hidden h-4 md:block" />

      <div className="hidden h-px w-full bg-white md:block" />
    </li>
  );
}
