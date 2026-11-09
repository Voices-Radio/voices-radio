import {
  Mic,
  Video,
  Edit,
  Users,
  TrendingUp,
  Calculator,
  Instagram,
  Linkedin,
} from "lucide-react";

export const studioImages = [
  {
    url: "/studio-6.jpg",
    alt: "Voices Studio recording setup",
    title: "Studio Setup",
  },
  {
    url: "/studio-3.jpg",
    alt: "Professional podcast recording environment",
    title: "Recording Environment",
  },
  {
    url: "/studio-4.jpg",
    alt: "Voices Studio podcast recording",
    title: "Venue Exterior",
  },
  {
    url: "/studio-5.jpg",
    alt: "Additional Voices Studio recording setup",
    title: "Restaurant & Bar",
  },
];

export const services = [
  {
    icon: <Mic className="h-8 w-8" />,
    title: "Podcast Studio Booking",
    description:
      "Bookable by the hour, with optional hands-on Engineer support and multiple camera angles!",
    features: [
      "Self-service or engineer support",
      "Professional equipment included",
      "Flexible hourly booking",
    ],
  },
  {
    icon: <Edit className="h-8 w-8" />,
    title: "Audio-only Production",
    description:
      "Our professional audio editing services will polish your podcast to perfection, delivering crisp and clear sound for your audience.",
    features: [
      "Professional audio editing",
      "Noise reduction & enhancement",
      "Crisp, clear sound delivery",
    ],
  },
  {
    icon: <Video className="h-8 w-8" />,
    title: "Video Production",
    description:
      "Elevate your podcast with our professional video editing services, ensuring engaging visuals and seamless production.",
    features: [
      "Professional video editing",
      "Engaging visual content",
      "Seamless production quality",
    ],
  },
  {
    icon: <TrendingUp className="h-8 w-8" />,
    title: "Promotional Content Services",
    description:
      "Maximize your podcast's social media presence with our service that transforms longer episodes into compelling shorts designed for sharing.",
    features: [
      "Social media optimization",
      "Episode highlights creation",
      "Shareable content formats",
    ],
  },
  {
    icon: <Calculator className="h-8 w-8" />,
    title: "Bulk Discounts",
    description:
      "Take advantage of our bulk discounts to save on multiple bookings.",
    features: [
      "Volume pricing available",
      "Cost-effective packages",
      "Flexible booking terms",
    ],
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Podcasting Strategy",
    description:
      "We offer comprehensive podcast strategy services, guiding you through idea generation, to scripting and effective distribution to launch and grow your show.",
    features: [
      "Idea generation support",
      "Scripting assistance",
      "Distribution strategy",
      "Host introductions available",
    ],
  },
];

export const pricingOptions = [
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

export const audioEquipment = [
  "4 x Shure SM7B dynamic microphones",
  "4 x Sony MDR-7506 production headphones",
  "4 x Rode PSA1 boom arms",
  "Rodecaster Pro digital mixing desk, recorder and audio interface",
  "2 x Yamaha HS8 speakers",
];

export const videoEquipment = [
  "Sony FX30",
  "Sigma Art 12-24mm F2.8 lens",
  "Godox SL60W adjustable lighting with softbox",
  "1 x Tripod",
];

export const otherEquipment = [
  "Controllable lighting",
  "Climate control (A/C, Heating)",
  "Door access via your phone, no app needed",
  "Wheelchair accessible",
  "Toilets, food and drinks amenities on site",
];

export const socialLinks = [
  {
    icon: <Instagram className="h-5 w-5" />,
    href: "https://www.instagram.com/voices_studio_/",
    label: "Instagram",
  },
  {
    icon: <Linkedin className="h-5 w-5" />,
    href: "https://www.linkedin.com/company/104914569/admin/dashboard/",
    label: "LinkedIn",
  },
];
