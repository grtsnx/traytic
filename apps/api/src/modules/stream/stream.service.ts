import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface StreamEvent {
  siteId: string;
  payload: Record<string, unknown>;
}

@Injectable()
export class StreamService {
  private readonly subject = new Subject<StreamEvent>();

  publish(siteId: string, payload: Record<string, unknown>) {
    this.subject.next({ siteId, payload });
  }

  subscribe(siteId: string): Observable<MessageEvent> {
    return this.subject.asObservable().pipe(
      filter((e) => e.siteId === siteId),
      map(
        (e) =>
          ({ data: JSON.stringify(e.payload) }) as unknown as MessageEvent,
      ),
    );
  }
}
