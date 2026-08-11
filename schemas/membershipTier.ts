import { StarIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "membershipTier",
  title: "Membership Tier",
  type: "document",
  // @ts-ignore
  icon: StarIcon,
  fields: [
    defineField({
      name: "tierId",
      title: "Tier ID",
      description:
        "Stable slug matching the backend tier id (e.g. supporter, member, insider, patron). Do not change after launch.",
      type: "slug",
      options: { source: "name" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: "headline",
      title: "Headline",
      description: "Short tagline, e.g. \"Get closer to Voices.\"",
      type: "string",
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "monthlyPriceDisplay",
      title: "Monthly price (display)",
      description:
        "Presentation copy only, e.g. \"£8\". The backend is the source of truth for the amount actually charged.",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "annualPriceDisplay",
      title: "Annual price (display)",
      description: "Presentation copy only, e.g. \"£80\".",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "benefitBullets",
      title: "Benefit bullets",
      type: "array",
      of: [{ type: "string" }],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "mostPopular",
      title: "Most popular",
      description: "Show the \"Most popular\" badge on this tier.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "sortOrder",
      title: "Sort order",
      type: "number",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "effectiveFrom",
      title: "Effective from",
      description:
        "Leave blank to publish immediately. Set a future date to schedule this tier's copy/pricing without a frontend deploy.",
      type: "datetime",
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "headline" },
  },
  orderings: [
    {
      title: "Sort order",
      name: "sortOrderAsc",
      by: [{ field: "sortOrder", direction: "asc" }],
    },
  ],
});
