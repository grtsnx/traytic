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
import { OrgsService } from './orgs.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import {
  CurrentUser,
  AuthUser,
} from '../../common/decorators/session.decorator';
import { OrganizationRole } from '../../generated/prisma/client';

@Controller('orgs')
@UseGuards(AuthGuard)
export class OrgsController {
  constructor(private readonly orgs: OrgsService) {}

  // ─── Organization CRUD ──────────────────────────────────────────────────

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.orgs.listForUser(user.id);
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body() body: { name: string; slug?: string },
  ) {
    return this.orgs.create(user.id, body);
  }

  @Patch(':orgId')
  update(
    @CurrentUser() user: AuthUser,
    @Param('orgId') orgId: string,
    @Body() body: { name?: string; slug?: string },
  ) {
    return this.orgs.update(user.id, orgId, body);
  }

  @Delete(':orgId')
  remove(@CurrentUser() user: AuthUser, @Param('orgId') orgId: string) {
    return this.orgs.delete(user.id, orgId);
  }

  // ─── Members ────────────────────────────────────────────────────────────

  @Get(':orgId/members')
  listMembers(
    @CurrentUser() user: AuthUser,
    @Param('orgId') orgId: string,
  ) {
    return this.orgs.listMembers(user.id, orgId);
  }

  @Patch(':orgId/members/:memberId')
  updateMemberRole(
    @CurrentUser() user: AuthUser,
    @Param('orgId') orgId: string,
    @Param('memberId') memberId: string,
    @Body() body: { role: OrganizationRole },
  ) {
    return this.orgs.updateMemberRole(user.id, orgId, memberId, body.role);
  }

  @Delete(':orgId/members/:memberId')
  removeMember(
    @CurrentUser() user: AuthUser,
    @Param('orgId') orgId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.orgs.removeMember(user.id, orgId, memberId);
  }

  @Post(':orgId/leave')
  leave(
    @CurrentUser() user: AuthUser,
    @Param('orgId') orgId: string,
  ) {
    return this.orgs.leaveOrg(user.id, orgId);
  }

  // ─── Invitations ────────────────────────────────────────────────────────

  @Post(':orgId/invitations')
  invite(
    @CurrentUser() user: AuthUser,
    @Param('orgId') orgId: string,
    @Body() body: { email: string; role?: OrganizationRole },
  ) {
    return this.orgs.invite(user.id, orgId, body.email, body.role);
  }

  @Get(':orgId/invitations')
  listInvitations(
    @CurrentUser() user: AuthUser,
    @Param('orgId') orgId: string,
  ) {
    return this.orgs.listInvitations(user.id, orgId);
  }

  @Delete(':orgId/invitations/:invitationId')
  revokeInvitation(
    @CurrentUser() user: AuthUser,
    @Param('orgId') orgId: string,
    @Param('invitationId') invitationId: string,
  ) {
    return this.orgs.revokeInvitation(user.id, orgId, invitationId);
  }

  @Post('invitations/accept')
  acceptInvitation(
    @CurrentUser() user: AuthUser,
    @Body() body: { token: string },
  ) {
    return this.orgs.acceptInvitation(user.id, body.token);
  }
}
