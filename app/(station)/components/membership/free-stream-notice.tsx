import { Radio } from "lucide-react";

/**
 * Says up front that membership is optional. Shown on the support and join
 * pages so nobody reads "join" as "pay to listen".
 */
export default function FreeStreamNotice() {
  return (
    <p className="flex w-full max-w-2xl items-start gap-3 border-l-2 border-voicesNext-orange bg-voicesNext-surface px-4 py-3 font-gabarito text-base font-bold leading-snug text-voicesNext-cream">
      <Radio
        aria-hidden="true"
        className="mt-[3px] shrink-0 text-voicesNext-orangeText"
        size={18}
        strokeWidth={2.4}
      />
      <span>
        Listening to Voices is always free. Membership is optional, and it
        funds the station.
      </span>
    </p>
  );
}
