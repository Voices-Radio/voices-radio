export const VOICES_API_BASE_URL =
  process.env.VOICES_API_BASE_URL ?? "https://api.voicesradio.co.uk";

export const VOICES_FALLBACK_ARTWORK = "/VOICESLOGO_LIGHTBOX.png";

export const VOICES_DEFAULT_INDEX_LIMIT = 24;

export const VOICES_DEFAULT_FEATURED_LIMIT = 10;

export const VOICES_APPLY_FOR_SHOW_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdlV09iFlcP2_n6ldRsSUoeZclzJpb0AMY4F2rrXUpC7jueZQ/viewform";

export const voicesMediaConfig = {
  radioCult: {
    kxStreamUrl: process.env.NEXT_PUBLIC_RADIOCULT_KX_STREAM_URL,
    eastStreamUrl: process.env.NEXT_PUBLIC_RADIOCULT_EAST_STREAM_URL,
  },
  restream: {
    kxEmbedUrl: process.env.NEXT_PUBLIC_RESTREAM_KX_EMBED_URL,
    eastEmbedUrl: process.env.NEXT_PUBLIC_RESTREAM_EAST_EMBED_URL,
  },
};
