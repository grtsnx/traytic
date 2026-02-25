export type BillingProvider = 'paystack' | 'polar';
export type PlanTier = 'FREE' | 'PRO' | 'TEAM';
export type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIALING' | 'PAUSED';
export interface Plan {
    id: PlanTier;
    name: string;
    priceUSD: number;
    priceNGN: number;
    features: string[];
    eventLimit: number | null;
    siteLimit: number | null;
    dataRetentionDays: number;
}
export declare const PLAN_LIMITS: Record<PlanTier, Plan>;
//# sourceMappingURL=billing.d.ts.map