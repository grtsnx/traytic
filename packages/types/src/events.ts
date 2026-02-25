export type EventType = 'pageview' | 'custom' | 'vital' | 'error'

export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'unknown'

export type VitalName = 'LCP' | 'CLS' | 'INP' | 'FID' | 'TTFB' | 'FCP'

export type VitalRating = 'good' | 'needs-improvement' | 'poor'

export interface AnalyticsEvent {
  siteId: string
  type: EventType
  url: string
  path: string
  hostname: string
  referrer: string
  referrerSource: string
  utmSource: string
  utmMedium: string
  utmCampaign: string
  utmContent: string
  utmTerm: string
  country: string
  region: string
  city: string
  browser: string
  browserVersion: string
  os: string
  osVersion: string
  deviceType: DeviceType
  visitorId: string
  sessionId: string
  durationMs: number
  isBounce: boolean
  isNew: boolean
  vitalName?: VitalName
  vitalValue?: number
  vitalRating?: VitalRating
  eventName?: string
  meta?: Record<string, string>
  errorMessage?: string
  ts: Date
}

// Dashboard query results
export interface OverviewStats {
  visitors: number
  pageviews: number
  avgDurationMs: number
  bounceRate: number
}

export interface TimeSeriesPoint {
  date: string
  visitors: number
  pageviews: number
}

export interface TopPage {
  path: string
  pageviews: number
  visitors: number
}

export interface TopSource {
  source: string
  visitors: number
}

export interface CountryStat {
  country: string
  visitors: number
}

export interface DeviceStat {
  deviceType: DeviceType
  visitors: number
}

export interface WebVitalStat {
  vitalName: VitalName
  p75: number
  p95: number
  goodPct: number
}
