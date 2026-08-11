import { HeartIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export default defineType({
  name: "membershipPage",
  title: "Membership",
  type: "document",
  // @ts-ignore
  icon: HeartIcon,
  groups: [
    { name: "support", title: "/support" },
    { name: "join", title: "/join" },
    { name: "faqs", title: "FAQs" },
    { name: "account", title: "Account & dashboard" },
  ],
  preview: {
    select: { title: "internal" },
  },
  fields: [
    defineField({
      name: "internal",
      initialValue: "Membership",
      type: "string",
      readOnly: true,
      hidden: true,
    }),

    // /support
    defineField({
      name: "support_heading",
      title: "Heading",
      type: "string",
      group: "support",
      initialValue: "Keep independent radio loud.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "support_subheading",
      title: "Subheading",
      type: "text",
      group: "support",
      rows: 3,
      initialValue:
        "Back Voices from £4 a month and help fund the people, space and ideas that keep London's community radio moving.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "support_primary_cta_text",
      title: "Primary CTA text",
      type: "string",
      group: "support",
      initialValue: "Join Voices",
    }),
    defineField({
      name: "support_secondary_cta_text",
      title: "Secondary CTA text",
      type: "string",
      group: "support",
      initialValue: "See what membership funds",
    }),
    defineField({
      name: "support_radio_stays_open_heading",
      title: "\"Radio stays open\" heading",
      type: "string",
      group: "support",
      initialValue: "Radio stays open. Membership gets you closer.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "support_radio_stays_open_body",
      title: "\"Radio stays open\" body",
      description:
        "Must make explicit that listening remains free/open and membership adds participation, not a paywall.",
      type: "text",
      rows: 3,
      group: "support",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "support_impact_heading",
      title: "Impact section heading",
      type: "string",
      group: "support",
    }),
    defineField({
      name: "support_impact_body",
      title: "Impact section body",
      type: "array",
      group: "support",
      of: [defineArrayMember({ type: "block" })],
    }),

    // /join
    defineField({
      name: "join_heading",
      title: "Heading",
      type: "string",
      group: "join",
      initialValue: "Choose how you support Voices.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "join_subheading",
      title: "Subheading",
      type: "text",
      rows: 2,
      group: "join",
    }),
    defineField({
      name: "join_ballot_disclaimer",
      title: "Ballot / application disclaimer",
      description:
        "Shown near Open Decks / Supporter Radio and other capacity-limited benefits. Must state eligibility to submit, not guaranteed airplay/admission.",
      type: "text",
      rows: 2,
      group: "join",
      initialValue:
        "Open Decks and Supporter Radio membership gives you eligibility to submit for editorial consideration — it does not guarantee airplay.",
      validation: (rule) => rule.required(),
    }),

    // FAQs
    defineField({
      name: "faqs",
      title: "FAQs",
      type: "array",
      group: "faqs",
      of: [
        defineArrayMember({
          type: "object",
          name: "faq",
          fields: [
            defineField({
              name: "question",
              title: "Question",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "answer",
              title: "Answer",
              type: "array",
              of: [defineArrayMember({ type: "block" })],
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: "question" },
          },
        }),
      ],
    }),

    // Account / dashboard
    defineField({
      name: "dashboard_announcement",
      title: "Dashboard announcement",
      description:
        "Optional banner shown at the top of the member dashboard. Leave empty to show nothing.",
      type: "text",
      rows: 3,
      group: "account",
    }),
    defineField({
      name: "founding_member_badge_text",
      title: "Founding member badge text",
      type: "string",
      group: "account",
      initialValue: "FOUNDING MEMBER · VOICES · 2026",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "cancellation_copy",
      title: "Cancellation copy",
      description: "Body copy shown on the cancellation confirmation step.",
      type: "text",
      rows: 4,
      group: "account",
    }),
    defineField({
      name: "supporter_downgrade_offer_heading",
      title: "\"Switch to Supporter\" offer heading",
      type: "string",
      group: "account",
      initialValue: "Switch to Supporter — £4/month",
    }),
    defineField({
      name: "supporter_downgrade_offer_body",
      title: "\"Switch to Supporter\" offer body",
      type: "string",
      group: "account",
      initialValue: "Keep supporting Voices at our lowest level.",
    }),
  ],
});
