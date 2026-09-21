export function SectionHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto mb-8 max-w-3xl text-center md:mb-14">
      <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-voices-purple md:text-sm">
        {eyebrow}
      </p>
      <h2 className="text-2xl font-black leading-tight text-slate-900 sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {children ? (
        <div className="mt-5 text-base font-semibold leading-relaxed text-slate-600 md:text-lg">
          {children}
        </div>
      ) : null}
    </div>
  );
}
