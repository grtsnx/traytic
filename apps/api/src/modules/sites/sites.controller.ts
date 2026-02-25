import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SitesService } from './sites.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser, AuthUser } from '../../common/decorators/session.decorator';

@Controller('sites')
@UseGuards(AuthGuard)
export class SitesController {
  constructor(private readonly sites: SitesService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.sites.findByUserId(user.id);
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body() body: { name: string; domain: string; timezone?: string },
  ) {
    return this.sites.createForUser(user.id, body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() body: { name?: string; domain?: string; public?: boolean },
  ) {
    return this.sites.updateForUser(id, user.id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.sites.deleteForUser(id, user.id);
  }

  @Post(':id/rotate-key')
  rotateKey(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.sites.rotateApiKeyForUser(id, user.id);
  }
}
