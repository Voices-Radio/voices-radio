import { DocumentIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export default defineType({
  name: "locationPage",
  title: "Location Landing Pages",
  type: "document",
  // @ts-ignore
  icon: DocumentIcon,
  preview: {
    select: { title: "title", subtitle: "slug.current" },
  },
  fields: [
    defineField({
      name: "title",
      title: "Internal Title",
      type: "string",
      description: "e.g. Podcast Studio London — shown only in the Studio",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "URL Slug",
      type: "slug",
      options: { source: "title" },
      description: "e.g. 'london' → /podcast-studio/london",
      validation: (rule) => rule.required(),
    }),

    // ── Page content ──────────────────────────────────────────────────────
    defineField({
      name: "h1",
      title: "H1 Heading",
      type: "string",
      description: "e.g. Podcast Studio in London — include target keywords",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "localityName",
      title: "Locality Name",
      type: "string",
      description: "e.g. Kings Cross, London — used in JSON-LD areaServed",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "intro",
      title: "Intro Text",
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
    }),
    defineField({
      name: "body",
      title: "Body Content",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          options: { spellCheck: true },
          styles: [{ title: "Normal", value: "normal" }, { title: "H2", value: "h2" }, { title: "H3", value: "h3" }],
          lists: [{ title: "Bullet", value: "bullet" }],
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
    }),

    // ── FAQ ───────────────────────────────────────────────────────────────
    defineField({
      name: "faq",
      title: "FAQ",
      type: "array",
      description: "Powers Google FAQ rich results and AI Overview citations.",
      of: [
        defineArrayMember({
          type: "object",
          name: "faqItem",
          preview: { select: { title: "question" } },
          fields: [
            defineField({ name: "question", title: "Question", type: "string" }),
            defineField({ name: "answer", title: "Answer", type: "text" }),
          ],
        }),
      ],
    }),

    // ── CTA ───────────────────────────────────────────────────────────────
    defineField({
      name: "ctaText",
      title: "CTA Button Text",
      type: "string",
      description: "e.g. Book Your Session",
    }),
    defineField({
      name: "ctaUrl",
      title: "CTA Button URL",
      type: "url",
      validation: (rule) => rule.uri({ allowRelative: true }),
    }),

    // ── SEO ───────────────────────────────────────────────────────────────
    defineField({
      name: "seoTitle",
      title: "SEO Page Title",
      type: "string",
      description: "~60 chars. Leave blank to auto-generate from H1.",
    }),
    defineField({
      name: "seoDescription",
      title: "SEO Meta Description",
      type: "string",
      description: "~155 chars. Include location-specific keywords.",
    }),
    defineField({
      name: "ogImage",
      title: "Social Share Image (1200×627px)",
      type: "image",
    }),
    defineField({
      name: "keywords",
      title: "SEO Keywords",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],
});
