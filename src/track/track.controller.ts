import { Controller, Get, Param } from '@nestjs/common';
import { TrackService } from './track.service';

@Controller('tracks')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.trackService.findBySlug(slug);
  }
}
