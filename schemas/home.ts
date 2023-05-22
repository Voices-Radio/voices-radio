import { HomeIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "home",
  title: "Home",
  type: "document",
  icon: HomeIcon,
  groups: [{ name: "apply", title: "Apply Section" }],
  preview: {
    select: { title: "internal" },
  },
  fields: [
    defineField({
      name: "internal",
      initialValue: "Home",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "apply_heading",
      title: "Heading",
      description: "Heading for the Apply section",
      group: "apply",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "apply_subheading",
      title: "Subheading",
      description: "Subheading for the Apply section",
      type: "text",
      group: "apply",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "apply_cta_text",
      title: "Button Text",
      description: "Button text for the Apply section",
      type: "string",
      group: "apply",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "apply_cta_url",
      title: "Button Link",
      description: "Button link for the Apply section",
      type: "url",
      group: "apply",
      validation: (rule) => rule.required().uri({ scheme: ["https"] }),
    }),
  ],
});
