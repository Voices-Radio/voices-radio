import { HomeIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";
import FeaturedImageInput from "./inputs/FeaturedImageInput";
import ShowPickerInput from "./inputs/ShowPickerInput";

const showSelectionFields = [
  defineField({
    name: "showId",
    title: "Show ID",
    type: "string",
    readOnly: true,
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: "title",
    title: "Cached Title",
    type: "string",
    readOnly: true,
  }),
  defineField({
    name: "date",
    title: "Cached Date",
    type: "datetime",
    readOnly: true,
  }),
  defineField({
    name: "artistName",
    title: "Cached Artist",
    type: "string",
    readOnly: true,
  }),
  defineField({
    name: "imageUrl",
    title: "Cached Image URL",
    type: "url",
    readOnly: true,
  }),
  defineField({
    name: "matchingStatus",
    title: "Cached Matching Status",
    type: "string",
    readOnly: true,
  }),
];

const overrideFields = [
  defineField({
    name: "label",
    title: "Override Label",
    type: "string",
  }),
  defineField({
    name: "title",
    title: "Override Title",
    type: "string",
  }),
  defineField({
    name: "description",
    title: "Override Description",
    type: "text",
    rows: 3,
  }),
  defineField({
    name: "image",
    title: "Featured Image & Crop",
    description:
      "Seeded from the selected content. Crop and hotspot changes apply only to this featured placement.",
    type: "image",
    options: { hotspot: true },
    components: {
      input: FeaturedImageInput,
    },
    fields: [
      defineField({
        name: "alt",
        title: "Alternative Text",
        type: "string",
      }),
      defineField({
        name: "featuredSourceKey",
        title: "Featured Source Key",
        type: "string",
        hidden: true,
        readOnly: true,
      }),
    ],
  }),
  defineField({
    name: "ctaText",
    title: "Override CTA Text",
    type: "string",
  }),
];

const imageOverrideField = defineField({
  name: "image",
  title: "Override Image",
  description:
    "Optional image used instead of the upstream show artwork. Use Sanity crop/hotspot to refine framing.",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Alternative Text",
      type: "string",
    }),
  ],
});

/**
 * Members of any hand-curated show list (Featured lane and swimlanes):
 * a plain show pick, or a pick with an image override.
 */
const curatedShowMembers = [
  { type: "homeShowSelection" },
  defineArrayMember({
    name: "homeRailShow",
    title: "Show With Image Override",
    type: "object",
    fields: [
      defineField({
        name: "show",
        title: "Show",
        type: "homeShowSelection",
        validation: (rule) => rule.required(),
      }),
      imageOverrideField,
    ],
    preview: {
      select: {
        title: "show.title",
        artistName: "show.artistName",
        media: "image",
      },
      prepare(selection) {
        return {
          title: selection.title ?? "Show",
          subtitle: ["Curated show", selection.artistName]
            .filter(Boolean)
            .join(" / "),
          media: selection.media,
        };
      },
    },
  }),
];

export const homeShowSelectionType = defineType({
  name: "homeShowSelection",
  title: "Show",
  type: "object",
  components: {
    input: ShowPickerInput,
  },
  fields: showSelectionFields,
  preview: {
    select: {
      title: "title",
      artistName: "artistName",
      matchingStatus: "matchingStatus",
      date: "date",
    },
    prepare(selection) {
      return {
        title: selection.title ?? "No show selected",
        subtitle: [
          selection.artistName,
          selection.matchingStatus,
          selection.date,
        ]
          .filter(Boolean)
          .join(" / "),
      };
    },
  },
});

