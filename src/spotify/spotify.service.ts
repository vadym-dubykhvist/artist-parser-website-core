import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface SpotifyArtist {
  name: string;
  imageUrl: string;
  bio: string;
  spotifyId: string;
}

export interface SpotifyTrack {
  title: string;
  isrc: string;
  coverUrl: string;
  duration: number;
  releaseDate: string;
  spotifyUrl: string;
}

@Injectable()
export class SpotifyService {
  private readonly logger = new Logger(SpotifyService.name);
  private accessToken: string | null = null;
  private tokenExpiresAt = 0;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  private async getToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    const clientId = this.config.get<string>('SPOTIFY_CLIENT_ID');
    const clientSecret = this.config.get<string>('SPOTIFY_CLIENT_SECRET');
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
      'base64',
    );

    const { data } = await firstValueFrom(
      this.http.post(
        'https://accounts.spotify.com/api/token',
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      ),
    );

    this.accessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
    return this.accessToken;
  }

  async getArtist(spotifyId: string): Promise<SpotifyArtist> {
    const token = await this.getToken();
    const { data } = await firstValueFrom(
      this.http.get(`https://api.spotify.com/v1/artists/${spotifyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    );

    return {
      name: data.name,
      imageUrl: data.images?.[0]?.url ?? null,
      bio: data.genres?.join(', ') ?? '',
      spotifyId: data.id,
    };
  }

  async searchArtists(query: string): Promise<SpotifyArtist[]> {
    const token = await this.getToken();
    const { data } = await firstValueFrom(
      this.http.get('https://api.spotify.com/v1/search', {
        params: { q: query, type: 'artist', limit: 8 },
        headers: { Authorization: `Bearer ${token}` },
      }),
    );
    return data.artists.items.map((a: any): SpotifyArtist => ({
      name: a.name,
      imageUrl: a.images?.[0]?.url ?? null,
      bio: a.genres?.join(', ') ?? '',
      spotifyId: a.id,
    }));
  }

  async getArtistTopTracks(spotifyId: string): Promise<SpotifyTrack[]> {
    const token = await this.getToken();
    const { data } = await firstValueFrom(
      this.http.get(
        `https://api.spotify.com/v1/artists/${spotifyId}/top-tracks?market=US`,
        { headers: { Authorization: `Bearer ${token}` } },
      ),
    );

    return data.tracks.map((track: any): SpotifyTrack => ({
      title: track.name,
      isrc: track.external_ids?.isrc ?? null,
      coverUrl: track.album?.images?.[0]?.url ?? null,
      duration: track.duration_ms,
      releaseDate: track.album?.release_date ?? null,
      spotifyUrl: track.external_urls?.spotify ?? null,
    }));
  }

  async searchArtistTracks(artistName: string, query: string): Promise<SpotifyTrack[]> {
    const token = await this.getToken();
    const { data } = await firstValueFrom(
      this.http.get('https://api.spotify.com/v1/search', {
        params: {
          q: `track:${query} artist:${artistName}`,
          type: 'track',
          limit: 20,
          market: 'US',
        },
        headers: { Authorization: `Bearer ${token}` },
      }),
    );
    const artistNameNorm = artistName.toLowerCase();
    const seen = new Set<string>();
    return data.tracks.items
      .filter((track: any) =>
        track.artists?.some((a: any) =>
          a.name.toLowerCase() === artistNameNorm,
        ),
      )
      .filter((track: any) => {
        if (seen.has(track.name.toLowerCase())) return false;
        seen.add(track.name.toLowerCase());
        return true;
      })
      .map((track: any): SpotifyTrack => ({
        title: track.name,
        isrc: track.external_ids?.isrc ?? null,
        coverUrl: track.album?.images?.[0]?.url ?? null,
        duration: track.duration_ms,
        releaseDate: track.album?.release_date ?? null,
        spotifyUrl: track.external_urls?.spotify ?? null,
      }));
  }

  async getArtistAllTracks(spotifyId: string): Promise<SpotifyTrack[]> {
    const token = await this.getToken();

    // 1. Fetch all album/single IDs (paginated)
    const albumIds: string[] = [];
    let albumsUrl: string | null =
      `https://api.spotify.com/v1/artists/${spotifyId}/albums?include_groups=album,single&limit=50&market=US`;

    while (albumsUrl) {
      const { data } = await firstValueFrom(
        this.http.get(albumsUrl, { headers: { Authorization: `Bearer ${token}` } }),
      );
      albumIds.push(...data.items.map((a: any) => a.id));
      albumsUrl = data.next ?? null;
    }

    this.logger.log(`Artist ${spotifyId}: found ${albumIds.length} albums/singles`);

    // 2. Fetch track IDs from each album (paginated)
    const trackIds: string[] = [];
    for (const albumId of albumIds) {
      let tracksUrl: string | null =
        `https://api.spotify.com/v1/albums/${albumId}/tracks?limit=50`;
      while (tracksUrl) {
        const { data } = await firstValueFrom(
          this.http.get(tracksUrl, { headers: { Authorization: `Bearer ${token}` } }),
        );
        trackIds.push(...data.items.map((t: any) => t.id));
        tracksUrl = data.next ?? null;
      }
    }

    // 3. Deduplicate
    const uniqueIds = [...new Set(trackIds)];
    this.logger.log(`Artist ${spotifyId}: ${uniqueIds.length} unique tracks`);

    // 4. Batch-fetch full track details (ISRC, cover, etc.) — max 50 per request
    const tracks: SpotifyTrack[] = [];
    for (let i = 0; i < uniqueIds.length; i += 50) {
      const batch = uniqueIds.slice(i, i + 50);
      const { data } = await firstValueFrom(
        this.http.get('https://api.spotify.com/v1/tracks', {
          params: { ids: batch.join(','), market: 'US' },
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      tracks.push(
        ...data.tracks.filter(Boolean).map((track: any): SpotifyTrack => ({
          title: track.name,
          isrc: track.external_ids?.isrc ?? null,
          coverUrl: track.album?.images?.[0]?.url ?? null,
          duration: track.duration_ms,
          releaseDate: track.album?.release_date ?? null,
          spotifyUrl: track.external_urls?.spotify ?? null,
        })),
      );
    }

    return tracks;
  }
}
