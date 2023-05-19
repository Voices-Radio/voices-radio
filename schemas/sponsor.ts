import { StarIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "sponsor",
  title: "Sponsor",
  type: "document",
  icon: StarIcon,
  preview: {
    select: { title: "name", subtitle: "headline" },
  },
  fields: [
    defineField({
      name: "name",
      description: "The name of the sponsor",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      description: "Logo for the brand",
      options: {
        accept: "image/svg+xml",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "headline",
      description:
        "Short headline about the relationship between Voices and the sponsor",
      title: "Headline",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "details",
      description:
        "Details about the relationship and/or discount codes for listeners",
      title: "Details",
      type: "string",
      validation: (rule) => rule.max(155).required(),
    }),
  ],
});
