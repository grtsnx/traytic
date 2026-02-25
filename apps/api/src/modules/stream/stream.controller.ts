import {
  Controller,
  Param,
  Sse,
  MessageEvent,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { StreamService } from './stream.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser, AuthUser } from '../../common/decorators/session.decorator';
import { SitesService } from '../sites/sites.service';

@Controller('stream')
@UseGuards(AuthGuard)
export class StreamController {
  constructor(
    private readonly stream: StreamService,
    private readonly sites: SitesService,
  ) {}

  /**
   * SSE endpoint — dashboard connects here to receive real-time events
   * GET /api/stream/:siteId
   */
  @Sse(':siteId')
  async connect(
    @Param('siteId') siteId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<Observable<MessageEvent>> {
    if (!(await this.sites.userOwnsSite(user.id, siteId)))
      throw new ForbiddenException();
    return this.stream.subscribe(siteId);
  }
}
