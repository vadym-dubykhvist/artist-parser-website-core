export interface Artist {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  bio: string | null;
  createdAt: string;
  tracks?: Track[];
}

export interface Track {
  id: number;
  title: string;
  slug: string;
  coverUrl: string | null;
  duration: number | null;
  releaseDate: string | null;
  spotifyUrl: string | null;
  youtubeUrl: string | null;
  appleMusicUrl: string | null;
  artist?: Artist;
  shortLinks?: ShortLink[];
}

export interface ShortLink {
  id: number;
  code: string;
  platform: 'spotify' | 'youtube' | 'apple';
  clickCount: number;
}

export interface SpotifyTrackResult {
  title: string;
  isrc: string | null;
  coverUrl: string | null;
  duration: number | null;
  releaseDate: string | null;
  spotifyUrl: string | null;
}
