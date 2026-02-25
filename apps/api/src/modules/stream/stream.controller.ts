import { Controller, Param, Sse, MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { StreamService } from './stream.service';

@Controller('stream')
export class StreamController {
  constructor(private readonly stream: StreamService) {}

  /**
   * SSE endpoint — dashboard connects here to receive real-time events
   * GET /api/stream/:siteId
   */
  @Sse(':siteId')
  connect(@Param('siteId') siteId: string): Observable<MessageEvent> {
    return this.stream.subscribe(siteId);
  }
}
