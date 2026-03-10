import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Artist } from '../entities/artist.entity';

@Injectable()
export class ArtistService {
  constructor(
    @InjectRepository(Artist)
    private readonly artistRepo: Repository<Artist>,
  ) {}

  findAll(): Promise<Artist[]> {
    return this.artistRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findBySlug(slug: string): Promise<Artist> {
    const artist = await this.artistRepo.findOne({
      where: { slug },
      relations: ['tracks'],
      order: { tracks: { releaseDate: 'DESC' } } as any,
    });
    if (!artist) throw new NotFoundException(`Artist "${slug}" not found`);
    return artist;
  }

  async remove(id: number): Promise<void> {
    const artist = await this.artistRepo.findOne({ where: { id } });
    if (!artist) throw new NotFoundException(`Artist #${id} not found`);
    await this.artistRepo.remove(artist);
  }
}
