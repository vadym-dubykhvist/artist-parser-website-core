import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Track } from '../entities/track.entity';

@Injectable()
export class TrackService {
  constructor(
    @InjectRepository(Track)
    private readonly trackRepo: Repository<Track>,
  ) {}

  async findBySlug(slug: string): Promise<Track> {
    const track = await this.trackRepo.findOne({
      where: { slug },
      relations: ['artist', 'shortLinks'],
    });
    if (!track) throw new NotFoundException(`Track "${slug}" not found`);
    return track;
  }
}
