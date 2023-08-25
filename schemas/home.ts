import { HomeIcon, UnderlineIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export default defineType({
  name: "home",
  title: "Home",
  type: "document",
  // @ts-ignore
  icon: HomeIcon,
  groups: [
    { name: "hero", title: "Hero Section" },
    { name: "community", title: "Community Section" },
    { name: "apply", title: "Apply Section" },
  ],
  preview: {
    select: { title: "internal" },
  },
  fields: [
    defineField({
      name: "internal",
      initialValue: "Home",
      type: "string",
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: "schedule",
      title: "Hero Section - Schedule",
      group: "hero",
      description: "Hours and days when the station is live",
      type: "text",
      validation: (rule) => rule.required(),
    }),
    /**
     * First Section
     */
    defineField({
      name: "community_heading",
      type: "string",
      title: "Community Section - Heading",
      group: "community",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "community_subheading",
      title: "Community Section - Subheading",
      group: "community",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          options: { spellCheck: true },
          styles: [],
          lists: [],
          marks: {
            decorators: [{ title: "Strong", value: "strong" }],
            annotations: [
              defineField({
                type: "object",
                name: "link",
                fields: [
                  {
                    type: "string",
                    name: "href",
                    title: "URL",
                    validation: (rule) => rule.required(),
                  },
                ],
              }),
            ],
          },
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "community_cta_text",
      title: "Community Section - Button Text",
      type: "string",
      group: "community",
    }),
    defineField({
      name: "community_cta_url",
      title: "Community Section - Button Link",
      type: "url",
      group: "community",
      validation: (rule) => rule.uri({ allowRelative: true }),
    }),
    defineField({
      name: "community_carousel",
      title: "Communtiy Section - Carousel",
      group: "community",
      type: "array",
      of: [{ type: "image", validation: (rule) => rule.required() }],
      validation: (rule) => rule.required(),
    }),
    /**
     * Second Section
     */
    defineField({
      name: "community_heading_secondary",
      type: "string",
      title: "Community Section - Heading Secondary",
      group: "community",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "community_subheading_secondary",
      title: "Community Section - Subheading Secondary",
      group: "community",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          options: { spellCheck: true },
          styles: [],
          lists: [],
          marks: {
            decorators: [{ title: "Strong", value: "strong" }],
            annotations: [
              defineField({
                type: "object",
                name: "link",
                fields: [
                  {
                    type: "string",
                    name: "href",
                    title: "URL",
                    validation: (rule) => rule.required(),
                  },
                ],
              }),
            ],
          },
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "community_cta_text_secondary",
      title: "Community Section - Button Text Secondary",
      type: "string",
      group: "community",
    }),
    defineField({
      name: "community_cta_url_secondary",
      title: "Community Section - Button Link Secondary",
      type: "url",
      group: "community",
      validation: (rule) => rule.uri({ allowRelative: true }),
    }),
    defineField({
      name: "community_carousel_secondary",
      title: "Community Section - Carousel Secondary",
      group: "community",
      type: "array",
      of: [{ type: "image", validation: (rule) => rule.required() }],
      validation: (rule) => rule.required(),
    }),
    /**
     * Apply
     */
    defineField({
      name: "apply_background",
      title: "Apply Section - Background Image",
      group: "apply",
      type: "image",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "apply_heading",
      title: "Apply Section - Heading",
      group: "apply",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "apply_subheading",
      title: "Apply Section - Subheading",
      type: "text",
      group: "apply",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "apply_cta_text",
      title: "Apply Section - Button Text",
      type: "string",
      group: "apply",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "apply_cta_url",
      title: "Apply Section - Button Link",
      type: "url",
      group: "apply",
      validation: (rule) => rule.required().uri({ scheme: ["https"] }),
    }),
  ],
});
