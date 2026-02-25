import type { EventType, VitalName, VitalRating } from './events';
export interface CollectEvent {
    type: EventType;
    url: string;
    referrer?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    utmTerm?: string;
    durationMs?: number;
    vitalName?: VitalName;
    vitalValue?: number;
    vitalRating?: VitalRating;
    eventName?: string;
    meta?: Record<string, string>;
    errorMessage?: string;
}
export interface CollectPayload {
    siteId: string;
    events: CollectEvent[];
}
//# sourceMappingURL=collect.d.ts.map