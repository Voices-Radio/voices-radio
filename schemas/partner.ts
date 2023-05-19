import { StarIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export default defineType({
  name: "partner",
  title: "Partner",
  type: "document",
  icon: StarIcon,
  preview: {
    select: { title: "name", subtitle: "headline" },
  },
  fields: [
    defineField({
      name: "name",
      description: "The name of the partner",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      description: "Logo for the brand",
      options: {
        accept: "image/png",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "details",
      description:
        "Details about the relationship and/or discount codes for listeners",
      title: "Details",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          options: {},
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
  ],
});
