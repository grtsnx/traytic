import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createClient, ClickHouseClient } from '@clickhouse/client';

@Injectable()
export class ClickhouseService implements OnModuleInit {
  private readonly logger = new Logger(ClickhouseService.name);
  private client!: ClickHouseClient;

  async onModuleInit() {
    this.client = createClient({
      url: process.env.CLICKHOUSE_HOST ?? 'http://localhost:8123',
      database: process.env.CLICKHOUSE_DATABASE ?? 'traytic',
      username: process.env.CLICKHOUSE_USERNAME ?? 'traytic',
      password: process.env.CLICKHOUSE_PASSWORD ?? 'traytic_secret',
      clickhouse_settings: {
        async_insert: 1,
        wait_for_async_insert: 0, // fire-and-forget for collect endpoint
      },
    });

    await this.ping();
    this.logger.log('ClickHouse connected');
  }

  async ping() {
    const result = await this.client.ping();
    if (!result.success) throw new Error('ClickHouse ping failed');
  }

  async insert<T extends Record<string, unknown>>(
    table: string,
    values: T[],
  ): Promise<void> {
    await this.client.insert({
      table,
      values,
      format: 'JSONEachRow',
    });
  }

  async query<T = Record<string, unknown>>(
    sql: string,
    query_params?: Record<string, unknown>,
  ): Promise<T[]> {
    const result = await this.client.query({
      query: sql,
      query_params,
      format: 'JSONEachRow',
    });
    return result.json<T>();
  }

  async queryOne<T = Record<string, unknown>>(
    sql: string,
    query_params?: Record<string, unknown>,
  ): Promise<T | null> {
    const rows = await this.query<T>(sql, query_params);
    return rows[0] ?? null;
  }
}
