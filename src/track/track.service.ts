import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
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

  async findByUrl(url: string): Promise<Track> {
    const baseUrl = url.split('?')[0];
    const track = await this.trackRepo.findOne({
      where: [
        { spotifyUrl: Like(`${baseUrl}%`) },
        { youtubeUrl: Like(`${baseUrl}%`) },
        { appleMusicUrl: Like(`${baseUrl}%`) },
      ],
      relations: ['artist', 'shortLinks'],
    });
    if (!track) throw new NotFoundException(`Track not found for URL: ${url}`);
    return track;
  }
}
