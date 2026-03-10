import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtistController } from './artist.controller';
import { ArtistService } from './artist.service';
import { Artist } from '../entities/artist.entity';
import { MusicSyncModule } from '../music-sync/music-sync.module';
import { SpotifyModule } from '../spotify/spotify.module';

@Module({
  imports: [TypeOrmModule.forFeature([Artist]), MusicSyncModule, SpotifyModule],
  controllers: [ArtistController],
  providers: [ArtistService],
  exports: [ArtistService],
})
export class ArtistModule {}
