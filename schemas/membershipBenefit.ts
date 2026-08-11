import { PackageIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "membershipBenefit",
  title: "Membership Benefit",
  type: "document",
  // @ts-ignore
  icon: PackageIcon,
  fields: [
    defineField({
      name: "slug",
      title: "Slug",
      description:
        "Stable slug matching the backend benefit id. Used for /benefits/{slug}.",
      type: "slug",
      options: { source: "name" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      description: "Short copy shown on benefit cards.",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: "fullDescription",
      title: "Full description",
      type: "text",
      rows: 5,
    }),
    defineField({
      name: "eligibilityExplanation",
      title: "Eligibility explanation",
      description:
        "Plain-language explanation of who can use this and any limits. Required for capacity-limited or application-based benefits (e.g. Open Decks / Supporter Radio) — must not imply guaranteed admission.",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "redemptionInstructions",
      title: "Redemption instructions",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "terms",
      title: "Terms",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "availableTierIds",
      title: "Available to tiers",
      description:
        "Tier ids that unlock this benefit (presentation only — actual entitlement is server-authoritative).",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Supporter", value: "supporter" },
          { title: "Member", value: "member" },
          { title: "Insider", value: "insider" },
          { title: "Patron", value: "patron" },
        ],
      },
    }),
    defineField({
      name: "isCapacityLimited",
      title: "Capacity limited",
      description:
        "Flags benefits like ballots or applications, where copy must present eligibility rather than guaranteed access.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "effectiveFrom",
      title: "Effective from",
      description: "Leave blank to publish immediately.",
      type: "datetime",
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "summary" },
  },
});
