import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../databases/prisma/prisma.service';

@Injectable()
export class SitesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByOrg(orgId: string) {
    return this.prisma.site.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByApiKey(apiKey: string) {
    return this.prisma.site.findUnique({ where: { apiKey } });
  }

  async create(orgId: string, data: { name: string; domain: string; timezone?: string }) {
    return this.prisma.site.create({
      data: { ...data, orgId },
    });
  }

  async update(id: string, orgId: string, data: { name?: string; domain?: string; public?: boolean }) {
    const site = await this.prisma.site.findFirst({ where: { id, orgId } });
    if (!site) throw new NotFoundException('Site not found');
    return this.prisma.site.update({ where: { id }, data });
  }

  async delete(id: string, orgId: string) {
    const site = await this.prisma.site.findFirst({ where: { id, orgId } });
    if (!site) throw new NotFoundException('Site not found');
    return this.prisma.site.delete({ where: { id } });
  }

  async rotateApiKey(id: string, orgId: string) {
    const site = await this.prisma.site.findFirst({ where: { id, orgId } });
    if (!site) throw new NotFoundException('Site not found');
    // Generate new random API key
    const apiKey = crypto.randomUUID().replace(/-/g, '');
    return this.prisma.site.update({ where: { id }, data: { apiKey } });
  }
}
