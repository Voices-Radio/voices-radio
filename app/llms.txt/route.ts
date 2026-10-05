import { getLocationPageSlugs, getPodcast } from "@/sanity.client";
import { getBaseUrl } from "@/lib/site-url";
import {
  AUDIO_EQUIPMENT,
  BOOKING_URL,
  OTHER_EQUIPMENT,
  PRICING_OPTIONS,
  STUDIO_ADDRESS,
  STUDIO_EMAIL,
  VIDEO_EQUIPMENT,
  resolveFaq,
} from "@/lib/podcast-studio-facts";

export const revalidate = 3600;

const titleCase = (slug: string) =>
  slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export async function GET() {
  const base = getBaseUrl();
  const [podcast, locationRows] = await Promise.all([
    getPodcast(),
    getLocationPageSlugs().catch(() => []),
  ]);

  const locationLines = locationRows.map(
    ({ slug }) =>
      `- Podcast Studio ${titleCase(slug)}: ${base}/podcast-studio/${slug}`,
  );
  const pricingLines = PRICING_OPTIONS.map(
    (o) => `- ${o.title}: ${o.price} ${o.period}`,
  );
  const faqLines = resolveFaq(podcast).flatMap((f) => [
    `### ${f.question}`,
    f.answer,
    "",
  ]);
  const phone = podcast?.phone ? `\nPhone: ${podcast.phone}` : "";
  const hours = podcast?.openingHours?.length
    ? `\nOpening hours: ${podcast.openingHours.join("; ")}`
    : "";

  const body = [
    "# Voices Radio",
    "",
    "> Voices Radio is a community radio station and professional podcast studio for hire in King's Cross, London.",
    "",
    "## Pages",
    `- Home: ${base}`,
    `- About: ${base}/about`,
    `- Podcast Studio hire: ${base}/podcast`,
    `- Podcast studio blog: ${base}/podcast/blog`,
    `- Services: ${base}/services`,
    ...locationLines,
    "",
    "## Podcast Studio",
    "Voices Studio is a self-service podcast recording studio in King's Cross, London, bookable by the hour, with optional engineer support and an in-house edit team.",
    "",
    "### Pricing",
    ...pricingLines,
    "",
    "### Equipment",
    ...[...AUDIO_EQUIPMENT, ...VIDEO_EQUIPMENT, ...OTHER_EQUIPMENT].map(
      (e) => `- ${e}`,
    ),
    "",
    `Book online: ${BOOKING_URL}`,
    "",
    "## FAQ",
    ...faqLines,
    "## Contact",
    `Address: ${STUDIO_ADDRESS.venue}, ${STUDIO_ADDRESS.streetAddress}, ${STUDIO_ADDRESS.locality} ${STUDIO_ADDRESS.postalCode}`,
    `Email: ${STUDIO_EMAIL}${phone}${hours}`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
