import { DocumentIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export default defineType({
  name: "podcast",
  title: "Podcast",
  type: "document",
  // @ts-ignore
  icon: DocumentIcon,
  preview: {
    select: { title: "internal" },
  },
  fields: [
    defineField({
      name: "internal",
      initialValue: "Podcast",
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
      name: "heading_podcast_intro",
      type: "string",
      title: "Podcast Intro",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "podcast_cta_text",
      title: "Podcast Section - Button Text",
      type: "string",
    }),
    defineField({
      name: "podcast_cta_url",
      title: "Podcast Section - Button Link",
      type: "url",
      validation: (rule) => rule.uri({ allowRelative: true }),
    }),

    defineField({
      name: "podcast_intro_content",
      title: "Podcast Intro - Content",
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
      name: "podcast_main_heading",
      type: "string",
      title: "Podcast Main - Heading",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "podcast_main",
      title: "Podcast Main - Content",
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
      name: "podcast_main_image",
      title: "Podcast Main - Image",
      type: "image",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "podcast_final_heading",
      type: "string",
      title: "Podcast Final - Heading",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "podcast_final",
      title: "Podcast Final - Content",
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
      name: "podcast_final_image",
      title: "Final Podcast Image",
      type: "image",
      validation: (rule) => rule.required(),
    }),

    // ── SEO ─────────────────────────────────────────────────────────────────
    defineField({
      name: "heroImageAlt",
      title: "Hero Image Alt Text",
      type: "string",
      description:
        "Describe the studio image for search engines, e.g. 'Voices Radio podcast studio in Kings Cross, London'",
    }),
    defineField({
      name: "seoTitle",
      title: "SEO Page Title",
      type: "string",
      description:
        "Overrides the default page title. ~60 chars. Leave blank for a sensible default.",
    }),
    defineField({
      name: "seoDescription",
      title: "SEO Meta Description",
      type: "string",
      description:
        "~155 chars. Include 'London Podcast Studio', 'Kings Cross'. Leave blank for a sensible default.",
    }),
    defineField({
      name: "seoOgImage",
      title: "Social Share Image (1200×627px)",
      type: "image",
      description:
        "Shown when shared on social media. Leave blank to use the site default.",
    }),
    defineField({
      name: "seoKeywords",
      title: "SEO Keywords",
      type: "array",
      of: [{ type: "string" }],
      description:
        "e.g. London Podcast Studio, Podcast Studio Kings Cross, Podcast Recording London",
    }),

    // ── Page heading (H1) ────────────────────────────────────────────────────
    defineField({
      name: "h1Override",
      title: "Page H1 (optional override)",
      type: "string",
      description:
        "If set, this is used as the page's H1. Leave blank to use the Podcast Intro heading as H1. Include target keywords, e.g. 'Podcast Studio in Kings Cross, London'.",
    }),

    // ── Local business ───────────────────────────────────────────────────────
    defineField({
      name: "streetAddress",
      title: "Street Address",
      type: "string",
      description: "e.g. 1 Granary Square",
    }),
    defineField({
      name: "locality",
      title: "City / Town",
      type: "string",
      initialValue: "London",
    }),
    defineField({
      name: "postalCode",
      title: "Postcode",
      type: "string",
    }),
    defineField({
      name: "phone",
      title: "Phone Number",
      type: "string",
      description: "International format, e.g. +44 20 1234 5678",
    }),
    defineField({
      name: "openingHours",
      title: "Opening Hours",
      type: "array",
      of: [{ type: "string" }],
      description:
        "One entry per rule, schema.org format: Mo-Fr 09:00-18:00 / Sa 10:00-16:00",
    }),
    defineField({
      name: "priceRange",
      title: "Price Range",
      type: "string",
      description: "e.g. ££ or £££",
    }),
    defineField({
      name: "geoLat",
      title: "Latitude",
      type: "number",
      description: "e.g. 51.5352",
    }),
    defineField({
      name: "geoLng",
      title: "Longitude",
      type: "number",
      description: "e.g. -0.1246",
    }),

    // ── Studio services (for structured data) ────────────────────────────────
    defineField({
      name: "studioServices",
      title: "Studio Services (structured data)",
      type: "array",
      description:
        "Listed in search engine rich results. Not shown on the page.",
      of: [
        defineArrayMember({
          type: "object",
          name: "service",
          preview: { select: { title: "name" } },
          fields: [
            defineField({
              name: "name",
              title: "Service Name",
              type: "string",
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "string",
            }),
            defineField({
              name: "priceFrom",
              title: "Price From (optional)",
              type: "string",
              description: "e.g. £200",
            }),
          ],
        }),
      ],
    }),

    // ── FAQ (powers FAQPage JSON-LD and AI Overviews) ─────────────────────
    defineField({
      name: "faq",
      title: "FAQ",
      type: "array",
      description:
        "Questions and answers shown to search engines and AI (Google AI Overview, Perplexity, etc.).",
      of: [
        defineArrayMember({
          type: "object",
          name: "faqItem",
          preview: { select: { title: "question" } },
          fields: [
            defineField({
              name: "question",
              title: "Question",
              type: "string",
            }),
            defineField({ name: "answer", title: "Answer", type: "text" }),
          ],
        }),
      ],
    }),
  ],
});
