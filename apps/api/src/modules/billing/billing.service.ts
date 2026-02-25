import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { createHmac } from 'crypto';
import { PrismaService } from '../../databases/prisma/prisma.service';
import { BillingProvider, PlanTier, SubscriptionStatus } from '../../generated/prisma/client';

// ─── Plan definitions ─────────────────────────────────────────────────────────

export const PLANS = {
  pro: {
    name: 'Pro',
    paystack: { planCode: process.env.PAYSTACK_PRO_PLAN_CODE ?? '' },
    polar: { productId: process.env.POLAR_PRO_PRODUCT_ID ?? '' },
    priceNGN: 14900,   // ₦14,900/mo
    priceUSD: 9,       // $9/mo
  },
  team: {
    name: 'Team',
    paystack: { planCode: process.env.PAYSTACK_TEAM_PLAN_CODE ?? '' },
    polar: { productId: process.env.POLAR_TEAM_PRODUCT_ID ?? '' },
    priceNGN: 44900,   // ₦44,900/mo
    priceUSD: 29,      // $29/mo
  },
} as const;

// Countries served by Paystack
const PAYSTACK_COUNTRIES = new Set(['NG', 'GH', 'KE', 'ZA', 'RW', 'TZ', 'UG', 'CI', 'EG']);

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(private readonly prisma: PrismaService) {}

  getProvider(countryCode: string): 'paystack' | 'polar' {
    return PAYSTACK_COUNTRIES.has(countryCode.toUpperCase())
      ? 'paystack'
      : 'polar';
  }

  // ─── Paystack ──────────────────────────────────────────────────────────────

  async createPaystackCheckout(params: {
    email: string;
    orgId: string;
    plan: keyof typeof PLANS;
    currency?: string;
  }) {
    const { email, orgId, plan, currency = 'NGN' } = params;
    const planDef = PLANS[plan];

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: planDef.priceNGN * 100, // kobo
        plan: planDef.paystack.planCode,
        currency,
        metadata: { orgId, plan },
        callback_url: `${process.env.APP_URL}/billing/success`,
      }),
    });

    const data = await res.json() as { status: boolean; data: { authorization_url: string } };
    if (!data.status) throw new BadRequestException('Paystack checkout failed');
    return { url: data.data.authorization_url, provider: 'paystack' };
  }

  async handlePaystackWebhook(payload: string, signature: string) {
    const expected = createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET ?? '')
      .update(payload)
      .digest('hex');

    if (expected !== signature) {
      throw new BadRequestException('Invalid Paystack webhook signature');
    }

    const event = JSON.parse(payload) as {
      event: string;
      data: Record<string, unknown>;
    };

    this.logger.log(`Paystack webhook: ${event.event}`);

    switch (event.event) {
      case 'subscription.create':
      case 'charge.success':
        await this.upsertSubscription({
          orgId: (event.data.metadata as Record<string, string>)?.orgId,
          provider: BillingProvider.PAYSTACK,
          providerId: event.data.subscription_code as string ?? event.data.id as string,
          status: SubscriptionStatus.ACTIVE,
          plan: ((event.data.metadata as Record<string, string>)?.plan ?? 'pro').toUpperCase() as PlanTier,
          currency: event.data.currency as string ?? 'NGN',
          amount: event.data.amount as number ?? 0,
        });
        break;

      case 'subscription.disable':
        await this.cancelByProviderId(event.data.subscription_code as string);
        break;
    }
  }

  // ─── Polar ─────────────────────────────────────────────────────────────────

  async createPolarCheckout(params: {
    email: string;
    orgId: string;
    plan: keyof typeof PLANS;
  }) {
    const { email, orgId, plan } = params;
    const planDef = PLANS[plan];

    const res = await fetch('https://api.polar.sh/v1/checkouts/custom', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.POLAR_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: planDef.polar.productId,
        customer_email: email,
        metadata: { orgId, plan },
        success_url: `${process.env.APP_URL}/billing/success`,
      }),
    });

    const data = await res.json() as { url: string };
    return { url: data.url, provider: 'polar' };
  }

  async handlePolarWebhook(payload: string, signature: string) {
    const expected = createHmac('sha256', process.env.POLAR_WEBHOOK_SECRET ?? '')
      .update(payload)
      .digest('hex');

    if (`sha256=${expected}` !== signature) {
      throw new BadRequestException('Invalid Polar webhook signature');
    }

    const event = JSON.parse(payload) as {
      type: string;
      data: Record<string, unknown>;
    };

    this.logger.log(`Polar webhook: ${event.type}`);

    const meta = event.data.metadata as Record<string, string> | undefined;

    switch (event.type) {
      case 'subscription.created':
      case 'subscription.updated':
        if (meta?.orgId) {
          await this.upsertSubscription({
            orgId: meta.orgId,
            provider: BillingProvider.POLAR,
            providerId: event.data.id as string,
            status: event.data.status === 'active'
              ? SubscriptionStatus.ACTIVE
              : SubscriptionStatus.CANCELED,
            plan: (meta.plan ?? 'pro').toUpperCase() as PlanTier,
            currency: 'USD',
            amount: (event.data.amount as number) ?? 0,
          });
        }
        break;

      case 'subscription.canceled':
        await this.cancelByProviderId(event.data.id as string);
        break;
    }
  }

  // ─── Shared helpers ────────────────────────────────────────────────────────

  private async upsertSubscription(data: {
    orgId: string;
    provider: BillingProvider;
    providerId: string;
    status: SubscriptionStatus;
    plan: PlanTier;
    currency: string;
    amount: number;
  }) {
    return this.prisma.subscription.upsert({
      where: { orgId: data.orgId },
      create: data,
      update: data,
    });
  }

  private async cancelByProviderId(providerId: string) {
    await this.prisma.subscription.updateMany({
      where: { providerId },
      data: { status: SubscriptionStatus.CANCELED },
    });
  }

  async getSubscription(orgId: string) {
    return this.prisma.subscription.findUnique({ where: { orgId } });
  }
}
