import { Injectable } from '@nestjs/common';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { createTransport, type Transporter } from 'nodemailer';
import { PrismaService } from '../../databases/prisma/prisma.service';

let _transport: Transporter | null = null;
function getTransport(): Transporter | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!_transport) {
    _transport = createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: { user: 'resend', pass: apiKey },
      pool: true,
      maxConnections: 3,
    });
  }
  return _transport;
}

function sendPasswordResetEmail(to: string, resetUrl: string) {
  const transport = getTransport();
  if (!transport) return;

  const from = `Traytic <noreply@${process.env.EMAIL_FROM_DOMAIN ?? 'traytic.dev'}>`;
  transport
    .sendMail({
      from,
      to,
      subject: 'Reset your Traytic password',
      html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#ffffff;color:#111;border:1px solid #e5e5e5;border-radius:12px">
        <div style="margin-bottom:24px">
          <span style="font-size:18px;font-weight:700;letter-spacing:-0.03em;color:#111">Traytic</span>
        </div>
        <h2 style="margin:0 0 12px;font-size:22px;font-weight:800;letter-spacing:-0.03em;color:#111">Reset your password</h2>
        <p style="color:#555;margin:0 0 28px;font-size:14px;line-height:1.6">
          Click the button below to reset your Traytic password. This link expires in 1 hour.
        </p>
        <a href="${resetUrl}"
           style="display:inline-block;background:#111;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
          Reset password
        </a>
        <p style="color:#999;font-size:12px;margin:28px 0 0">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
    })
    .catch((err) => console.error('[email] password reset failed:', err));
}

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
        sendResetPassword: ({ user, url }) => {
          sendPasswordResetEmail(user.email, url);
        },
      },
      socialProviders: buildSocialProviders(),
      trustedOrigins: [process.env.APP_URL ?? 'http://localhost:3000'],
    });
  }
}
