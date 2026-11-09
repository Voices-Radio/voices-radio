export default function Loading() {
  return (
    <main className="min-h-[60vh] bg-voicesNext-background">
      <div className="mx-auto max-w-[1280px] px-4 py-10 md:px-8">
        <div className="h-10 w-48 animate-pulse rounded-voices-sm bg-voicesNext-surface" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="aspect-square animate-pulse rounded-voices-sm bg-voicesNext-surface"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
