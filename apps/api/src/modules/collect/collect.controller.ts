import {
  Controller,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { CollectService } from './collect.service';
import { CollectDto } from './dto/collect.dto';
import { SitesService } from '../sites/sites.service';

const RL_MAX = 200;
const RL_WINDOW_MS = 60_000;
const rlMap = new Map<string, { n: number; exp: number }>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rlMap.get(key);
  if (!entry || now > entry.exp) {
    rlMap.set(key, { n: 1, exp: now + RL_WINDOW_MS });
    return true;
  }
  if (entry.n >= RL_MAX) return false;
  entry.n++;
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rlMap) {
    if (now > val.exp) rlMap.delete(key);
  }
}, 5 * 60_000);

@Controller('collect')
export class CollectController {
  constructor(
    private readonly collectService: CollectService,
    private readonly sitesService: SitesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  async collect(
    @Body() body: CollectDto,
    @Req() req: FastifyRequest,
  ): Promise<void> {
    let siteId = body.siteId;

    if (!siteId && body.domain) {
      const site = await this.sitesService.findByDomain(body.domain);
      if (!site) return;
      siteId = site.id;
    }

    if (!siteId) return;

    if (!checkRateLimit(siteId)) return;

    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      req.ip;

    const userAgent = req.headers['user-agent'] ?? '';

    this.collectService
      .process({ ...body, siteId }, ip, userAgent)
      .catch(() => {});
  }
}
