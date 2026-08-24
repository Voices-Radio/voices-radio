export default function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="px-2 pb-2 md:border-b md:border-voicesNext-border md:px-0 md:pb-4">
      <h2 className="text-balance font-gabarito text-[20px] font-bold leading-none text-voicesNext-cream md:text-[24px]">
        {title}
      </h2>
      {description && (
        <p className="mt-1 max-w-4xl font-asap text-[13px] leading-tight text-voicesNext-secondary md:mt-3 md:font-gabarito md:text-[12px]">
          {description}
        </p>
      )}
    </div>
  );
}
