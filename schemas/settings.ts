import { CogIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "settings",
  title: "Settings",
  type: "document",
  icon: CogIcon,
  preview: {
    select: { title: "internal" },
  },
  fields: [
    defineField({
      name: "internal",
      initialValue: "Settings",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "title",
      description:
        "This field is the title of your site, used in <title> tag for SEO.",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      description: "Used for the <meta> description tag for SEO",
      title: "Description",
      type: "string",
      validation: (rule) => rule.max(155).required(),
    }),
    defineField({
      name: "ogImage",
      title: "Open Graph Image",
      type: "image",
      description: "Displayed on social cards and search engine results.",
    }),
    defineField({
      name: "address",
      title: "Address",
      description: "Address of Voices Radio in the footer",
      type: "text",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "contact_link",
      title: "Contact Link",
      description: "Email link for Contact Us button",
      type: "url",
      validation: (rule) =>
        rule.required().uri({
          scheme: ["mailto"],
        }),
    }),
  ],
});
