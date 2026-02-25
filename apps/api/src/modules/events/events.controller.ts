import { Controller, Get, Param, Query } from '@nestjs/common';
import { EventsService, Period } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Get(':siteId/overview')
  getOverview(
    @Param('siteId') siteId: string,
    @Query('period') period: Period = '30d',
  ) {
    return this.events.getOverview(siteId, period);
  }

  @Get(':siteId/timeseries')
  getTimeSeries(
    @Param('siteId') siteId: string,
    @Query('period') period: Period = '30d',
  ) {
    return this.events.getTimeSeries(siteId, period);
  }

  @Get(':siteId/pages')
  getTopPages(
    @Param('siteId') siteId: string,
    @Query('period') period: Period = '30d',
    @Query('limit') limit?: number,
  ) {
    return this.events.getTopPages(siteId, period, limit);
  }

  @Get(':siteId/sources')
  getTopSources(
    @Param('siteId') siteId: string,
    @Query('period') period: Period = '30d',
  ) {
    return this.events.getTopSources(siteId, period);
  }

  @Get(':siteId/countries')
  getCountries(
    @Param('siteId') siteId: string,
    @Query('period') period: Period = '30d',
  ) {
    return this.events.getCountries(siteId, period);
  }

  @Get(':siteId/devices')
  getDevices(
    @Param('siteId') siteId: string,
    @Query('period') period: Period = '30d',
  ) {
    return this.events.getDevices(siteId, period);
  }

  @Get(':siteId/vitals')
  getWebVitals(
    @Param('siteId') siteId: string,
    @Query('period') period: Period = '30d',
  ) {
    return this.events.getWebVitals(siteId, period);
  }

  @Get(':siteId/live')
  getLiveVisitors(@Param('siteId') siteId: string) {
    return this.events.getLiveVisitors(siteId);
  }
}
