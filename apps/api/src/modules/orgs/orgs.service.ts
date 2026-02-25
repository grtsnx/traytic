import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { createTransport } from 'nodemailer';
import { PrismaService } from '../../databases/prisma/prisma.service';
import { OrganizationRole } from '../../generated/prisma/client';

const INVITE_EXPIRY_DAYS = 7;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

async function sendInvitationEmail(
  to: string,
  orgName: string,
  inviteUrl: string,
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const from = `Traytic <noreply@${process.env.EMAIL_FROM_DOMAIN ?? 'traytic.dev'}>`;
  const transport = createTransport({
    host: 'smtp.resend.com',
    port: 465,
    secure: true,
    auth: { user: 'resend', pass: apiKey },
  });

  await transport.sendMail({
    from,
    to,
    subject: `You've been invited to ${orgName} on Traytic`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#0d0d14;color:#ededed;border-radius:12px">
        <div style="margin-bottom:24px">
          <span style="font-size:18px;font-weight:700;letter-spacing:-0.03em">Traytic</span>
        </div>
        <h2 style="margin:0 0 12px;font-size:22px;font-weight:800;letter-spacing:-0.03em">Join ${orgName}</h2>
        <p style="color:#888;margin:0 0 28px;font-size:14px;line-height:1.6">
          You've been invited to join <strong style="color:#ededed">${orgName}</strong> on Traytic. Click the button below to accept the invitation. This link expires in ${INVITE_EXPIRY_DAYS} days.
        </p>
        <a href="${inviteUrl}"
           style="display:inline-block;background:#5b6de9;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
          Accept invitation
        </a>
        <p style="color:#555;font-size:12px;margin:28px 0 0">
          If you weren't expecting this invitation, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

@Injectable()
export class OrgsService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertRole(
    userId: string,
    orgId: string,
    ...allowedRoles: OrganizationRole[]
  ) {
    const member = await this.prisma.organizationMember.findUnique({
      where: { userId_orgId: { userId, orgId } },
    });
    if (!member) throw new NotFoundException('Organization not found');
    if (!allowedRoles.includes(member.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return member;
  }

  private async assertMember(userId: string, orgId: string) {
    const member = await this.prisma.organizationMember.findUnique({
      where: { userId_orgId: { userId, orgId } },
    });
    if (!member) throw new NotFoundException('Organization not found');
    return member;
  }

  // ─── Organization CRUD ────────────────────────────────────────────────────

  async listForUser(userId: string) {
    const memberships = await this.prisma.organizationMember.findMany({
      where: { userId },
      include: {
        org: {
          include: {
            _count: { select: { members: true } },
            subscription: { select: { plan: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return memberships.map((m) => ({
      id: m.org.id,
      name: m.org.name,
      slug: m.org.slug,
      createdAt: m.org.createdAt,
      updatedAt: m.org.updatedAt,
      memberCount: m.org._count.members,
      plan: m.org.subscription?.plan ?? null,
      role: m.role,
    }));
  }

  async create(userId: string, data: { name: string; slug?: string }) {
    const slug =
      data.slug?.trim() || `${slugify(data.name)}-${Date.now().toString(36)}`;

    const existing = await this.prisma.organization.findUnique({
      where: { slug },
    });
    if (existing) throw new ConflictException('Slug already taken');

    return this.prisma.organization.create({
      data: {
        name: data.name,
        slug,
        members: {
          create: { userId, role: OrganizationRole.OWNER },
        },
      },
    });
  }

  async update(
    userId: string,
    orgId: string,
    data: { name?: string; slug?: string },
  ) {
    await this.assertRole(
      userId,
      orgId,
      OrganizationRole.OWNER,
      OrganizationRole.ADMIN,
    );

    if (data.slug) {
      const existing = await this.prisma.organization.findUnique({
        where: { slug: data.slug },
      });
      if (existing && existing.id !== orgId) {
        throw new ConflictException('Slug already taken');
      }
    }

    return this.prisma.organization.update({
      where: { id: orgId },
      data,
    });
  }

  async delete(userId: string, orgId: string) {
    await this.assertRole(userId, orgId, OrganizationRole.OWNER);

    const userOrgCount = await this.prisma.organizationMember.count({
      where: { userId },
    });
    if (userOrgCount <= 1) {
      throw new BadRequestException(
        'Cannot delete your only organization. Create another one first.',
      );
    }

    return this.prisma.organization.delete({ where: { id: orgId } });
  }

  // ─── Members ──────────────────────────────────────────────────────────────

  async listMembers(userId: string, orgId: string) {
    await this.assertMember(userId, orgId);

    return this.prisma.organizationMember.findMany({
      where: { orgId },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateMemberRole(
    userId: string,
    orgId: string,
    memberId: string,
    role: OrganizationRole,
  ) {
    await this.assertRole(
      userId,
      orgId,
      OrganizationRole.OWNER,
      OrganizationRole.ADMIN,
    );

    const target = await this.prisma.organizationMember.findFirst({
      where: { id: memberId, orgId },
    });
    if (!target) throw new NotFoundException('Member not found');

    if (target.role === OrganizationRole.OWNER && role !== OrganizationRole.OWNER) {
      const ownerCount = await this.prisma.organizationMember.count({
        where: { orgId, role: OrganizationRole.OWNER },
      });
      if (ownerCount <= 1) {
        throw new BadRequestException(
          'Cannot demote the last owner. Promote another member first.',
        );
      }
    }

    return this.prisma.organizationMember.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });
  }

  async removeMember(userId: string, orgId: string, memberId: string) {
    await this.assertRole(
      userId,
      orgId,
      OrganizationRole.OWNER,
      OrganizationRole.ADMIN,
    );

    const target = await this.prisma.organizationMember.findFirst({
      where: { id: memberId, orgId },
    });
    if (!target) throw new NotFoundException('Member not found');

    if (target.role === OrganizationRole.OWNER) {
      const ownerCount = await this.prisma.organizationMember.count({
        where: { orgId, role: OrganizationRole.OWNER },
      });
      if (ownerCount <= 1) {
        throw new BadRequestException('Cannot remove the last owner.');
      }
    }

    return this.prisma.organizationMember.delete({ where: { id: memberId } });
  }

  async leaveOrg(userId: string, orgId: string) {
    const member = await this.assertMember(userId, orgId);

    if (member.role === OrganizationRole.OWNER) {
      const ownerCount = await this.prisma.organizationMember.count({
        where: { orgId, role: OrganizationRole.OWNER },
      });
      if (ownerCount <= 1) {
        throw new BadRequestException(
          'Cannot leave as the last owner. Transfer ownership first.',
        );
      }
    }

    return this.prisma.organizationMember.delete({
      where: { userId_orgId: { userId, orgId } },
    });
  }

  // ─── Invitations ──────────────────────────────────────────────────────────

  async invite(
    userId: string,
    orgId: string,
    email: string,
    role: OrganizationRole = OrganizationRole.MEMBER,
  ) {
    await this.assertRole(
      userId,
      orgId,
      OrganizationRole.OWNER,
      OrganizationRole.ADMIN,
    );

    const existingMember = await this.prisma.organizationMember.findFirst({
      where: { orgId, user: { email } },
    });
    if (existingMember) {
      throw new ConflictException('User is already a member of this organization');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      await this.prisma.organizationMember.create({
        data: { userId: existingUser.id, orgId, role },
      });
      return { added: true, email };
    }

    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: { name: true },
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);

    const invitation = await this.prisma.invitation.upsert({
      where: { orgId_email: { orgId, email } },
      create: { orgId, email, role, expiresAt },
      update: { role, expiresAt, token: undefined },
    });

    const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
    const inviteUrl = `${appUrl}/invite?token=${invitation.token}`;

    await sendInvitationEmail(email, org?.name ?? 'an organization', inviteUrl);

    return { invited: true, email };
  }

  async listInvitations(userId: string, orgId: string) {
    await this.assertMember(userId, orgId);

    return this.prisma.invitation.findMany({
      where: { orgId, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revokeInvitation(userId: string, orgId: string, invitationId: string) {
    await this.assertRole(
      userId,
      orgId,
      OrganizationRole.OWNER,
      OrganizationRole.ADMIN,
    );

    const invitation = await this.prisma.invitation.findFirst({
      where: { id: invitationId, orgId },
    });
    if (!invitation) throw new NotFoundException('Invitation not found');

    return this.prisma.invitation.delete({ where: { id: invitationId } });
  }

  async acceptInvitation(userId: string, token: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
      include: { org: { select: { name: true, slug: true } } },
    });

    if (!invitation) throw new NotFoundException('Invitation not found or expired');
    if (invitation.expiresAt < new Date()) {
      await this.prisma.invitation.delete({ where: { id: invitation.id } });
      throw new BadRequestException('This invitation has expired');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.email !== invitation.email) {
      throw new ForbiddenException(
        'This invitation was sent to a different email address',
      );
    }

    const existing = await this.prisma.organizationMember.findUnique({
      where: { userId_orgId: { userId, orgId: invitation.orgId } },
    });
    if (existing) {
      await this.prisma.invitation.delete({ where: { id: invitation.id } });
      return { orgSlug: invitation.org.slug, orgName: invitation.org.name, alreadyMember: true };
    }

    await this.prisma.$transaction([
      this.prisma.organizationMember.create({
        data: {
          userId,
          orgId: invitation.orgId,
          role: invitation.role,
        },
      }),
      this.prisma.invitation.delete({ where: { id: invitation.id } }),
    ]);

    return { orgSlug: invitation.org.slug, orgName: invitation.org.name };
  }
}
