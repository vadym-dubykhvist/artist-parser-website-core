import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppleMusicService } from './apple-music.service';

@Module({
  imports: [HttpModule],
  providers: [AppleMusicService],
  exports: [AppleMusicService],
})
export class AppleMusicModule {}
