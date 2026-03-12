import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ResolveService } from './resolve.service';

@Controller('resolve')
export class ResolveController {
  constructor(private readonly resolveService: ResolveService) {}

  @Get()
  resolve(@Query('url') url: string) {
    if (!url) throw new BadRequestException('url query param is required');
    return this.resolveService.resolveUrl(url);
  }
}
