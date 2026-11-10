export interface Partner {
  name: string;
  logo: string;
  logoWidth: number;
  logoHeight: number;
  url: string;
  headline?: string;
  blurb: string;
}

// TODO: replace placeholder wordmarks in /public/partners with the official
// logos, and the blurbs with the approved copy.
export const partners: readonly Partner[] = [
  {
    name: "TwoTribes",
    logo: "/partners/twotribes.svg",
    logoWidth: 320,
    logoHeight: 80,
    url: "https://www.twotribes.co.uk",
    headline: "VOICES bar is powered by Two Tribes",
    blurb:
      "Two Tribes Brewery is a properly independent brewery. The catalyst for getting together and a home for collaboration. They brew wonder (and good times) at their brewery in King’s Cross.",
  },
  {
    name: "AlphaTheta",
    logo: "/partners/alphatheta.svg",
    logoWidth: 320,
    logoHeight: 80,
    url: "https://alphatheta.com",
    blurb: "Blurb for AlphaTheta coming soon.",
  },
];
