import { Injectable } from '@nestjs/common';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaService } from '../../databases/prisma/prisma.service';

@Injectable()
export class AuthService {
  readonly auth: ReturnType<typeof betterAuth>;

  constructor(private readonly prisma: PrismaService) {
    this.auth = betterAuth({
      database: prismaAdapter(this.prisma, {
        provider: 'postgresql',
      }),
      secret: process.env.BETTER_AUTH_SECRET,
      baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3001',
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
      },
      trustedOrigins: [process.env.APP_URL ?? 'http://localhost:3000'],
    });
  }
}
