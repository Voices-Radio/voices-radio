import { DocumentIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export default defineType({
  name: "mainBlog",
  title: "Blog Post (Main Website)",
  type: "document",
  // @ts-ignore
  icon: DocumentIcon,
  groups: [
    { name: "content", title: "Content" },
    { name: "seo", title: "SEO" },
    { name: "settings", title: "Settings" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      group: "content",
      rows: 3,
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: "featuredImage",
      title: "Featured Image",
      type: "image",
      group: "content",
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative Text",
          description: "Important for SEO and accessibility",
          validation: (rule) => rule.required(),
        },
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "block",
          options: { spellCheck: true },
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "H4", value: "h4" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Number", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
              { title: "Code", value: "code" },
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
                  {
                    type: "string",
                    name: "title",
                    title: "Link Title",
                  },
                ],
              }),
            ],
          },
        }),
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            {
              name: "alt",
              type: "string",
              title: "Alternative Text",
              description: "Important for SEO and accessibility",
            },
            {
              name: "caption",
              type: "string",
              title: "Caption",
            },
          ],
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "string",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      group: "content",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "News", value: "news" },
          { title: "Community", value: "community" },
          { title: "Events", value: "events" },
          { title: "Music", value: "music" },
          { title: "Interviews", value: "interviews" },
          { title: "Behind The Scenes", value: "behind-the-scenes" },
        ],
      },
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      group: "content",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
    }),
    defineField({
      name: "publishedAt",
      title: "Published Date",
      type: "datetime",
      group: "settings",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "featured",
      title: "Featured Post",
      type: "boolean",
      group: "settings",
      description: "Show this post in featured sections",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      group: "settings",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "Published", value: "published" },
        ],
      },
      initialValue: "draft",
      validation: (rule) => rule.required(),
    }),
    // SEO Fields
    defineField({
      name: "metaTitle",
      title: "Meta Title",
      type: "string",
      group: "seo",
      description: "Title for search engines (max 60 characters)",
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: "metaDescription",
      title: "Meta Description",
      type: "text",
      group: "seo",
      rows: 3,
      description: "Description for search engines (max 160 characters)",
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: "keywords",
      title: "Keywords",
      type: "array",
      group: "seo",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
    }),
    defineField({
      name: "ogImage",
      title: "Social Media Image",
      type: "image",
      group: "seo",
      description: "Image for social media sharing (1200x630px recommended)",
      options: {
        hotspot: true,
      },
    }),
  ],
  preview: {
    select: {
      title: "title",
      author: "author",
      media: "featuredImage",
      status: "status",
    },
    prepare(selection) {
      const { title, author, status } = selection;
      return {
        title: title,
        subtitle: `${author} • ${status}`,
        media: selection.media,
      };
    },
  },
  orderings: [
    {
      title: "Published Date, New",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
    {
      title: "Published Date, Old",
      name: "publishedAtAsc",
      by: [{ field: "publishedAt", direction: "asc" }],
    },
  ],
});
