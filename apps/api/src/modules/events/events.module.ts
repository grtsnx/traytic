import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { AuthModule } from '../auth/auth.module';
import { SitesModule } from '../sites/sites.module';

@Module({
  imports: [AuthModule, SitesModule],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
