import LivePlayer from "./live-player";

export interface LiveInfo {
  station: Station;
  tracks: Tracks;
  shows: Shows;
}

export interface Shows {
  previous: any[];
  current: NextClass;
  next: NextClass[];
}

export interface NextClass {
  name: string;
  description: string;
  genre: string;
  id: number;
  instance_id: number;
  record: number;
  url: string;
  image_path: string;
  image_cloud_file_id: null;
  auto_dj: boolean;
  starts: Date;
  ends: Date;
}

export interface Station {
  env: string;
  schedulerTime: Date;
  source_enabled: string;
  timezone: string;
  AIRTIME_API_VERSION: string;
}

export interface Tracks {
  previous: Previous;
  current: TracksCurrent;
  next: null;
}

export interface TracksCurrent {
  starts: Date;
  ends: Date;
  type: string;
  name: string;
  media_item_played: boolean;
  record: string;
}

export interface Previous {
  starts: Date;
  ends: Date;
  type: string;
  name: string;
  metadata: Metadata;
}

export interface Metadata {
  id: number;
  name: string;
  mime: string;
  ftype: string;
  directory: null;
  filepath: string;
  import_status: number;
  currentlyaccessing: number;
  editedby: null;
  mtime: Date;
  utime: Date;
  lptime: Date;
  md5: string;
  track_title: string;
  artist_name: null;
  bit_rate: number;
  sample_rate: number;
  format: null;
  length: string;
  album_title: null;
  genre: null;
  comments: string;
  year: null;
  track_number: null;
  channels: number;
  url: null;
  bpm: null;
  rating: null;
  encoded_by: null;
  disc_number: null;
  mood: null;
  label: null;
  composer: null;
  encoder: null;
  checksum: null;
  lyrics: null;
  orchestra: null;
  conductor: null;
  lyricist: null;
  original_lyricist: null;
  radio_station_name: null;
  info_url: null;
  artist_url: null;
  audio_source_url: null;
  radio_station_url: null;
  buy_this_url: null;
  isrc_number: null;
  catalog_number: null;
  original_artist: null;
  copyright: null;
  report_datetime: null;
  report_location: null;
  report_organization: null;
  subject: null;
  contributor: null;
  language: null;
  soundcloud_id: null;
  soundcloud_error_code: null;
  soundcloud_error_msg: null;
  soundcloud_link_to_file: null;
  soundcloud_upload_time: null;
  replay_gain: string;
  owner_id: number;
  cuein: string;
  cueout: string;
  hidden: boolean;
  filesize: number;
  description: null;
  cloud_file_id: number;
  file_artwork_id: null;
}

export default async function NowPlaying() {
  const r = await fetch("https://voicesradio.airtime.pro/api/live-info-v2", {
    next: { revalidate: 10 },
  });

  const data: LiveInfo = await r.json();

  return (
    <div className="p-8">
      <p>
        Now Playing: {data?.shows?.current?.name ?? "Live DJ"}, Next Up:{" "}
        {data.shows.next[0].name}
      </p>

      <LivePlayer title={data?.shows?.current?.name ?? "Live DJ"} />
    </div>
  );
}
