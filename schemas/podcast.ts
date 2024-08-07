import { DocumentIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export default defineType({
  name: "podcast",
  title: "Podcast",
  type: "document",
  // @ts-ignore
  icon: DocumentIcon,
  preview: {
    select: { title: "internal" },
  },
  fields: [
    defineField({
      name: "internal",
      initialValue: "Podcast",
      type: "string",
      readOnly: true,
      hidden: true,
    }),

    defineField({
      name: "hero_image",
      title: "Hero Image",
      type: "image",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "heading_podcast_intro",
      type: "string",
      title: "Podcast Intro",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "podcast_cta_text",
      title: "Podcast Section - Button Text",
      type: "string",
    }),
    defineField({
      name: "podcast_cta_url",
      title: "Podcast Section - Button Link",
      type: "url",
      validation: (rule) => rule.uri({ allowRelative: true }),
    }),

    defineField({
      name: "podcast_intro_content",
      title: "Podcast Intro - Content",
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
      name: "podcast_main_heading",
      type: "string",
      title: "Podcast Main - Heading",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "podcast_main",
      title: "Podcast Main - Content",
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
      name: "podcast_main_image",
      title: "Podcast Main - Image",
      type: "image",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "podcast_final_heading",
      type: "string",
      title: "Podcast Final - Heading",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "podcast_final",
      title: "Podcast Final - Content",
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
      name: "podcast_final_image",
      title: "Final Podcast Image",
      type: "image",
      validation: (rule) => rule.required(),
    }),
  ],
});
