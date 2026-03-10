import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ArtistService } from './artist.service';
import { MusicSyncService } from '../music-sync/music-sync.service';
import { SpotifyService } from '../spotify/spotify.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

class CreateArtistDto {
  spotifyId: string;
}

@Controller('artists')
export class ArtistController {
  constructor(
    private readonly artistService: ArtistService,
    private readonly musicSync: MusicSyncService,
    private readonly spotify: SpotifyService,
  ) {}

  @Get()
  findAll() {
    return this.artistService.findAll();
  }

  @Get('search')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  searchSpotify(@Query('q') q: string) {
    return this.spotify.searchArtists(q);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.artistService.findBySlug(slug);
  }

  @Get(':slug/tracks/search')
  async searchTracks(
    @Param('slug') slug: string,
    @Query('q') q: string,
  ) {
    const artist = await this.artistService.findBySlug(slug);
    return this.spotify.searchArtistTracks(artist.name, q);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateArtistDto) {
    return this.musicSync.syncArtist(dto.spotifyId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.artistService.remove(id);
  }
}
