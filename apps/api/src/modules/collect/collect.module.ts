import { Module } from '@nestjs/common';
import { CollectController } from './collect.controller';
import { CollectService } from './collect.service';
import { StreamModule } from '../stream/stream.module';

@Module({
  imports: [StreamModule],
  controllers: [CollectController],
  providers: [CollectService],
})
export class CollectModule {}
