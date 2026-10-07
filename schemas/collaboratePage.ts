import { UsersIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export default defineType({
  name: "collaboratePage",
  title: "Partner with Us",
  type: "document",
  // @ts-ignore
  icon: UsersIcon,
  groups: [
    { name: "hero", title: "Hero" },
    { name: "cards", title: "Cards" },
    { name: "seo", title: "SEO" },
  ],
  preview: {
    prepare() {
      return { title: "Partner with Us (/collaborate)" };
    },
  },
  fields: [
    defineField({
      name: "internal",
      initialValue: "Partner with Us",
      type: "string",
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      group: "hero",
      description: "Leave blank to use: Partner with Us",
    }),
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      group: "hero",
      description: "Leave blank to use: Build with Voices",
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "text",
      rows: 3,
      group: "hero",
    }),
    defineField({
      name: "applyCtaText",
      title: "Apply button text",
      description:
        "The link comes from Settings → Apply link. Blank = Apply for a show",
      type: "string",
      group: "hero",
    }),
    defineField({
      name: "contactCtaText",
      title: "Contact button text",
      description:
        "The link comes from Settings → Contact link. Blank = Start a partnership conversation",
      type: "string",
      group: "hero",
    }),
    defineField({
      name: "cards",
      title: "Cards",
      description:
        "Add, reorder or remove cards. If you delete them all the original three come back.",
      type: "array",
      group: "cards",
      of: [
        defineArrayMember({
          name: "collaborateCard",
          title: "Card",
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "copy",
              title: "Text",
              type: "text",
              rows: 3,
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "href",
              title: "Link (optional)",
              type: "string",
              description: "A path like /podcast or a full https:// link.",
            }),
            defineField({
              name: "linkLabel",
              title: "Link text",
              type: "string",
            }),
          ],
          preview: { select: { title: "title", subtitle: "copy" } },
        }),
      ],
    }),
    defineField({
      name: "seoTitle",
      title: "Page title",
      type: "string",
      group: "seo",
    }),
    defineField({
      name: "seoDescription",
      title: "Meta description",
      type: "text",
      rows: 3,
      group: "seo",
      validation: (rule) => rule.max(200),
    }),
  ],
});
