import { CalendarIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "event",
  title: "Event",
  type: "document",
  // @ts-ignore
  icon: CalendarIcon,
  groups: [
    { name: "content", title: "Content" },
    { name: "settings", title: "Settings" },
    { name: "cta", title: "CTA" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Short Description",
      type: "text",
      group: "content",
      rows: 3,
      validation: (rule) => rule.required().max(220),
    }),
    defineField({
      name: "artwork",
      title: "Artwork",
      type: "image",
      group: "content",
      options: { hotspot: true },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative Text",
          validation: (rule) => rule.required(),
        },
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "eventDate",
      title: "Event Date",
      type: "datetime",
      group: "settings",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "venue",
      title: "Venue",
      type: "string",
      group: "settings",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      group: "settings",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "Published", value: "published" },
          { title: "Archived", value: "archived" },
        ],
      },
      initialValue: "draft",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "featured",
      title: "Feature on Home",
      type: "boolean",
      group: "settings",
      initialValue: false,
    }),
    defineField({
      name: "ctaText",
      title: "CTA Text",
      type: "string",
      group: "cta",
      initialValue: "View event",
      validation: (rule) => rule.max(40),
    }),
    defineField({
      name: "ctaUrl",
      title: "CTA Link",
      type: "url",
      group: "cta",
      description:
        "Use a ticket, RSVP, or information URL. Relative links are allowed for local testing.",
      validation: (rule) => rule.uri({ allowRelative: true }),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "venue",
      media: "artwork",
    },
  },
  orderings: [
    {
      title: "Event Date, New",
      name: "eventDateDesc",
      by: [{ field: "eventDate", direction: "desc" }],
    },
    {
      title: "Event Date, Old",
      name: "eventDateAsc",
      by: [{ field: "eventDate", direction: "asc" }],
    },
  ],
});
