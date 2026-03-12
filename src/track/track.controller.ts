import { Controller, Get, Param, Query } from '@nestjs/common';
import { TrackService } from './track.service';

@Controller('tracks')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  @Get('lookup')
  findByUrl(@Query('url') url: string) {
    return this.trackService.findByUrl(url);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.trackService.findBySlug(slug);
  }
}
