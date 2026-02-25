import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from './databases/prisma/prisma.module';
import { ClickhouseModule } from './databases/clickhouse/clickhouse.module';
import { CollectModule } from './modules/collect/collect.module';
import { EventsModule } from './modules/events/events.module';
import { SitesModule } from './modules/sites/sites.module';
import { StreamModule } from './modules/stream/stream.module';
import { BillingModule } from './modules/billing/billing.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    ClickhouseModule,
    CollectModule,
    EventsModule,
    SitesModule,
    StreamModule,
    BillingModule,
    AuthModule,
  ],
})
export class AppModule {}
