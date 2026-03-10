import type { Artist, Track, SpotifyTrackResult } from '@/lib/types';

export type { Artist, Track, SpotifyTrackResult };
export type { ShortLink } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function searchArtistTracksOnSpotify(
  slug: string,
  q: string,
): Promise<SpotifyTrackResult[]> {
  const res = await fetch(
    `${API_URL}/artists/${encodeURIComponent(slug)}/tracks/search?q=${encodeURIComponent(q)}`,
  );
  if (!res.ok) return [];
  return res.json();
}

export async function getArtists(): Promise<Artist[]> {
  const res = await fetch(`${API_URL}/artists`);
  if (!res.ok) throw new Error('Failed to fetch artists');
  return res.json();
}

export async function getArtist(slug: string): Promise<Artist> {
  const res = await fetch(`${API_URL}/artists/${slug}`);
  if (!res.ok) throw new Error(`Artist "${slug}" not found`);
  return res.json();
}

export async function getTrack(slug: string): Promise<Track> {
  const res = await fetch(`${API_URL}/tracks/${slug}`);
  if (!res.ok) throw new Error(`Track "${slug}" not found`);
  return res.json();
}
