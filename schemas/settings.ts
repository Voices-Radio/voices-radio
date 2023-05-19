import { CogIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "settings",
  title: "Settings",
  type: "document",
  icon: CogIcon,
  preview: {
    select: { title: "title", subtitle: "description" },
  },
  fields: [
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
      options: {
        hotspot: true,
      },
    }),
  ],
});
