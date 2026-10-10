import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  AccountPageIntro,
  AccountSurface,
  accountPrimaryButtonClassName,
} from "./account-surface";

/**
 * Home for a free (non-member) account: somewhere to find saved favourites and
 * set contact preferences, plus a plain invitation to become a member. Not an
 * "empty" state; a free account is a complete account.
 */
export default function FreeAccountHome({ firstName }: { firstName?: string }) {
  return (
    <div>
      <AccountPageIntro
        eyebrow="Account desk"
        title={firstName ? `Hi ${firstName}` : "Your account"}
        description="Your free Voices account lets you save your favourite artists & shows."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <AccountSurface>
          <h2 className="font-gabarito text-xl font-bold text-voicesNext-cream">
            Your favourites
          </h2>
          <p className="mt-3 font-asap text-sm leading-relaxed text-voicesNext-cream/75">
            The artists and shows you&rsquo;ve saved, all in one place.
          </p>
          <Link
            href="/account/favourites"
            className={cn(accountPrimaryButtonClassName, "mt-5 h-11 px-5 text-sm")}
          >
            View favourites
          </Link>
        </AccountSurface>

        <AccountSurface>
          <h2 className="font-gabarito text-xl font-bold text-voicesNext-cream">
            Become a member
          </h2>
          <p className="mt-3 font-asap text-sm leading-relaxed text-voicesNext-cream/75">
            Organise your favourites into playlists, plus merch and event
            discounts, early tickets and more.
          </p>
          <Link
            href="/join"
            className={cn(accountPrimaryButtonClassName, "mt-5 h-11 px-5 text-sm")}
          >
            Join as a member
          </Link>
        </AccountSurface>
      </div>

      <p className="mt-6 font-gabarito text-sm text-voicesNext-cream/70">
        <Link
          href="/account/profile"
          className="font-bold text-voicesNext-cream underline underline-offset-2 transition-colors hover:text-voicesNext-orange"
        >
          Contact preferences
        </Link>
        {" · "}
        Artist? Use the invitation link from Voices to claim your profile.
      </p>
    </div>
  );
}
