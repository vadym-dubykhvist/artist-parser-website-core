import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppleMusicService {
  private readonly logger = new Logger(AppleMusicService.name);

  constructor(private readonly http: HttpService) {}

  async findTrackUrl(
    artistName: string,
    trackTitle: string,
    isrc?: string | null,
  ): Promise<string | null> {
    const normalize = (s: string) => s.toLowerCase().trim();
    const artistNorm = normalize(artistName);
    const titleNorm = normalize(trackTitle);

    const search = async (term: string, country?: string): Promise<any[]> => {
      const params: Record<string, string | number> = {
        term,
        media: 'music',
        limit: 10,
      };
      if (country) params.country = country;
      const { data } = await firstValueFrom(
        this.http.get('https://itunes.apple.com/search', { params }),
      );
      const results = data.results ?? [];
      this.logger.log(
        `iTunes [${country ?? 'us'}] "${term}" → ${results.length} results: ${results.map((r: any) => `"${r.artistName}/${r.trackName}"`).join(', ')}`,
      );
      return results;
    };

    const findMatch = (results: any[]): string | null => {
      const match = results.find(
        (r) =>
          normalize(r.artistName ?? '').includes(artistNorm) &&
          normalize(r.trackName ?? '').includes(titleNorm),
      );
      return match?.trackViewUrl ?? null;
    };

    const findTitleOnly = (results: any[]): string | null => {
      const match = results.find((r) =>
        normalize(r.trackName ?? '').includes(titleNorm),
      );
      return match?.trackViewUrl ?? null;
    };

    try {
      const term = `${artistName} ${trackTitle}`;

      // Try US store first (artist + title)
      const us1 = await search(term);
      const url1 = findMatch(us1);
      if (url1) return url1;

      // Try UA store (artist + title)
      const ua1 = await search(term, 'ua');
      const url2 = findMatch(ua1);
      if (url2) return url2;

      // UA store title only
      const ua2 = await search(trackTitle, 'ua');
      const url3 = findMatch(ua2) ?? findTitleOnly(ua2);
      if (url3) return url3;

      // US store title only
      const us2 = await search(trackTitle);
      const url4 = findTitleOnly(us2);
      if (url4) return url4;

      return null;
    } catch (err) {
      this.logger.error(
        `Apple Music search failed for "${artistName} ${trackTitle}": ${err.message}`,
      );
      return null;
    }
  }
}
