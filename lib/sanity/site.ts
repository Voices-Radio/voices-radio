import { groq } from "next-sanity";
import type { Image, PortableTextBlock } from "sanity";

export const settingsQuery = groq`*[_type == "settings"][0]`;

export interface Settings {
  title: string;
  description: string;
  ogImage: Image;
  /**
   * PortableText
   */
  address: PortableTextBlock[];
  contact_link: string;
  twitter_link: string;
  instagram_link: string;
  facebook_link: string;
  linkedin_link: string;
  mixcloud_link: string;
  store_link: string;
  podcast_link: string;
  apply_link: string;
  header_links?: NavLinkConfig[];
  collaborate_links?: NavLinkConfig[];
  footer_links?: NavLinkConfig[];
  footer_locations?: FooterLocationConfig[];
  footer_copyright?: string;
}

export interface NavLinkConfig {
  _key?: string;
  label?: string;
  href?: string;
  opensInNewTab?: boolean;
}

export interface FooterLocationConfig {
  _key?: string;
  name?: string;
  address?: string;
}

export const partnersQuery = groq`*[_type == "partner"] | order(name desc)`;

export interface Partner {
  name: string;
  logo: Image;
  /**
   * PortableText
   */
  details: PortableTextBlock[];
}

export const homeQuery = groq`*[_type == "home"][0] {
  ...,
  apply_background {
    ...,
    "lqip": asset->metadata.lqip
  }
}
`;

export interface Home {
  schedule: string;

  community_heading: string;
  community_subheading: PortableTextBlock[];

  community_cta_text?: string;
  community_cta_url?: string;

  community_carousel: Image[];

  community_heading_secondary: string;
  community_subheading_secondary: PortableTextBlock[];

  community_cta_text_secondary?: string;
  community_cta_url_secondary?: string;

  community_carousel_secondary: Image[];

  apply_background: Image & { lqip: string };
  apply_heading: string;
  apply_subheading: string;
  apply_cta_text: string;
  apply_cta_url: string;
}
