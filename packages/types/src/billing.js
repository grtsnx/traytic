"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLAN_LIMITS = void 0;
exports.PLAN_LIMITS = {
    FREE: {
        id: 'FREE',
        name: 'Free',
        priceUSD: 0,
        priceNGN: 0,
        features: ['1 site', '50,000 events/mo', '6-month data retention', 'Real-time dashboard', 'Community support'],
        eventLimit: 50_000,
        siteLimit: 1,
        dataRetentionDays: 180,
    },
    PRO: {
        id: 'PRO',
        name: 'Pro',
        priceUSD: 5,
        priceNGN: 7900,
        features: [
            'Up to 10 sites',
            '1M events/mo',
            '1-year data retention',
            'Everything in Free',
            'Email & Slack alerts',
            'Priority support',
        ],
        eventLimit: 1_000_000,
        siteLimit: 10,
        dataRetentionDays: 365,
    },
    TEAM: {
        id: 'TEAM',
        name: 'Team',
        priceUSD: 19,
        priceNGN: 29900,
        features: [
            'Unlimited sites',
            '10M events/mo',
            'Everything in Pro',
            'Unlimited team seats',
            'Custom goals & funnels',
            'Dedicated support',
        ],
        eventLimit: 10_000_000,
        siteLimit: null,
        dataRetentionDays: 730,
    },
};
//# sourceMappingURL=billing.js.map