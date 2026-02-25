import { Module } from '@nestjs/common';
import { CollectController } from './collect.controller';
import { CollectService } from './collect.service';
import { StreamModule } from '../stream/stream.module';
import { SitesModule } from '../sites/sites.module';

@Module({
  imports: [StreamModule, SitesModule],
  controllers: [CollectController],
  providers: [CollectService],
})
export class CollectModule {}
