export type VoicesPlatform = "mixcloud" | "soundcloud";

export type VoicesMatchingStatus = "matched" | "pending" | "manual";

export type VoicesStation = "kx" | "east" | "both" | "unknown";

export type VoicesLocationTag = "kx" | "east" | "london" | "world" | string;

export interface VoicesArtistRaw {
  _id: string;
  name: string;
  bio?: string | null;
  imageUrl?: string | null;
  bannerUrl?: string | null;
  genres?: string[];
  aliases?: string[];
  platforms?: {
    mixcloud?: {
      username?: string | null;
      verified?: boolean;
    };
    soundcloud?: {
      pattern?: string | null;
      verified?: boolean;
    };
  };
  mixcloudUsername?: string | null;
  soundcloudUsername?: string | null;
  isActive?: boolean;
  featured?: boolean;
  station?: VoicesStation | null;
  locationTags?: VoicesLocationTag[];
  socialLinks?: {
    instagram?: string | null;
    twitter?: string | null;
    facebook?: string | null;
    website?: string | null;
  };
  images?: {
    thumbnail?: string;
    small?: string;
    medium?: string;
    large?: string;
  };
}

export interface VoicesShowRaw {
  _id: string;
  title: string;
  description?: string | null;
  date?: string | null;
  show_date?: string | null;
  duration?: number | null;
  mixcloudUrl?: string | null;
  soundcloudUrl?: string | null;
  imageUrl?: string | null;
  playCount?: number;
  featured?: boolean;
  artistId?: string | VoicesArtistRaw | null;
  mixcloudKey?: string | null;
  soundcloudId?: string | null;
  platform?: VoicesPlatform;
  platform_id?: string | null;
  url?: string | null;
  upload_date?: string | null;
  discovered_date?: string | null;
  matching_status?: VoicesMatchingStatus;
  matching_confidence?: number;
  station?: VoicesStation | null;
  locationTags?: VoicesLocationTag[];
  metadata?: {
    genre?: string | null;
    tags?: string[];
    artwork_url?: string | null;
    play_count?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface VoicesArtist {
  id: string;
  name: string;
  bio: string;
  imageUrl?: string;
  bannerUrl?: string;
  genres: string[];
  aliases: string[];
  featured: boolean;
  isActive: boolean;
  station: VoicesStation;
  locationTags: VoicesLocationTag[];
  mixcloudUsername?: string;
  soundcloudUsername?: string;
  socialLinks: NonNullable<VoicesArtistRaw["socialLinks"]>;
}

export interface VoicesArtwork {
  src: string;
  alt: string;
  source: "show" | "artist" | "fallback";
}

export interface VoicesShow {
  id: string;
  title: string;
  description: string;
  date?: string;
  duration?: number;
  imageUrl?: string;
  artwork: VoicesArtwork;
  artist?: VoicesArtist;
  artistId?: string;
  genres: string[];
  featured: boolean;
  station: VoicesStation;
  locationTags: VoicesLocationTag[];
  platform?: VoicesPlatform;
  archiveUrl?: string;
  mixcloudUrl?: string;
  soundcloudUrl?: string;
  matchingStatus?: VoicesMatchingStatus;
}

export interface VoicesListResponse<T> {
  items: T[];
  total?: number;
}

export interface VoicesWebsiteRailRaw {
  key: string;
  title: string;
  description?: string | null;
  station?: VoicesStation | null;
  pagePlacement?: string[];
  items?: Array<VoicesShowRaw | string>;
  published?: boolean;
  startAt?: string | null;
  endAt?: string | null;
}

export interface VoicesWebsiteRail {
  key: string;
  title: string;
  description: string;
  station: VoicesStation;
  pagePlacement: string[];
  shows: VoicesShow[];
}
