import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { SitesService } from './sites.service';

@Controller('sites')
export class SitesController {
  constructor(private readonly sites: SitesService) {}

  @Get()
  findAll(@Query('orgId') orgId: string) {
    return this.sites.findByOrg(orgId);
  }

  @Post()
  create(
    @Body() body: { orgId: string; name: string; domain: string; timezone?: string },
  ) {
    return this.sites.create(body.orgId, body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: { orgId: string; name?: string; domain?: string; public?: boolean },
  ) {
    return this.sites.update(id, body.orgId, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('orgId') orgId: string) {
    return this.sites.delete(id, orgId);
  }

  @Post(':id/rotate-key')
  rotateKey(@Param('id') id: string, @Body('orgId') orgId: string) {
    return this.sites.rotateApiKey(id, orgId);
  }
}
