import { ThListIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

function copyFields(
  fields: Array<{
    name: string;
    title: string;
    kind?: "string" | "text";
    placeholder?: string;
  }>,
) {
  return fields.map(({ name, title, kind = "string", placeholder }) =>
    defineField({
      name,
      title,
      type: kind,
      ...(kind === "text" ? { rows: 3 } : {}),
      description: placeholder
        ? `Leave blank to use: ${placeholder}`
        : undefined,
    }),
  );
}

export default defineType({
  name: "listingPages",
  title: "Listing pages",
  type: "document",
  // @ts-ignore
  icon: ThListIcon,
  preview: {
    prepare() {
      return { title: "Listing pages" };
    },
  },
  groups: [
    { name: "shows", title: "/shows" },
    { name: "artists", title: "/artists" },
    { name: "music", title: "/explore (Music)" },
    { name: "blog", title: "/blog" },
  ],
  fields: [
    defineField({
      name: "internal",
      initialValue: "Listing pages",
      type: "string",
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: "shows",
      title: "Shows page",
      type: "object",
      group: "shows",
      fields: copyFields([
        { name: "eyebrow", title: "Eyebrow", placeholder: "Shows" },
        { name: "title", title: "Title", placeholder: "Listen back" },
        {
          name: "description",
          title: "Description",
          kind: "text",
          placeholder: "Catch up on shows from the Voices archive.",
        },
      ]),
    }),
    defineField({
      name: "artists",
      title: "Artists page",
      type: "object",
      group: "artists",
      fields: copyFields([
        { name: "title", title: "Title (single list)", placeholder: "Artists" },
        {
          name: "description",
          title: "Description (single list)",
          kind: "text",
          placeholder: "Browse all Voices artists, presenters and hosts.",
        },
        {
          name: "kxTitle",
          title: "KX section title",
          placeholder: "Voices KX",
        },
        {
          name: "kxDescription",
          title: "KX section description",
          kind: "text",
          placeholder: "Browse the hosts at our Kings Cross studio.",
        },
        {
          name: "eastTitle",
          title: "EAST section title",
          placeholder: "Voices EAST",
        },
        {
          name: "eastDescription",
          title: "EAST section description",
          kind: "text",
          placeholder: "Browse the hosts at our Hackney Wick studio.",
        },
      ]),
    }),
    defineField({
      name: "music",
      title: "Music (Explore) page",
      type: "object",
      group: "music",
      fields: copyFields([
        { name: "title", title: "Heading", placeholder: "Music" },
      ]),
    }),
    defineField({
      name: "blog",
      title: "Blog page",
      type: "object",
      group: "blog",
      fields: copyFields([
        { name: "eyebrow", title: "Eyebrow", placeholder: "From the station" },
        { name: "title", title: "Title", placeholder: "Blog" },
        {
          name: "description",
          title: "Description",
          kind: "text",
          placeholder: "Stories, news and updates from the Voices community…",
        },
      ]),
    }),
  ],
});
