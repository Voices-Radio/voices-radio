import { DocumentIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export default defineType({
  name: "services",
  title: "Services",
  type: "document",
  // @ts-ignore
  icon: DocumentIcon,
  preview: {
    select: { title: "internal" },
  },
  fields: [
    defineField({
      name: "internal",
      initialValue: "Services",
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
      name: "services_heading",
      type: "string",
      title: "Service Heading",
      validation: (rule) => rule.required()
    }),

    defineField({
      name: "services_main",
      title: "Services Main - Content",
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
      name: "services_main_option1",
      title: "Services Main 1 - Content",
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
      name: "services_main_option2",
      title: "Services Main 1 - Content",
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
      name: "services_main_option3",
      title: "Services Main 1 - Content",
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
      name: "services_main_option4",
      title: "Services Main 1 - Content",
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
      name: "services_heading1",
      type: "string",
      title: "Service Heading 1",
      validation: (rule) => rule.required()
    }),

    defineField({
      name: "services_main1",
      title: "Services Main 1 - Content",
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
      name: "services_main1_image",
      title: "Services Main 1 - Image",
      type: "image",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "services_heading2",
      type: "string",
      title: "Service Heading 2",
      validation: (rule) => rule.required()
    }),

    defineField({
      name: "services_main2",
      title: "Services Main 2 - Content",
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
      name: "services_main2_image",
      title: "Services Main 2 - Image",
      type: "image",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "services_heading3",
      type: "string",
      title: "Service Heading 3",
      validation: (rule) => rule.required()
    }),

    defineField({
      name: "services_main3",
      title: "Services Main 3 - Content",
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
      name: "services_main3_image",
      title: "Services Main 3 - Image",
      type: "image",
      validation: (rule) => rule.required(),
    }),

    
    defineField({
      name: "services_heading4",
      type: "string",
      title: "Service Heading 4",
      validation: (rule) => rule.required()
    }),

    defineField({
      name: "services_main4",
      title: "Services Main 4 - Content",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          options: { spellCheck: true },
          styles: [],
          lists: [{ title: "Bullet", value: "bullet" }], // Enable bullet list
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
      name: "services_main4_image",
      title: "Services Main 4 - Image",
      type: "image",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "services_final_image",
      title: "Final Services Image",
      type: "image",
      validation: (rule) => rule.required(),
    }),
  ],
});
