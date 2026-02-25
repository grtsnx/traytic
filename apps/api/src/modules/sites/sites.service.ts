import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../databases/prisma/prisma.service';
import { OrganizationRole, PlanTier } from '../../generated/prisma/client';
import { PLAN_LIMITS } from '@traytic/types';

const ALPHA_NUM = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateId(prefix: string, length = 12): string {
  const charsetLength = ALPHA_NUM.length;
  const maxUnbiased = Math.floor(256 / charsetLength) * charsetLength;

  let id = prefix;
  while (id.length < prefix.length + length) {
    const bytes = randomBytes(length);
    for (let i = 0; i < bytes.length && id.length < prefix.length + length; i++) {
      const byte = bytes[i];
      if (byte >= maxUnbiased) {
        continue;
      }
      const index = byte % charsetLength;
      id += ALPHA_NUM[index];
    }
  }
  return id;
}

@Injectable()
export class SitesService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── User-scoped methods (authenticated controllers) ──────────────────────

  /** All sites across every org the user belongs to */
  async findByUserId(userId: string) {
    const memberships = await this.prisma.organizationMember.findMany({
      where: { userId },
      select: { orgId: true },
    });
    const orgIds = memberships.map((m) => m.orgId);
    if (!orgIds.length) return [];
    return this.prisma.site.findMany({
      where: { orgId: { in: orgIds } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Get the user's first org, or create a personal one if they have none */
  private async getOrCreateOrgForUser(userId: string): Promise<string> {
    const membership = await this.prisma.organizationMember.findFirst({
      where: { userId },
    });
    if (membership) return membership.orgId;

    const org = await this.prisma.organization.create({
      data: {
        name: 'Personal',
        slug: `org-${userId.slice(0, 8)}-${Date.now()}`,
        members: {
          create: { userId, role: OrganizationRole.OWNER },
        },
      },
    });
    return org.id;
  }

  /** Create a site for the user, enforcing the plan's site limit */
  async createForUser(
    userId: string,
    data: { name: string; domain: string; timezone?: string },
  ) {
    const orgId = await this.getOrCreateOrgForUser(userId);

    const [siteCount, subscription] = await Promise.all([
      this.prisma.site.count({ where: { orgId } }),
      this.prisma.subscription.findUnique({ where: { orgId } }),
    ]);

    const plan = (subscription?.plan ?? PlanTier.FREE) as keyof typeof PLAN_LIMITS;
    const limit = PLAN_LIMITS[plan].siteLimit;

    if (limit !== null && siteCount >= limit) {
      throw new ForbiddenException(
        `Your ${plan} plan allows ${limit} site${limit === 1 ? '' : 's'}. Upgrade to add more.`,
      );
    }

    return this.prisma.site.create({
      data: {
        id: generateId('site_'),
        apiKey: generateId('key_', 24),
        ...data,
        orgId,
      },
    });
  }

  async updateForUser(
    id: string,
    userId: string,
    data: { name?: string; domain?: string; public?: boolean },
  ) {
    await this.assertUserOwnsSite(id, userId);
    return this.prisma.site.update({ where: { id }, data });
  }

  async deleteForUser(id: string, userId: string) {
    await this.assertUserOwnsSite(id, userId);
    return this.prisma.site.delete({ where: { id } });
  }

  async rotateApiKeyForUser(id: string, userId: string) {
    await this.assertUserOwnsSite(id, userId);
    const apiKey = generateId('key_', 24);
    return this.prisma.site.update({ where: { id }, data: { apiKey } });
  }

  /** Returns true if the user is a member of the org that owns the site */
  async userOwnsSite(userId: string, siteId: string): Promise<boolean> {
    const site = await this.prisma.site.findFirst({
      where: { id: siteId, org: { members: { some: { userId } } } },
    });
    return !!site;
  }

  private async assertUserOwnsSite(siteId: string, userId: string) {
    if (!(await this.userOwnsSite(userId, siteId)))
      throw new NotFoundException('Site not found');
  }

  // ─── Internal / legacy helpers ─────────────────────────────────────────────

  async findByOrg(orgId: string) {
    return this.prisma.site.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByApiKey(apiKey: string) {
    return this.prisma.site.findUnique({ where: { apiKey } });
  }

  async findByDomain(domain: string) {
    const normalized = domain.replace(/^www\./, '').toLowerCase();
    return this.prisma.site.findFirst({
      where: { domain: normalized },
    });
  }
}
