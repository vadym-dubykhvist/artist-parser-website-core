import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShortLinkController } from './short-link.controller';
import { ShortLinkService } from './short-link.service';
import { ShortLink } from '../entities/short-link.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShortLink])],
  controllers: [ShortLinkController],
  providers: [ShortLinkService],
  exports: [ShortLinkService],
})
export class ShortLinkModule {}
