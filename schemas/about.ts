import { DocumentIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "about",
  title: "About",
  type: "document",
  // @ts-ignore
  icon: DocumentIcon,
  preview: {
    select: { title: "internal" },
  },
  fields: [
    defineField({
      name: "internal",
      initialValue: "About",
      type: "string",
      readOnly: true,
      hidden: true,
    }),
    /**
     * First Section
     */
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
      validation: (rule) => rule.required(),
    }),
    /**
     * Second Section
     */
    defineField({
      name: "heading_2",
      type: "string",
      title: "Heading #2",
      description: "Heading",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "subheading_2",
      type: "text",
      title: "Subheading #2",
      description: "Subheading",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "cta_text_2",
      title: "Button Text #2",
      description: "Button text",
      type: "string",
    }),
    defineField({
      name: "cta_url_2",
      title: "Button Link #2",
      description: "Button link",
      type: "url",
      validation: (rule) => rule.uri({ allowRelative: true }),
    }),
    defineField({
      name: "carousel_2",
      title: "Carousel #2",
      type: "array",
      of: [{ type: "image", validation: (rule) => rule.required() }],
      validation: (rule) => rule.required(),
    }),
    /**
     * Third Section
     */
    defineField({
      name: "heading_3",
      type: "string",
      title: "Heading #3",
      description: "Heading",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "subheading_3",
      type: "text",
      title: "Subheading #3",
      description: "Subheading",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "cta_text_3",
      title: "Button Text #3",
      description: "Button text",
      type: "string",
    }),
    defineField({
      name: "cta_url_3",
      title: "Button Link #3",
      description: "Button link",
      type: "url",
      validation: (rule) => rule.uri({ allowRelative: true }),
    }),
    defineField({
      name: "carousel_3",
      title: "Carousel #3",
      type: "array",
      of: [{ type: "image", validation: (rule) => rule.required() }],
      validation: (rule) => rule.required(),
    }),
  ],
});
