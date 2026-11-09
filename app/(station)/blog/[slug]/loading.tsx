/**
 * Article skeleton: back link, headline block, meta rule, hero band, then
 * body lines at the real 720px measure. Dark rectangles only — no shimmer.
 */
export default function BlogPostLoading() {
  return (
    <div className="bg-voicesNext-background" aria-busy="true">
      <span className="sr-only" role="status">
        Loading post
      </span>

      <div className="mx-auto max-w-[1120px] px-4 pb-14 pt-8 md:px-8 md:pt-10">
        <div className="grid justify-center gap-10 xl:grid-cols-[150px_720px]">
          <div className="hidden xl:block">
            <div className="h-4 w-24 bg-voicesNext-surface" />
          </div>

          <div className="w-full max-w-[720px]">
            <div className="h-4 w-24 bg-voicesNext-surface xl:hidden" />
            <div className="mt-6 h-6 w-28 bg-voicesNext-surface" />
            <div className="mt-5 h-10 w-full bg-voicesNext-surface md:h-14" />
            <div className="mt-3 h-10 w-3/4 bg-voicesNext-surface md:h-14" />
            <div className="mt-6 h-4 w-64 border-b border-voicesNext-border bg-voicesNext-surface pb-5" />
            <div className="mt-8 aspect-[16/9] border border-voicesNext-border bg-voicesNext-surface" />

            <div className="mt-8 space-y-3">
              {["100%", "96%", "92%", "98%", "70%"].map((width, index) => (
                <div
                  key={index}
                  className="h-4 bg-voicesNext-surface"
                  style={{ width }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
