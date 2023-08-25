import { CogIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export default defineType({
  name: "settings",
  title: "Settings",
  type: "document",
  // @ts-ignore
  icon: CogIcon,
  groups: [
    { name: "links", title: "Links" },
    { name: "seo", title: "SEO" },
  ],
  preview: {
    select: { title: "internal" },
  },
  fields: [
    defineField({
      name: "internal",
      initialValue: "Settings",
      type: "string",
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: "title",
      description:
        "This field is the title of your site, used in <title> tag for SEO.",
      title: "Title",
      group: "seo",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      description: "Used for the <meta> description tag for SEO",
      title: "Description",
      group: "seo",
      type: "string",
      validation: (rule) => rule.max(155).required(),
    }),
    defineField({
      name: "ogImage",
      title: "Open Graph Image",
      group: "seo",
      type: "image",
      description: "Displayed on social cards and search engine results.",
    }),
    defineField({
      name: "address",
      title: "Address",
      description: "Address of Voices Radio in the footer",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          options: { spellCheck: true },
          styles: [],
          lists: [],
          marks: {
            decorators: [],
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
      name: "contact_link",
      title: "Contact Link",
      description: "Email link for Contact Us button",
      type: "url",
      group: "links",
      validation: (rule) =>
        rule.required().uri({
          scheme: ["mailto"],
        }),
    }),
    defineField({
      name: "twitter_link",
      title: "Twitter Link",
      type: "url",
      group: "links",
      validation: (rule) =>
        rule.required().uri({
          scheme: ["https"],
        }),
    }),
    defineField({
      name: "instagram_link",
      title: "Instagram Link",
      type: "url",
      group: "links",
      validation: (rule) =>
        rule.required().uri({
          scheme: ["https"],
        }),
    }),
    defineField({
      name: "facebook_link",
      title: "Facebook Link",
      type: "url",
      group: "links",
      validation: (rule) =>
        rule.required().uri({
          scheme: ["https"],
        }),
    }),
    defineField({
      name: "linkedin_link",
      title: "LinkedIn Link",
      type: "url",
      group: "links",
      validation: (rule) =>
        rule.required().uri({
          scheme: ["https"],
        }),
    }),
    defineField({
      name: "mixcloud_link",
      title: "Mixcloud Link",
      type: "url",
      group: "links",
      validation: (rule) =>
        rule.required().uri({
          scheme: ["https"],
        }),
    }),
    defineField({
      name: "store_link",
      title: "Store Link",
      type: "url",
      group: "links",
      validation: (rule) =>
        rule.required().uri({
          scheme: ["https"],
        }),
    }),
    defineField({
      name: "apply_link",
      title: "Apply Link",
      type: "url",
      group: "links",
      validation: (rule) =>
        rule.required().uri({
          scheme: ["https"],
        }),
    }),
  ],
});
