export default function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="border-b border-voicesNext-border">
      <div className="mx-auto max-w-[1280px] px-4 py-10 md:px-8 md:py-16">
        {eyebrow && (
          <p className="mb-4 font-asap text-sm font-bold uppercase text-voicesNext-orangeText">
            {eyebrow}
          </p>
        )}
        <h1 className="text-balance max-w-4xl font-outfit text-5xl font-black uppercase leading-[0.95] text-voicesNext-cream md:text-7xl">
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-3xl font-gabarito text-lg leading-relaxed text-voicesNext-cream">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
