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

// ─── Simple in-memory rate limiter: max 200 events/siteId/minute ─────────────
const RL_MAX = 200;
const RL_WINDOW_MS = 60_000;
const rlMap = new Map<string, { n: number; exp: number }>();

function checkRateLimit(siteId: string): boolean {
  const now = Date.now();
  const entry = rlMap.get(siteId);
  if (!entry || now > entry.exp) {
    rlMap.set(siteId, { n: 1, exp: now + RL_WINDOW_MS });
    return true;
  }
  if (entry.n >= RL_MAX) return false;
  entry.n++;
  return true;
}

// Clean up expired entries every 5 minutes to avoid unbounded growth
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rlMap) {
    if (now > val.exp) rlMap.delete(key);
  }
}, 5 * 60_000);

@Controller('collect')
export class CollectController {
  constructor(private readonly collectService: CollectService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  async collect(
    @Body() body: CollectDto,
    @Req() req: FastifyRequest,
  ): Promise<void> {
    // Rate limit: silently drop over-limit requests (204 so SDK doesn't retry)
    if (!checkRateLimit(body.siteId)) return;

    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      req.ip;

    const userAgent = req.headers['user-agent'] ?? '';

    // Fire-and-forget — respond 204 immediately, process async
    this.collectService.process(body, ip, userAgent).catch(() => {
      // silent — never surface collect errors to the SDK
    });
  }
}
