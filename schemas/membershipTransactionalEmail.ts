import { EnvelopeIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

/**
 * Copy for the emails members get about their membership. The backend reads
 * the published document at send time (voices_backend
 * services/membership/memberEmails.js) and falls back to its built-in copy
 * if a document is missing or fails these same checks, so a bad edit can
 * never stop a member hearing about their payment.
 *
 * Keep EMAIL_TYPES in step with voices_backend utils/templateVariables.js.
 */
const EMAIL_TYPES = {
  membership_activated: {
    title: "Welcome (new member)",
    allowed: ["firstName", "contributionAmount", "nextPaymentDate"],
    required: ["contributionAmount", "nextPaymentDate"],
  },
  payment_failed: {
    title: "Payment failed",
    allowed: ["firstName", "contributionAmount", "gracePeriodEndDate"],
    required: ["contributionAmount", "gracePeriodEndDate"],
  },
  payment_recovered: {
    title: "Payment recovered",
    allowed: ["firstName", "contributionAmount", "nextPaymentDate"],
    required: ["contributionAmount"],
  },
  cancellation_confirmed: {
    title: "Cancellation confirmed",
    allowed: ["firstName", "contributionAmount", "paidThroughDate"],
    required: ["paidThroughDate"],
  },
} as const;

type EmailType = keyof typeof EMAIL_TYPES;

const VARIABLE_HELP: Record<string, string> = {
  firstName: "their first name, or “there”",
  contributionAmount: "e.g. “£3.99 a month”",
  nextPaymentDate: "e.g. “11 November 2026”",
  gracePeriodEndDate: "the date their benefits stop if the payment isn’t fixed",
  paidThroughDate: "the last day of the period they’ve paid for",
};

const TOKEN = /\{\{\s*([a-zA-Z]+)\s*\}\}/g;

const tokensIn = (text: string) =>
  Array.from(text.matchAll(TOKEN), (match) => match[1]);

const emailTypeOf = (document: unknown): EmailType | undefined => {
  const value = (document as { emailType?: string } | undefined)?.emailType;
  return value && value in EMAIL_TYPES ? (value as EmailType) : undefined;
};

/** Flags {{tokens}} this email can't fill: they would reach the member as literal text. */
const unknownTokens = (text: string | undefined, document: unknown) => {
  const emailType = emailTypeOf(document);
  if (!text || !emailType) return true;
  const allowed: readonly string[] = EMAIL_TYPES[emailType].allowed;
  const unknown = Array.from(
    new Set(tokensIn(text).filter((name) => !allowed.includes(name))),
  );
  return unknown.length
    ? `This email can’t fill ${unknown.map((n) => `{{${n}}}`).join(", ")}. Available: ${allowed.map((n) => `{{${n}}}`).join(", ")}`
    : true;
};

const variablesDescription = Object.entries(EMAIL_TYPES)
  .map(
    ([, config]) =>
      `${config.title}: ${config.allowed.map((name) => `{{${name}}}`).join(" ")} (must include ${config.required.map((name) => `{{${name}}}`).join(", ")})`,
  )
  .join(" · ");

export default defineType({
  name: "membershipTransactionalEmail",
  title: "Membership Email",
  type: "document",
  // @ts-ignore
  icon: EnvelopeIcon,
  fields: [
    defineField({
      name: "emailType",
      title: "Email",
      description: "Which email this copy is for. One document per email.",
      type: "string",
      options: {
        list: Object.entries(EMAIL_TYPES).map(([value, config]) => ({
          value,
          title: config.title,
        })),
        layout: "radio",
      },
      validation: (rule) =>
        rule.required().custom(async (value, context) => {
          if (!value) return true;
          const id = (context.document?._id || "").replace(/^drafts\./, "");
          const client = context.getClient({ apiVersion: "2024-01-01" });
          const clash = await client.fetch(
            `count(*[_type == "membershipTransactionalEmail" && emailType == $value && !(_id in [$id, $draftId])])`,
            { value, id, draftId: `drafts.${id}` },
          );
          return clash > 0
            ? "There is already a document for this email. Edit that one instead."
            : true;
        }),
    }),
    defineField({
      name: "subject",
      title: "Subject line",
      type: "string",
      validation: (rule) =>
        rule
          .required()
          .max(120)
          .custom((value, context) => unknownTokens(value, context.document)),
    }),
    defineField({
      name: "preheader",
      title: "Inbox preview text",
      description:
        "The grey line shown next to the subject in the inbox. Leave blank to use the default.",
      type: "string",
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: "heading",
      title: "Heading",
      description: "Large heading at the top of the email. Leave blank to use the default.",
      type: "string",
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: "body",
      title: "Body",
      description: `Plain text. Leave a blank line between paragraphs. Use {{variables}} to drop in member details — ${variablesDescription}. ${Object.entries(
        VARIABLE_HELP,
      )
        .map(([name, help]) => `{{${name}}} = ${help}`)
        .join("; ")}.`,
      type: "text",
      rows: 10,
      validation: (rule) =>
        rule.required().custom((value, context) => {
          const emailType = emailTypeOf(context.document);
          if (!value || !emailType) return true;
          const used = tokensIn(value);
          const missing = EMAIL_TYPES[emailType].required.filter(
            (name) => !used.includes(name),
          );
          if (missing.length) {
            return `Must include ${missing.map((n) => `{{${n}}}`).join(", ")} — this email exists to tell the member that.`;
          }
          return unknownTokens(value, context.document);
        }),
    }),
    defineField({
      name: "ctaText",
      title: "Button text",
      description:
        "The button links to the right page of their account automatically. Leave blank to use the default.",
      type: "string",
      validation: (rule) => rule.max(40),
    }),
  ],
  preview: {
    select: { emailType: "emailType", subject: "subject" },
    prepare: ({ emailType, subject }) => ({
      title:
        EMAIL_TYPES[emailType as EmailType]?.title || "Membership email",
      subtitle: subject,
    }),
  },
});
