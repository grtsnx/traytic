import { Injectable } from '@nestjs/common';
import { ClickhouseService } from '../../databases/clickhouse/clickhouse.service';

export type Period = '24h' | '7d' | '30d' | '90d';

const PERIOD_SQL: Record<Period, string> = {
  '24h': 'now() - INTERVAL 1 DAY',
  '7d': 'now() - INTERVAL 7 DAY',
  '30d': 'now() - INTERVAL 30 DAY',
  '90d': 'now() - INTERVAL 90 DAY',
};

@Injectable()
export class EventsService {
  constructor(private readonly clickhouse: ClickhouseService) {}

  async getOverview(siteId: string, period: Period) {
    const since = PERIOD_SQL[period];
    return this.clickhouse.queryOne<{
      visitors: string;
      pageviews: string;
      avg_duration_ms: string;
      bounce_rate: string;
    }>(
      `SELECT
        uniqExact(visitor_id)                           AS visitors,
        countIf(type = 'pageview')                      AS pageviews,
        round(avgIf(duration_ms, type = 'pageview'))    AS avg_duration_ms,
        round(avgIf(is_bounce, type = 'pageview') * 100, 1) AS bounce_rate
      FROM events
      WHERE site_id = {siteId:String}
        AND ts >= ${since}`,
      { siteId },
    );
  }

  async getTimeSeries(siteId: string, period: Period) {
    const since = PERIOD_SQL[period];
    const granularity = period === '24h' ? 'toStartOfHour(ts)' : 'toDate(ts)';
    return this.clickhouse.query<{ date: string; visitors: string; pageviews: string }>(
      `SELECT
        ${granularity}            AS date,
        uniqExact(visitor_id)     AS visitors,
        countIf(type='pageview')  AS pageviews
      FROM events
      WHERE site_id = {siteId:String} AND ts >= ${since}
      GROUP BY date
      ORDER BY date ASC`,
      { siteId },
    );
  }

  async getTopPages(siteId: string, period: Period, limit = 20) {
    const since = PERIOD_SQL[period];
    return this.clickhouse.query<{ path: string; pageviews: string; visitors: string }>(
      `SELECT
        path,
        count()                 AS pageviews,
        uniqExact(visitor_id)   AS visitors
      FROM events
      WHERE site_id = {siteId:String}
        AND ts >= ${since}
        AND type = 'pageview'
      GROUP BY path
      ORDER BY pageviews DESC
      LIMIT {limit:UInt8}`,
      { siteId, limit },
    );
  }

  async getTopSources(siteId: string, period: Period, limit = 20) {
    const since = PERIOD_SQL[period];
    return this.clickhouse.query<{ source: string; visitors: string }>(
      `SELECT
        referrer_source         AS source,
        uniqExact(visitor_id)   AS visitors
      FROM events
      WHERE site_id = {siteId:String}
        AND ts >= ${since}
        AND type = 'pageview'
      GROUP BY source
      ORDER BY visitors DESC
      LIMIT {limit:UInt8}`,
      { siteId, limit },
    );
  }

  async getCountries(siteId: string, period: Period) {
    const since = PERIOD_SQL[period];
    return this.clickhouse.query<{ country: string; visitors: string }>(
      `SELECT
        country,
        uniqExact(visitor_id) AS visitors
      FROM events
      WHERE site_id = {siteId:String}
        AND ts >= ${since}
        AND type = 'pageview'
        AND country != ''
      GROUP BY country
      ORDER BY visitors DESC
      LIMIT 50`,
      { siteId },
    );
  }

  async getDevices(siteId: string, period: Period) {
    const since = PERIOD_SQL[period];
    return this.clickhouse.query<{ device_type: string; visitors: string }>(
      `SELECT
        device_type,
        uniqExact(visitor_id) AS visitors
      FROM events
      WHERE site_id = {siteId:String}
        AND ts >= ${since}
        AND type = 'pageview'
      GROUP BY device_type
      ORDER BY visitors DESC`,
      { siteId },
    );
  }

  async getWebVitals(siteId: string, period: Period) {
    const since = PERIOD_SQL[period];
    return this.clickhouse.query<{
      vital_name: string;
      p75: string;
      p95: string;
      good_pct: string;
    }>(
      `SELECT
        vital_name,
        quantile(0.75)(vital_value)                               AS p75,
        quantile(0.95)(vital_value)                               AS p95,
        round(countIf(vital_rating = 'good') / count() * 100, 1) AS good_pct
      FROM events
      WHERE site_id = {siteId:String}
        AND ts >= ${since}
        AND type = 'vital'
        AND vital_name != ''
      GROUP BY vital_name
      ORDER BY vital_name`,
      { siteId },
    );
  }

  async getLiveVisitors(siteId: string): Promise<number> {
    const result = await this.clickhouse.queryOne<{ count: string }>(
      `SELECT uniqExact(visitor_id) AS count
      FROM events
      WHERE site_id = {siteId:String}
        AND ts >= now() - INTERVAL 5 MINUTE`,
      { siteId },
    );
    return parseInt(result?.count ?? '0', 10);
  }
}
