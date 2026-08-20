"use client";

import { env } from "@/env";

/**
 * Typed membership funnel events. Deliberately narrow: tier/cadence/benefit
 * slug only — never an email, user ID or membership ID reaches Fathom.
 * Mirrors the lazy dynamic-import pattern in app/components/fathom.tsx so
 * fathom-client is only pulled in when actually tracking.
 */
export type MembershipAnalyticsEvent =
  | {
      name: "membership_tier_viewed";
      tierId: string;
      cadence: "monthly" | "annual";
    }
  | { name: "membership_cadence_toggled"; cadence: "monthly" | "annual" }
  | {
      name: "membership_checkout_started";
      tierId: string;
      cadence: "monthly" | "annual";
    }
  | { name: "membership_checkout_reconciled" }
  | { name: "membership_upgraded"; tierId: string }
  | { name: "membership_downgrade_scheduled"; tierId: string }
  | { name: "membership_cadence_changed"; cadence: "monthly" | "annual" }
  | { name: "membership_cancelled" }
  | { name: "membership_resumed" }
  | { name: "membership_benefit_redeemed"; benefitSlug: string };

let fathomClient: Promise<typeof import("fathom-client")> | undefined;
type FathomClient = typeof import("fathom-client") & {
  trackEvent?: (name: string) => void;
};

function getFathomClient() {
  fathomClient ??= import("fathom-client");
  return fathomClient;
}

/**
 * Fathom's trackEvent only accepts an event name and an optional numeric
 * `_value` — no custom string properties. So tier/cadence/benefit-slug are
 * folded into the event name itself (still no email/user/membership ID),
 * rather than sent as event metadata Fathom can't actually store.
 */
export function eventName(event: MembershipAnalyticsEvent): string {
  switch (event.name) {
    case "membership_tier_viewed":
      return `membership_tier_viewed:${event.tierId}:${event.cadence}`;
    case "membership_cadence_toggled":
      return `membership_cadence_toggled:${event.cadence}`;
    case "membership_checkout_started":
      return `membership_checkout_started:${event.tierId}:${event.cadence}`;
    case "membership_upgraded":
      return `membership_upgraded:${event.tierId}`;
    case "membership_downgrade_scheduled":
      return `membership_downgrade_scheduled:${event.tierId}`;
    case "membership_cadence_changed":
      return `membership_cadence_changed:${event.cadence}`;
    case "membership_benefit_redeemed":
      return `membership_benefit_redeemed:${event.benefitSlug}`;
    default:
      return event.name;
  }
}

export function trackMembershipEvent(event: MembershipAnalyticsEvent) {
  if (env.NEXT_PUBLIC_SITE_ENV !== "production") return;

  void getFathomClient().then((client) => {
    const fathom = client as FathomClient;
    const name = eventName(event);
    if (fathom.trackEvent) {
      fathom.trackEvent(name);
      return;
    }
    fathom.trackGoal(name, 0);
  });
}
