export default function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="border-b border-voicesNext-border pb-4">
      <h2 className="font-gabarito text-[22px] font-bold leading-none text-voicesNext-cream md:text-[24px]">
        {title}
      </h2>
      {description && (
        <p className="mt-3 max-w-4xl font-gabarito text-[12px] leading-tight text-voicesNext-secondary">
          {description}
        </p>
      )}
    </div>
  );
}
