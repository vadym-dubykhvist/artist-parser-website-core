import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import slugify from 'slugify';
import { SpotifyService } from '../spotify/spotify.service';
import { YoutubeService } from '../youtube/youtube.service';
import { AppleMusicService } from '../apple-music/apple-music.service';
import { ShortLinkService } from '../short-link/short-link.service';
import { Artist } from '../entities/artist.entity';
import { Track } from '../entities/track.entity';
import { Platform } from '../entities/short-link.entity';

@Injectable()
export class ResolveService {
  private readonly logger = new Logger(ResolveService.name);

  constructor(
    @InjectRepository(Artist)
    private readonly artistRepo: Repository<Artist>,
    @InjectRepository(Track)
    private readonly trackRepo: Repository<Track>,
    private readonly spotify: SpotifyService,
    private readonly youtube: YoutubeService,
    private readonly appleMusic: AppleMusicService,
    private readonly shortLinkService: ShortLinkService,
  ) {}

  async resolveUrl(url: string): Promise<Track> {
    const baseUrl = url.split('?')[0];

    // Check DB cache first
    const cached = await this.trackRepo.findOne({
      where: [
        { spotifyUrl: Like(`${baseUrl}%`) },
        { youtubeUrl: Like(`${baseUrl}%`) },
        { appleMusicUrl: Like(`${baseUrl}%`) },
      ],
      relations: ['artist', 'shortLinks'],
    });
    if (cached) {
      this.logger.log(`Cache hit for: ${url}`);
      return cached;
    }

    const platform = this.detectPlatform(url);
    if (platform === 'spotify') return this.resolveSpotify(url);
    if (platform === 'youtube') return this.resolveYoutube(url);

    throw new NotFoundException('Unsupported platform URL');
  }

  private detectPlatform(url: string): string | null {
    if (url.includes('open.spotify.com/track')) return 'spotify';
    if (url.includes('music.youtube.com') || url.includes('youtube.com/watch') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('music.apple.com') || url.includes('itunes.apple.com')) return 'apple';
    return null;
  }

  private extractSpotifyTrackId(url: string): string | null {
    const match = url.match(/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/);
    return match?.[1] ?? null;
  }

  private extractYoutubeVideoId(url: string): string | null {
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    if (watchMatch) return watchMatch[1];
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    return shortMatch?.[1] ?? null;
  }

  private async resolveSpotify(url: string): Promise<Track> {
    const trackId = this.extractSpotifyTrackId(url);
    if (!trackId) throw new NotFoundException('Invalid Spotify URL');

    const spotifyTrack = await this.spotify.getTrackById(trackId);
    const artistName = spotifyTrack.artistName ?? 'Unknown Artist';

    const artist = await this.findOrCreateArtist(artistName, spotifyTrack.artistSpotifyId);

    const [youtubeUrl, appleMusicUrl] = await Promise.all([
      this.youtube.findTrackUrl(artistName, spotifyTrack.title),
      this.appleMusic.findTrackUrl(artistName, spotifyTrack.title, spotifyTrack.isrc),
    ]);

    return this.createTrack({
      title: spotifyTrack.title,
      artistId: artist.id,
      coverUrl: spotifyTrack.coverUrl,
      isrc: spotifyTrack.isrc,
      duration: spotifyTrack.duration,
      releaseDate: spotifyTrack.releaseDate,
      spotifyUrl: spotifyTrack.spotifyUrl,
      youtubeUrl,
      appleMusicUrl,
    });
  }

  private async resolveYoutube(url: string): Promise<Track> {
    const videoId = this.extractYoutubeVideoId(url);
    if (!videoId) throw new NotFoundException('Invalid YouTube URL');

    const youtubeUrl = `https://music.youtube.com/watch?v=${videoId}`;
    const meta = await this.youtube.getVideoMetadata(videoId);

    let artistName = 'Unknown Artist';
    let trackTitle = meta?.title ?? 'Unknown Track';

    // Parse "Artist - Track" or "Track - Artist" title format
    if (meta?.title?.includes(' - ')) {
      const parts = meta.title.split(' - ');
      artistName = parts[0].trim();
      trackTitle = parts.slice(1).join(' - ').trim();
    } else if (meta?.channelTitle) {
      artistName = meta.channelTitle;
    }

    // Try to find on Spotify for richer metadata
    let spotifyUrl: string | null = null;
    let coverUrl: string | null = null;
    let isrc: string | null = null;
    let duration: number | null = null;
    let releaseDate: string | null = null;

    try {
      const spotifyResults = await this.spotify.searchArtistTracks(artistName, trackTitle);
      if (spotifyResults.length > 0) {
        const st = spotifyResults[0];
        spotifyUrl = st.spotifyUrl;
        coverUrl = st.coverUrl;
        isrc = st.isrc;
        duration = st.duration;
        releaseDate = st.releaseDate;
      }
    } catch {
      this.logger.warn(`Spotify search failed for "${artistName} - ${trackTitle}"`);
    }

    const appleMusicUrl = await this.appleMusic.findTrackUrl(artistName, trackTitle, isrc);
    const artist = await this.findOrCreateArtist(artistName, null);

    return this.createTrack({
      title: trackTitle,
      artistId: artist.id,
      coverUrl,
      isrc,
      duration,
      releaseDate,
      spotifyUrl,
      youtubeUrl,
      appleMusicUrl,
    });
  }

  private async findOrCreateArtist(name: string, spotifyId: string | null): Promise<Artist> {
    if (spotifyId) {
      const bySpotifyId = await this.artistRepo.findOne({ where: { spotifyId } });
      if (bySpotifyId) return bySpotifyId;
    }

    const nameLower = name.toLowerCase();
    const all = await this.artistRepo.find();
    const byName = all.find((a) => a.name.toLowerCase() === nameLower);
    if (byName) return byName;

    // Fetch image from Spotify if we have spotifyId
    let imageUrl: string | null = null;
    if (spotifyId) {
      try {
        const spotifyArtist = await this.spotify.getArtist(spotifyId);
        imageUrl = spotifyArtist.imageUrl;
      } catch { /* ignore */ }
    }

    const slug = `${slugify(name, { lower: true, strict: true })}-${Math.random().toString(36).slice(2, 6)}`;
    return this.artistRepo.save(
      this.artistRepo.create({ name, slug, spotifyId, imageUrl }),
    );
  }

  private async createTrack(data: {
    title: string;
    artistId: number;
    coverUrl: string | null;
    isrc: string | null;
    duration: number | null;
    releaseDate: string | null;
    spotifyUrl: string | null;
    youtubeUrl: string | null;
    appleMusicUrl: string | null;
  }): Promise<Track> {
    const slug = `${slugify(data.title, { lower: true, strict: true })}-${Math.random().toString(36).slice(2, 6)}`;

    const track = await this.trackRepo.save(
      this.trackRepo.create({ ...data, slug }),
    );

    if (data.spotifyUrl) await this.shortLinkService.create(track.id, Platform.SPOTIFY, data.spotifyUrl);
    if (data.youtubeUrl) await this.shortLinkService.create(track.id, Platform.YOUTUBE, data.youtubeUrl);
    if (data.appleMusicUrl) await this.shortLinkService.create(track.id, Platform.APPLE, data.appleMusicUrl);

    return this.trackRepo.findOne({
      where: { id: track.id },
      relations: ['artist', 'shortLinks'],
    });
  }
}
