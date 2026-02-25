import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { EventsService, Period } from './events.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser, AuthUser } from '../../common/decorators/session.decorator';
import { SitesService } from '../sites/sites.service';

@Controller('events')
@UseGuards(AuthGuard)
export class EventsController {
  constructor(
    private readonly events: EventsService,
    private readonly sites: SitesService,
  ) {}

  private async assertOwner(userId: string, siteId: string) {
    if (!(await this.sites.userOwnsSite(userId, siteId)))
      throw new ForbiddenException();
  }

  @Get(':siteId/overview')
  async getOverview(
    @Param('siteId') siteId: string,
    @CurrentUser() user: AuthUser,
    @Query('period') period: Period = '30d',
  ) {
    await this.assertOwner(user.id, siteId);
    return this.events.getOverview(siteId, period);
  }

  @Get(':siteId/timeseries')
  async getTimeSeries(
    @Param('siteId') siteId: string,
    @CurrentUser() user: AuthUser,
    @Query('period') period: Period = '30d',
  ) {
    await this.assertOwner(user.id, siteId);
    return this.events.getTimeSeries(siteId, period);
  }

  @Get(':siteId/pages')
  async getTopPages(
    @Param('siteId') siteId: string,
    @CurrentUser() user: AuthUser,
    @Query('period') period: Period = '30d',
    @Query('limit') limit?: number,
  ) {
    await this.assertOwner(user.id, siteId);
    return this.events.getTopPages(siteId, period, limit);
  }

  @Get(':siteId/sources')
  async getTopSources(
    @Param('siteId') siteId: string,
    @CurrentUser() user: AuthUser,
    @Query('period') period: Period = '30d',
  ) {
    await this.assertOwner(user.id, siteId);
    return this.events.getTopSources(siteId, period);
  }

  @Get(':siteId/countries')
  async getCountries(
    @Param('siteId') siteId: string,
    @CurrentUser() user: AuthUser,
    @Query('period') period: Period = '30d',
  ) {
    await this.assertOwner(user.id, siteId);
    return this.events.getCountries(siteId, period);
  }

  @Get(':siteId/devices')
  async getDevices(
    @Param('siteId') siteId: string,
    @CurrentUser() user: AuthUser,
    @Query('period') period: Period = '30d',
  ) {
    await this.assertOwner(user.id, siteId);
    return this.events.getDevices(siteId, period);
  }

  @Get(':siteId/vitals')
  async getWebVitals(
    @Param('siteId') siteId: string,
    @CurrentUser() user: AuthUser,
    @Query('period') period: Period = '30d',
  ) {
    await this.assertOwner(user.id, siteId);
    return this.events.getWebVitals(siteId, period);
  }

  @Get(':siteId/live')
  async getLiveVisitors(
    @Param('siteId') siteId: string,
    @CurrentUser() user: AuthUser,
  ) {
    await this.assertOwner(user.id, siteId);
    return this.events.getLiveVisitors(siteId);
  }
}
