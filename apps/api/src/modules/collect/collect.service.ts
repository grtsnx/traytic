import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { UAParser } from 'ua-parser-js';
import { ClickhouseService } from '../../databases/clickhouse/clickhouse.service';
import { StreamService } from '../stream/stream.service';
import { CollectDto, EventType } from './dto/collect.dto';

// Known bot UA fragments — extend as needed
const BOT_PATTERNS =
  /bot|crawler|spider|scraper|headless|phantom|selenium|puppeteer|playwright/i;

@Injectable()
export class CollectService {
  private readonly logger = new Logger(CollectService.name);

  constructor(
    private readonly clickhouse: ClickhouseService,
    private readonly stream: StreamService,
  ) {}

  async process(dto: CollectDto & { siteId: string }, rawIp: string, userAgent: string) {
    if (BOT_PATTERNS.test(userAgent)) return;

    const siteId = dto.siteId;
    const today = new Date().toISOString().slice(0, 10);
    const ua = new UAParser(userAgent).getResult();

    const browser = ua.browser.name ?? 'Unknown';
    const browserVersion = ua.browser.version ?? '';
    const os = ua.os.name ?? 'Unknown';
    const osVersion = ua.os.version ?? '';
    const deviceType = resolveDevice(ua.device.type);

    const visitorId = hash(`${siteId}:${rawIp}:${userAgent}:${today}`);
    const hour = new Date().toISOString().slice(0, 13);
    const sessionId = hash(`${siteId}:${rawIp}:${userAgent}:${hour}`);

    const rows = dto.events.map((event) => {
      const parsed = new URL(event.url.startsWith('http') ? event.url : `https://x.com${event.url}`);
      const referrerSource = parseReferrerSource(event.referrer ?? '');

      return {
        site_id: siteId,
        type: event.type,
        url: event.url,
        path: parsed.pathname,
        hostname: parsed.hostname,
        referrer: event.referrer ?? '',
        referrer_source: referrerSource,
        utm_source: event.utm_source ?? '',
        utm_medium: event.utm_medium ?? '',
        utm_campaign: event.utm_campaign ?? '',
        utm_content: event.utm_content ?? '',
        utm_term: event.utm_term ?? '',
        country: '',      // populated by GeoIP in production
        region: '',
        city: '',
        browser,
        browser_version: browserVersion,
        os,
        os_version: osVersion,
        device_type: deviceType,
        visitor_id: visitorId,
        session_id: sessionId,
        duration_ms: event.duration_ms ?? 0,
        is_bounce: 0,
        is_new: 0,
        vital_name: event.vital_name ?? '',
        vital_value: event.vital_value ?? 0,
        vital_rating: event.vital_rating ?? '',
        event_name: event.event_name ?? '',
        meta: event.meta ?? {},
        error_message: event.error_message ?? '',
        error_stack: '',
        ts: new Date().toISOString().replace('T', ' ').slice(0, 19),
      };
    });

    await this.clickhouse.insert('events', rows);

    // Push to SSE stream for real-time dashboard
    const pageviews = rows.filter((r) => r.type === EventType.PAGEVIEW);
    if (pageviews.length > 0) {
      this.stream.publish(siteId, {
        type: 'pageview',
        path: pageviews[0].path,
        country: pageviews[0].country,
        browser,
        device_type: deviceType,
        ts: Date.now(),
      });
    }
  }
}

function hash(input: string): string {
  return createHash('sha256').update(input).digest('hex').slice(0, 16);
}

function resolveDevice(type: string | undefined): string {
  if (type === 'mobile') return 'mobile';
  if (type === 'tablet') return 'tablet';
  return 'desktop';
}

function parseReferrerSource(referrer: string): string {
  if (!referrer) return 'Direct';
  try {
    const { hostname } = new URL(referrer);
    const known: Record<string, string> = {
      'google.com': 'Google',
      'bing.com': 'Bing',
      't.co': 'Twitter/X',
      'twitter.com': 'Twitter/X',
      'facebook.com': 'Facebook',
      'linkedin.com': 'LinkedIn',
      'reddit.com': 'Reddit',
      'github.com': 'GitHub',
      'youtube.com': 'YouTube',
    };
    for (const [domain, name] of Object.entries(known)) {
      if (hostname.includes(domain)) return name;
    }
    return hostname.replace('www.', '');
  } catch {
    return 'Unknown';
  }
}
