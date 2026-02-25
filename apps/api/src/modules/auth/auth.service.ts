import { Injectable } from '@nestjs/common';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaService } from '../../databases/prisma/prisma.service';

function buildSocialProviders() {
  const providers: Record<string, { clientId: string; clientSecret: string }> =
    {};

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    providers.github = {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    };
  }

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.google = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    };
  }

  return providers;
}

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
      socialProviders: buildSocialProviders(),
      trustedOrigins: [process.env.APP_URL ?? 'http://localhost:3000'],
    });
  }
}
