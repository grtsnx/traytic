export type BillingProvider = 'paystack' | 'polar'

export type PlanTier = 'FREE' | 'PRO' | 'TEAM'

export type SubscriptionStatus =
  | 'ACTIVE'
  | 'CANCELED'
  | 'PAST_DUE'
  | 'TRIALING'
  | 'PAUSED'

export interface Plan {
  id: PlanTier
  name: string
  priceUSD: number
  priceNGN: number
  features: string[]
  eventLimit: number | null // null = unlimited
  dataRetentionDays: number
}

export const PLAN_LIMITS: Record<PlanTier, Plan> = {
  FREE: {
    id: 'FREE',
    name: 'Free',
    priceUSD: 0,
    priceNGN: 0,
    features: ['10,000 events/mo', '6-month data retention', '3 sites'],
    eventLimit: 10_000,
    dataRetentionDays: 180,
  },
  PRO: {
    id: 'PRO',
    name: 'Pro',
    priceUSD: 9,
    priceNGN: 14900,
    features: [
      'Unlimited events',
      '2-year data retention',
      'Unlimited sites',
      'Custom events',
      'Email alerts',
    ],
    eventLimit: null,
    dataRetentionDays: 730,
  },
  TEAM: {
    id: 'TEAM',
    name: 'Team',
    priceUSD: 29,
    priceNGN: 44900,
    features: [
      'Everything in Pro',
      'Team members',
      'Slack alerts',
      'Funnels & goals',
      'API access',
      'Priority support',
    ],
    eventLimit: null,
    dataRetentionDays: 730,
  },
}
