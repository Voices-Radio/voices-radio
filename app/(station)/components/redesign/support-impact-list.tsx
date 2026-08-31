// Shown in the signal readout when nobody has opted into the public wall yet
// — keeps the panel carrying real meaning instead of collapsing to a gap.
const IMPACT = [
  "Studio time for new shows",
  "Fair pay for the DJs on air",
  "A free, open archive for everyone",
];

export default function SupportImpactList() {
  return (
    <div>
      <p className="font-gabarito text-[13px] font-bold uppercase leading-[19px] tracking-wide text-white">
        What your support keeps on air
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {IMPACT.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2.5 font-gabarito text-[15px] leading-snug text-voicesNext-cream"
          >
            <span
              aria-hidden="true"
              className="mt-[8px] h-[2px] w-3 shrink-0 rounded-full bg-voicesNext-orange"
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
