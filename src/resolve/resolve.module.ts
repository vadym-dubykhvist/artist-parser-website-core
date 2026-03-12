import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResolveController } from './resolve.controller';
import { ResolveService } from './resolve.service';
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
  controllers: [ResolveController],
  providers: [ResolveService],
})
export class ResolveModule {}
