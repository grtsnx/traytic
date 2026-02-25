import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  RawBody,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BillingService, PLANS } from './billing.service';

@Controller('billing')
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Get('plans')
  getPlans() {
    return PLANS;
  }

  @Post('checkout')
  createCheckout(
    @Body()
    body: {
      email: string;
      orgId: string;
      plan: 'pro' | 'team';
      countryCode: string;
    },
  ) {
    const provider = this.billing.getProvider(body.countryCode);
    return provider === 'paystack'
      ? this.billing.createPaystackCheckout(body)
      : this.billing.createPolarCheckout(body);
  }

  @Get(':orgId/subscription')
  getSubscription(@Param('orgId') orgId: string) {
    return this.billing.getSubscription(orgId);
  }

  // ─── Webhooks ─────────────────────────────────────────────────────────────

  @Post('webhooks/paystack')
  @HttpCode(HttpStatus.OK)
  paystackWebhook(
    @RawBody() payload: Buffer,
    @Headers('x-paystack-signature') signature: string,
  ) {
    return this.billing.handlePaystackWebhook(payload.toString(), signature);
  }

  @Post('webhooks/polar')
  @HttpCode(HttpStatus.OK)
  polarWebhook(
    @RawBody() payload: Buffer,
    @Headers('webhook-signature') signature: string,
  ) {
    return this.billing.handlePolarWebhook(payload.toString(), signature);
  }
}
