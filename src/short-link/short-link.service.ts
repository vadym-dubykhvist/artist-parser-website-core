import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShortLink, Platform } from '../entities/short-link.entity';
// nanoid v3 — CommonJS compatible
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { nanoid } = require('nanoid');

@Injectable()
export class ShortLinkService {
  constructor(
    @InjectRepository(ShortLink)
    private readonly shortLinkRepo: Repository<ShortLink>,
  ) {}

  async create(
    trackId: number,
    platform: Platform,
    originalUrl: string,
  ): Promise<ShortLink> {
    const code = nanoid(6);
    const shortLink = this.shortLinkRepo.create({
      code,
      originalUrl,
      platform,
      trackId,
    });
    return this.shortLinkRepo.save(shortLink);
  }

  async findByCode(code: string): Promise<ShortLink | null> {
    return this.shortLinkRepo.findOne({
      where: { code },
      relations: ['track', 'track.artist'],
    });
  }

  async incrementClick(id: number): Promise<void> {
    await this.shortLinkRepo.increment({ id }, 'clickCount', 1);
  }
}
