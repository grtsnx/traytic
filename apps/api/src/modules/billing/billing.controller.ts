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
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { BillingService, PLANS } from './billing.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser, AuthUser } from '../../common/decorators/session.decorator';

@Controller('billing')
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  // Public — no auth required
  @Get('plans')
  getPlans() {
    return PLANS;
  }

  // ─── Authenticated endpoints ───────────────────────────────────────────────

  @Post('checkout')
  @UseGuards(AuthGuard)
  async createCheckout(
    @CurrentUser() user: AuthUser,
    @Body() body: { plan: 'pro' | 'team'; countryCode: string },
  ) {
    const orgId = await this.billing.getOrgIdForUser(user.id);
    if (!orgId)
      throw new BadRequestException('Create a site first to start a subscription.');

    const provider = this.billing.getProvider(body.countryCode);
    const params = { email: user.email, orgId, plan: body.plan };
    return provider === 'paystack'
      ? this.billing.createPaystackCheckout(params)
      : this.billing.createPolarCheckout(params);
  }

  @Get('subscription')
  @UseGuards(AuthGuard)
  async getMySubscription(@CurrentUser() user: AuthUser) {
    const orgId = await this.billing.getOrgIdForUser(user.id);
    if (!orgId) return null;
    return this.billing.getSubscription(orgId);
  }

  // ─── Webhooks (no auth — verified by signature) ───────────────────────────

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
