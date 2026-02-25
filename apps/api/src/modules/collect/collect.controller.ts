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

@Controller('collect')
export class CollectController {
  constructor(private readonly collectService: CollectService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  async collect(
    @Body() body: CollectDto,
    @Req() req: FastifyRequest,
  ): Promise<void> {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      req.ip;

    const userAgent = req.headers['user-agent'] ?? '';

    // Fire-and-forget — respond 204 immediately, process async
    this.collectService.process(body, ip, userAgent).catch(() => {
      // silent — never let collect errors surface to the SDK
    });
  }
}
