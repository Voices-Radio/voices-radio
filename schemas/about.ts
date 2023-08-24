import { DocumentIcon, UnderlineIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

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

    defineField({
      name: "hero_image",
      title: "Hero Image",
      type: "image",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "got_here_heading",
      type: "string",
      title: "How We Got Here - Heading",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "got_here",
      title: "How We Got Here - Content",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          options: { spellCheck: true },
          styles: [],
          lists: [],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              {
                title: "Underline",
                value: "u",
                // @ts-ignore
                icon: UnderlineIcon,
              },
            ],
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
      name: "bookings_image",
      title: "Bookings Image",
      type: "image",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "bookings_heading",
      type: "string",
      title: "Bookings - Heading",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "bookings",
      title: "Bookings",
      type: "array",
      of: [
        defineArrayMember({
          type: "string",
          title: "Booking",
        }),
      ],
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "our_values_heading",
      type: "string",
      title: "Our Values - Heading",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "our_values",
      title: "Our Values - Content",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          options: { spellCheck: true },
          styles: [],
          lists: [],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              {
                title: "Underline",
                value: "u",
                // @ts-ignore
                icon: UnderlineIcon,
              },
            ],
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
      name: "community_image",
      title: "Community Image",
      type: "image",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "community_heading",
      type: "string",
      title: "Our Community - Heading",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "community",
      title: "Our Community - Content",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          options: { spellCheck: true },
          styles: [],
          lists: [],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              {
                title: "Underline",
                value: "u",
                // @ts-ignore
                icon: UnderlineIcon,
              },
            ],
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
  ],
});
