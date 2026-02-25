import { Module } from '@nestjs/common';
import { StreamController } from './stream.controller';
import { StreamService } from './stream.service';
import { AuthModule } from '../auth/auth.module';
import { SitesModule } from '../sites/sites.module';

@Module({
  imports: [AuthModule, SitesModule],
  controllers: [StreamController],
  providers: [StreamService],
  exports: [StreamService],
})
export class StreamModule {}
