import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import slugify from 'slugify';
import { SpotifyService } from '../spotify/spotify.service';
import { YoutubeService } from '../youtube/youtube.service';
import { AppleMusicService } from '../apple-music/apple-music.service';
import { ShortLinkService } from '../short-link/short-link.service';
import { Artist } from '../entities/artist.entity';
import { Track } from '../entities/track.entity';
import { Platform } from '../entities/short-link.entity';

@Injectable()
export class MusicSyncService {
  private readonly logger = new Logger(MusicSyncService.name);

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

  async syncArtist(spotifyId: string): Promise<Artist> {
    const existing = await this.artistRepo.findOne({ where: { spotifyId } });
    if (existing) {
      throw new ConflictException(
        `Artist with Spotify ID "${spotifyId}" already exists`,
      );
    }

    this.logger.log(`Syncing artist: ${spotifyId}`);

    const spotifyArtist = await this.spotify.getArtist(spotifyId);
    const slug = this.uniqueSlug(spotifyArtist.name);

    const artist = await this.artistRepo.save(
      this.artistRepo.create({
        name: spotifyArtist.name,
        slug,
        spotifyId,
        imageUrl: spotifyArtist.imageUrl,
        bio: spotifyArtist.bio,
      }),
    );

    this.logger.log(`Artist saved: ${artist.name}. Fetching tracks...`);

    const spotifyTracks = await this.spotify.getArtistTopTracks(spotifyId);

    for (const st of spotifyTracks) {
      const trackSlug = this.uniqueSlug(`${spotifyArtist.name} ${st.title}`);

      const [youtubeUrl, appleMusicUrl] = await Promise.all([
        this.youtube.findTrackUrl(spotifyArtist.name, st.title),
        this.appleMusic.findTrackUrl(spotifyArtist.name, st.title, st.isrc),
      ]);

      const track = await this.trackRepo.save(
        this.trackRepo.create({
          title: st.title,
          slug: trackSlug,
          artistId: artist.id,
          coverUrl: st.coverUrl,
          isrc: st.isrc,
          duration: st.duration,
          releaseDate: st.releaseDate,
          spotifyUrl: st.spotifyUrl,
          youtubeUrl,
          appleMusicUrl,
        }),
      );

      if (st.spotifyUrl) {
        await this.shortLinkService.create(track.id, Platform.SPOTIFY, st.spotifyUrl);
      }
      if (youtubeUrl) {
        await this.shortLinkService.create(track.id, Platform.YOUTUBE, youtubeUrl);
      }
      if (appleMusicUrl) {
        await this.shortLinkService.create(track.id, Platform.APPLE, appleMusicUrl);
      }

      this.logger.log(`Track synced: ${track.title}`);
    }

    return this.artistRepo.findOne({
      where: { id: artist.id },
      relations: ['tracks'],
    });
  }

  private uniqueSlug(name: string): string {
    const base = slugify(name, { lower: true, strict: true });
    const suffix = Math.random().toString(36).slice(2, 6);
    return `${base}-${suffix}`;
  }
}