export default defineType({
  name: "homePage",
  title: "Home",
  type: "document",
  // @ts-ignore
  icon: HomeIcon,
  groups: [
    { name: "featured", title: "1. Feature panel" },
    { name: "fixed", title: "2. Latest on KX & Featured" },
    { name: "apply", title: "3. Apply banner" },
    { name: "rails", title: "4. Swimlanes" },
    { name: "live", title: "Live Streams" },
  ],
  preview: {
    prepare() {
      return { title: "Home" };
    },
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
      name: "featuredContent",
      title: "Featured Content",
      description:
        "Exactly 8 ordered pieces of content shown in the Home feature panel.",
      type: "array",
      group: "featured",
      of: [
        defineArrayMember({
          name: "homeFeaturedShow",
          title: "Show",
          type: "object",
          fields: [
            defineField({
              name: "show",
              title: "Show",
              type: "homeShowSelection",
              validation: (rule) => rule.required(),
            }),
            ...overrideFields,
          ],
          preview: {
            select: {
              title: "title",
              showTitle: "show.title",
              artistName: "show.artistName",
            },
            prepare(selection) {
              return {
                title: selection.title ?? selection.showTitle ?? "Show",
                subtitle: ["Show", selection.artistName]
                  .filter(Boolean)
                  .join(" / "),
              };
            },
          },
        }),
        defineArrayMember({
          name: "homeFeaturedBlog",
          title: "Blog",
          type: "object",
          fields: [
            defineField({
              name: "blog",
              title: "Blog Post",
              type: "reference",
              to: [{ type: "mainBlog" }],
              options: {
                filter: "status == 'published'",
              },
              validation: (rule) => rule.required(),
            }),
            ...overrideFields,
          ],
          preview: {
            select: {
              title: "title",
              blogTitle: "blog.title",
              media: "image",
            },
            prepare(selection) {
              return {
                title: selection.title ?? selection.blogTitle ?? "Blog",
                subtitle: "Blog",
                media: selection.media,
              };
            },
          },
        }),
        defineArrayMember({
          name: "homeFeaturedEvent",
          title: "Event",
          type: "object",
          fields: [
            defineField({
              name: "event",
              title: "Event",
              type: "reference",
              to: [{ type: "event" }],
              options: {
                filter: "status == 'published'",
              },
              validation: (rule) => rule.required(),
            }),
            ...overrideFields,
          ],
          preview: {
            select: {
              title: "title",
              eventTitle: "event.title",
              media: "image",
            },
            prepare(selection) {
              return {
                title: selection.title ?? selection.eventTitle ?? "Event",
                subtitle: "Event",
                media: selection.media,
              };
            },
          },
        }),
      ],
      validation: (rule) => rule.required().length(8),
    }),
    defineField({
      name: "latestKxLane",
      title: "Latest on KX",
      description:
        "Always sits first, above Featured. Fills itself with the newest shows; only the heading and blurb are editable here.",
      type: "object",
      group: "fixed",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: "title",
          title: "Title",
          type: "string",
          initialValue: "Latest on KX",
        }),
        defineField({
          name: "description",
          title: "Description",
          type: "text",
          rows: 3,
        }),
      ],
    }),
    defineField({
      name: "featuredLane",
      title: "Featured",
      description:
        "Always sits second, directly above the Apply banner. Hand-pick the shows; the list is hidden on the site while it is empty.",
      type: "object",
      group: "fixed",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: "title",
          title: "Title",
          type: "string",
          initialValue: "Featured",
        }),
        defineField({
          name: "description",
          title: "Description",
          type: "text",
          rows: 3,
        }),
        defineField({
          name: "shows",
          title: "Shows",
          type: "array",
          of: curatedShowMembers,
        }),
      ],
    }),
    defineField({
      name: "applyBanner",
      title: "Apply for a show banner",
      description:
        "Sits between Featured and the swimlanes. The button link comes from Settings → Apply link.",
      type: "object",
      group: "apply",
      fields: [
        defineField({
          name: "heading",
          title: "Heading (desktop)",
          type: "string",
          initialValue: "Apply for a show!",
        }),
        defineField({
          name: "mobileBody",
          title: "Body (mobile)",
          type: "text",
          rows: 4,
        }),
        defineField({
          name: "ctaText",
          title: "Button text",
          type: "string",
          initialValue: "Apply for a show",
        }),
      ],
    }),
    defineField({
      name: "liveStreams",
      title: "Live Streams",
      type: "object",
      group: "live",
      fields: [
        defineField({
          name: "kx",
          title: "KX",
          type: "object",
          fields: [
            defineField({
              name: "fallbackImage",
              title: "Fallback Image",
              type: "image",
              options: { hotspot: true },
              fields: [
                defineField({
                  name: "alt",
                  title: "Alternative Text",
                  type: "string",
                }),
              ],
            }),
          ],
        }),
        defineField({
          name: "east",
          title: "East",
          type: "object",
          fields: [
            defineField({
              name: "fallbackImage",
              title: "Fallback Image",
              type: "image",
              options: { hotspot: true },
              fields: [
                defineField({
                  name: "alt",
                  title: "Alternative Text",
                  type: "string",
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "showRails",
      title: "Swimlanes (below the Apply banner)",
      description:
        "Add as many or as few as you like, drag to reorder, switch off with Enabled, or delete when you are done. Lists with no shows are hidden.",
      type: "array",
      group: "rails",
      of: [
        defineArrayMember({
          name: "homeShowRail",
          title: "Swimlane",
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "text",
              rows: 3,
            }),
            defineField({
              name: "key",
              title: "Key",
              type: "slug",
              options: {
                source: "title",
                maxLength: 64,
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "enabled",
              title: "Enabled",
              type: "boolean",
              initialValue: true,
            }),
            defineField({
              name: "shows",
              title: "Shows",
              type: "array",
              of: curatedShowMembers,
            }),
          ],
          preview: {
            select: {
              title: "title",
              enabled: "enabled",
              shows: "shows",
            },
            prepare(selection) {
              const count = Array.isArray(selection.shows)
                ? selection.shows.length
                : 0;
              return {
                title: selection.title ?? "Swimlane",
                subtitle: `${
                  selection.enabled === false ? "Disabled" : "Enabled"
                } / ${count} shows`,
              };
            },
          },
        }),
      ],
    }),
  ],
});
