import { cn } from "@/lib/utils";

const block = "animate-pulse rounded-voices-sm bg-voicesNext-surface";

/**
 * Loading state for the show and artist pages. It mirrors their real layout
 * (desktop PageHero + artwork/details grid, mobile full-width artwork + text)
 * so the page appears in place instead of jumping when the content arrives.
 */
export default function DetailPageSkeleton({
  label,
  mobileArtworkClassName,
  desktopArtworkColumn,
}: {
  label: string;
  mobileArtworkClassName: string;
  desktopArtworkColumn: string;
}) {
  return (
    <main
      id="main-content"
      className="scroll-mt-24"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">{label}</span>

      <div aria-hidden="true">
        <section className="hidden border-b border-voicesNext-border md:block">
          <div className="mx-auto max-w-[1280px] px-8 py-16">
            <div className={cn(block, "h-4 w-32")} />
            <div className={cn(block, "mt-5 h-12 w-2/3 max-w-[640px]")} />
            <div className={cn(block, "mt-4 h-5 w-48")} />
          </div>
        </section>

        <section className="md:hidden">
          <div
            className={cn(
              "animate-pulse bg-voicesNext-surface",
              mobileArtworkClassName,
            )}
          />
          <div className="space-y-3 px-5 pb-10 pt-6">
            <div className={cn(block, "h-8 w-3/4")} />
            <div className={cn(block, "h-4 w-1/3")} />
            <div className={cn(block, "mt-5 h-12 w-full")} />
          </div>
        </section>

        <section
          className="mx-auto hidden max-w-[1280px] gap-8 px-4 py-10 md:grid md:px-8"
          style={{ gridTemplateColumns: `${desktopArtworkColumn} 1fr` }}
        >
          <div className={cn(block, "aspect-square")} />
          <div className="space-y-4">
            <div className={cn(block, "h-20 w-full")} />
            <div className={cn(block, "h-4 w-full")} />
            <div className={cn(block, "h-4 w-5/6")} />
            <div className={cn(block, "h-4 w-2/3")} />
          </div>
        </section>
      </div>
    </main>
  );
}
