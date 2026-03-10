import { Controller, Get, Param, Req, Res, NotFoundException } from '@nestjs/common';
import { Request, Response } from 'express';
import { ShortLinkService } from './short-link.service';

const BOT_UA =
  /telegrambot|whatsapp|facebookexternalhit|twitterbot|slackbot|linkedinbot|discordbot|applebot/i;

const PLATFORM_LABEL: Record<string, string> = {
  spotify: 'Spotify',
  youtube: 'YouTube Music',
  apple: 'Apple Music',
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

@Controller('s')
export class ShortLinkController {
  constructor(private readonly shortLinkService: ShortLinkService) {}

  @Get(':code')
  async redirect(
    @Param('code') code: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const shortLink = await this.shortLinkService.findByCode(code);
    if (!shortLink) throw new NotFoundException('Short link not found');

    await this.shortLinkService.incrementClick(shortLink.id);

    const userAgent = req.headers['user-agent'] ?? '';
    const isBot = BOT_UA.test(userAgent);

    if (isBot && shortLink.track) {
      const track = shortLink.track;
      const artistName = track.artist?.name ?? '';
      const title = artistName
        ? `${track.title} — ${artistName}`
        : track.title;
      const platformLabel =
        PLATFORM_LABEL[shortLink.platform] ?? shortLink.platform;
      const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
      const safeTitle = escapeHtml(title);
      const safeDesc = escapeHtml(`Listen on ${platformLabel}`);
      const safeRedirect = escapeHtml(shortLink.originalUrl);
      const safeCanonical = escapeHtml(`${appUrl}/s/${shortLink.code}`);
      const coverMeta = track.coverUrl
        ? `<meta property="og:image" content="${escapeHtml(track.coverUrl)}"/>
  <meta name="twitter:image" content="${escapeHtml(track.coverUrl)}"/>`
        : '';

      return res.send(`<!DOCTYPE html>
<html><head>
  <meta charset="utf-8"/>
  <title>${safeTitle}</title>
  <meta property="og:title" content="${safeTitle}"/>
  <meta property="og:description" content="${safeDesc}"/>
  <meta property="og:url" content="${safeCanonical}"/>
  <meta property="og:type" content="music.song"/>
  ${coverMeta}
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${safeTitle}"/>
  <meta name="twitter:description" content="${safeDesc}"/>
  <meta http-equiv="refresh" content="0;url=${safeRedirect}"/>
</head>
<body>
  <script>window.location.replace("${safeRedirect}");</script>
</body></html>`);
    }

    return res.redirect(302, shortLink.originalUrl);
  }
}
