import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MusicSyncService } from './music-sync.service';
import { Artist } from '../entities/artist.entity';
import { Track } from '../entities/track.entity';
import { SpotifyModule } from '../spotify/spotify.module';
import { YoutubeModule } from '../youtube/youtube.module';
import { AppleMusicModule } from '../apple-music/apple-music.module';
import { ShortLinkModule } from '../short-link/short-link.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Artist, Track]),
    SpotifyModule,
    YoutubeModule,
    AppleMusicModule,
    ShortLinkModule,
  ],
  providers: [MusicSyncService],
  exports: [MusicSyncService],
})
export class MusicSyncModule {}
