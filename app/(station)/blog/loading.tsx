/**
 * Dark rectangular placeholders, not shimmer — the system is explicit that
 * empty and skeleton states stay quiet on this canvas. Shapes match the real
 * layout (lead tile, then a card grid) so nothing jumps when content lands.
 */
export default function BlogLoading() {
  return (
    <div className="bg-voicesNext-background" aria-busy="true">
      <span className="sr-only" role="status">
        Loading posts
      </span>

      <section className="border-b border-voicesNext-border">
        <div className="mx-auto max-w-[1280px] px-4 py-10 md:px-8 md:py-16">
          <div className="h-4 w-32 bg-voicesNext-surface" />
          <div className="mt-5 h-12 w-56 bg-voicesNext-surface md:h-20 md:w-80" />
          <div className="mt-5 h-4 w-full max-w-2xl bg-voicesNext-surface" />
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-4 py-10 md:px-8 md:py-14">
        <div className="mb-8 flex flex-wrap gap-2 md:mb-10">
          {[80, 110, 96, 72].map((width, index) => (
            <div
              key={index}
              className="h-[35px] rounded-full bg-voicesNext-surface"
              style={{ width }}
            />
          ))}
        </div>

        <div className="grid min-h-[340px] border border-voicesNext-border bg-voicesNext-surface md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]" />

        <div className="mt-10 grid grid-cols-1 gap-5 md:mt-14 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="h-[420px] border border-voicesNext-border bg-voicesNext-surface"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
