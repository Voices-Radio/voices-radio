import type { Podcast, PodcastFaqItem, PodcastService } from "@/sanity.queries";

/**
 * Verified facts about the Voices podcast studio. These are the single source
 * for the /podcast page, its JSON-LD and /llms.txt. Sanity values (when
 * filled in) override them via the helpers below.
 */

export const BOOKING_URL =
  "https://voicesradio.spaces.nexudus.com/bookings?tab=Resources&view=card";

export const STUDIO_EMAIL = "podcast@voicesradio.co.uk";

export const STUDIO_ADDRESS = {
  venue: "Mare Street Market Kings Cross",
  streetAddress: "Lewis Cubitt Walk",
  locality: "London",
  postalCode: "N1C 4DY",
} as const;

export interface PricingOption {
  title: string;
  price: string;
  period: string;
  features: string[];
  popular: boolean;
  isAddon: boolean;
}

export const PRICING_OPTIONS: PricingOption[] = [
  {
    title: "Audio Package",
    price: "£65",
    period: "per hour",
    features: [
      "Professional audio recording",
      "Acoustically treated room",
      "Self-service studio access",
      "",
      "",
    ],
    popular: false,
    isAddon: false,
  },
  {
    title: "Single Camera",
    price: "£90",
    period: "per hour",
    features: [
      "Everything in Audio Package",
      "Single camera setup",
      "Professional lighting",
      "",
      "",
    ],
    popular: false,
    isAddon: false,
  },
  {
    title: "Dual Camera",
    price: "£170",
    period: "per hour",
    features: [
      "Everything in Single Camera",
      "Second camera angle",
      "Multi-angle recording",
      "",
      "",
    ],
    popular: true,
    isAddon: false,
  },
  {
    title: "Engineer Support",
    price: "£30",
    period: "per hour add-on",
    features: [
      "Technical assistance",
      "Equipment setup help",
      "Recording guidance",
      "Quality assurance",
      "Available for all packages",
    ],
    popular: false,
    isAddon: true,
  },
];

export const AUDIO_EQUIPMENT = [
  "4 x Shure SM7B dynamic microphones",
  "4 x Sony MDR-7506 production headphones",
  "4 x Rode PSA1 boom arms",
  "Rodecaster Pro digital mixing desk, recorder and audio interface",
  "2 x Yamaha HS8 speakers",
];

export const VIDEO_EQUIPMENT = [
  "Sony FX30",
  "Sigma Art 12-24mm F2.8 lens",
  "Godox SL60W adjustable lighting with softbox",
  "1 x Tripod",
];

export const OTHER_EQUIPMENT = [
  "Controllable lighting",
  "Climate control (A/C, Heating)",
  "Door access via your phone, no app needed",
  "Wheelchair accessible",
  "Toilets, food and drinks amenities on site",
];

const priceOf = (title: string) =>
  PRICING_OPTIONS.find((o) => o.title === title)?.price ?? "";

export const DEFAULT_PRICE_RANGE = `${priceOf("Audio Package")}-${priceOf("Dual Camera")} per hour`;

export const DEFAULT_SERVICES: PodcastService[] = [
  {
    name: "Audio podcast recording",
    description:
      "Self-service, acoustically treated podcast studio with four Shure SM7B microphones and a Rodecaster Pro.",
    priceFrom: priceOf("Audio Package").replace("£", ""),
  },
  {
    name: "Single camera video podcast recording",
    description:
      "Audio package plus a Sony FX30 camera and professional lighting.",
    priceFrom: priceOf("Single Camera").replace("£", ""),
  },
  {
    name: "Dual camera video podcast recording",
    description: "Multi-angle video podcast recording with two cameras.",
    priceFrom: priceOf("Dual Camera").replace("£", ""),
  },
  {
    name: "Studio engineer support",
    description:
      "Hands-on engineer to set up equipment and guide your recording, added to any package.",
    priceFrom: priceOf("Engineer Support").replace("£", ""),
  },
];

export const DEFAULT_FAQ: PodcastFaqItem[] = [
  {
    question: "How much does podcast studio hire cost in London?",
    answer: `Voices Studio in Kings Cross is bookable by the hour. The Audio Package is ${priceOf("Audio Package")} per hour, Single Camera is ${priceOf("Single Camera")} per hour and Dual Camera is ${priceOf("Dual Camera")} per hour. An optional studio engineer can be added to any package for ${priceOf("Engineer Support")} per hour.`,
  },
  {
    question: "Where is the Voices podcast studio?",
    answer: `The studio is at ${STUDIO_ADDRESS.venue}, ${STUDIO_ADDRESS.streetAddress}, King's Cross, London ${STUDIO_ADDRESS.postalCode}. It is about 10 minutes' walk from King's Cross and London St Pancras stations and 8 minutes from Caledonian Road and Barnsbury.`,
  },
  {
    question: "What equipment is included in the podcast studio hire?",
    answer: `Audio: ${AUDIO_EQUIPMENT.join("; ")}. Video: ${VIDEO_EQUIPMENT.join("; ")}.`,
  },
  {
    question: "Do I need a sound engineer to record my podcast?",
    answer: `No. The studio is self-service, so you can record on your own. If you would like hands-on help, an engineer can be added for ${priceOf("Engineer Support")} per hour to set up equipment and guide your recording.`,
  },
  {
    question: "Can you edit my podcast after recording?",
    answer: `Yes. Voices has an in-house edit team. Email ${STUDIO_EMAIL} and we will build you a bespoke quote.`,
  },
  {
    question: "Is the podcast studio accessible?",
    answer:
      "Yes. The studio is wheelchair accessible, you unlock the door with your phone (no app needed), and toilets, food and drinks are available on site.",
  },
  {
    question: "How do I book the podcast studio?",
    answer: `Book online by the hour at ${BOOKING_URL}.`,
  },
];

export const resolveFaq = (podcast?: Podcast | null): PodcastFaqItem[] =>
  podcast?.faq?.length ? podcast.faq : DEFAULT_FAQ;

export const resolveServices = (podcast?: Podcast | null): PodcastService[] =>
  podcast?.studioServices?.length ? podcast.studioServices : DEFAULT_SERVICES;
