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
      name: "key",
      title: "Backend key",
      description: "Immutable key shared with the membership backend and benefit URL.",
      type: "string",
      validation: (rule) => rule.required().regex(/^[a-z0-9_]+$/),
    }),
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
    defineField({
      name: "benefitType",
      title: "Benefit type",
      type: "string",
      options: {
        list: [
          "merch_discount",
          "podcast_discount",
          "event_presale",
          "partner_perk",
          "studio_ballot",
          "workshop_priority",
          "submission_eligibility",
          "annual_pack",
          "patron_experience",
          "other",
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "redemptionModel",
      title: "Redemption model",
      type: "string",
      options: { list: ["single_use", "repeatable", "quota", "capacity"] },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "eligibleCadences",
      title: "Eligible cadences",
      type: "array",
      of: [{ type: "string" }],
      initialValue: ["monthly", "annual"],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({ name: "quota", title: "Quota", type: "number" }),
    defineField({
      name: "quotaPeriod",
      title: "Quota period",
      type: "string",
      options: { list: ["membership_period", "calendar_month", "calendar_year", "lifetime"] },
    }),
    defineField({ name: "capacityTotal", title: "Capacity", type: "number" }),
    defineField({
      name: "requiresPhysicalAddress",
      title: "Requires physical address",
      type: "boolean",
      initialValue: false,
    }),
    defineField({ name: "campaignKey", title: "Campaign key", type: "string" }),
    defineField({ name: "active", title: "Active", type: "boolean", initialValue: true }),
  ],
  preview: {
    select: { title: "name", subtitle: "summary" },
  },
});
