import type { EventType, VitalName, VitalRating } from './events'

export interface CollectEvent {
  type: EventType
  url: string
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
  durationMs?: number
  // Web Vital fields
  vitalName?: VitalName
  vitalValue?: number
  vitalRating?: VitalRating
  // Custom event fields
  eventName?: string
  meta?: Record<string, string>
  // Error fields
  errorMessage?: string
}

export interface CollectPayload {
  siteId: string
  events: CollectEvent[]
}
