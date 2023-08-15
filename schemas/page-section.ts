import { defineField, defineType } from "sanity";

export default defineType({
  name: "page-section",
  title: "Page Section",
  type: "document",
  preview: {
    select: { title: "internal" },
  },
  fields: [
    defineField({
      name: "internal",
      type: "string",
    }),
    defineField({
      name: "heading",
      type: "string",
      title: "Heading",
      description: "Heading",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "subheading",
      type: "text",
      title: "Subheading",
      description: "Subheading",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "cta_text",
      title: "Button Text",
      description: "Button text",
      type: "string",
    }),
    defineField({
      name: "cta_url",
      title: "Button Link",
      description: "Button link",
      type: "url",
      validation: (rule) => rule.uri({ allowRelative: true }),
    }),
    defineField({
      name: "carousel",
      title: "Carousel",
      type: "array",
      of: [{ type: "image", validation: (rule) => rule.required() }],
    }),
  ],
});
