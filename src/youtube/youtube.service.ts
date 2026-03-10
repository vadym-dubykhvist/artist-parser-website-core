import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class YoutubeService {
  private readonly logger = new Logger(YoutubeService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async findTrackUrl(
    artistName: string,
    trackTitle: string,
  ): Promise<string | null> {
    const apiKey = this.config.get<string>('YOUTUBE_API_KEY');
    if (!apiKey) {
      this.logger.warn('YOUTUBE_API_KEY is not set, skipping YouTube search');
      return null;
    }

    const query = `${artistName} ${trackTitle}`;
    try {
      const { data } = await firstValueFrom(
        this.http.get('https://www.googleapis.com/youtube/v3/search', {
          params: {
            q: query,
            type: 'video',
            videoCategoryId: '10',
            part: 'id',
            maxResults: 1,
            key: apiKey,
          },
        }),
      );

      const videoId = data.items?.[0]?.id?.videoId;
      if (!videoId) return null;

      return `https://music.youtube.com/watch?v=${videoId}`;
    } catch (err) {
      this.logger.error(
        `YouTube search failed for "${query}": ${err.message}`,
      );
      return null;
    }
  }
}
