import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals'
import type { TractycConfig, TrackOptions } from './types'

let config: Required<TractycConfig> | null = null
let initialized = false

export function init(userConfig: TractycConfig) {
  if (initialized) return
  initialized = true

  config = {
    siteId: userConfig.siteId,
    endpoint: userConfig.endpoint ?? 'https://api.traytic.com/collect',
    respectDnt: userConfig.respectDnt ?? true,
    hashPaths: userConfig.hashPaths ?? false,
    disabled: userConfig.disabled ?? false,
  }

  if (config.disabled) return
  if (config.respectDnt && navigator.doNotTrack === '1') return

  // Track initial page view
  sendPageView()

  // Patch history API for SPA navigation
  patchHistory()

  // Capture Web Vitals
  captureVitals()
}

export function track(eventName: string, options?: TrackOptions) {
  if (!config || config.disabled) return
  sendEvent({
    type: 'custom',
    url: location.href,
    event_name: eventName,
    meta: options?.props,
  })
}

export function trackPageView(url?: string) {
  sendPageView(url)
}

// ─── Internal ──────────────────────────────────────────────────────────────

function sendPageView(url?: string) {
  const href = url ?? location.href
  const utms = parseUTMs()

  sendEvent({
    type: 'pageview',
    url: href,
    referrer: document.referrer,
    ...utms,
  })
}

function sendEvent(payload: Record<string, unknown>) {
  if (!config) return

  const body = JSON.stringify({
    siteId: config.siteId,
    events: [payload],
  })

  // sendBeacon is non-blocking and works even when page is unloading
  if (navigator.sendBeacon) {
    navigator.sendBeacon(config.endpoint, body)
  } else {
    fetch(config.endpoint, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(() => {})
  }
}

function captureVitals() {
  const reportVital = (metric: Metric) => {
    sendEvent({
      type: 'vital',
      url: location.href,
      vital_name: metric.name,
      vital_value: metric.value,
      vital_rating: metric.rating,
    })
  }

  onLCP(reportVital)
  onCLS(reportVital)
  onINP(reportVital)
  onTTFB(reportVital)
  onFCP(reportVital)
}

function patchHistory() {
  const push = history.pushState.bind(history)
  const replace = history.replaceState.bind(history)

  history.pushState = (...args: Parameters<typeof history.pushState>) => {
    push(...args)
    sendPageView()
  }

  history.replaceState = (...args: Parameters<typeof history.replaceState>) => {
    replace(...args)
  }

  window.addEventListener('popstate', () => sendPageView())
}

function parseUTMs() {
  const params = new URLSearchParams(location.search)
  return {
    utm_source: params.get('utm_source') ?? undefined,
    utm_medium: params.get('utm_medium') ?? undefined,
    utm_campaign: params.get('utm_campaign') ?? undefined,
    utm_content: params.get('utm_content') ?? undefined,
    utm_term: params.get('utm_term') ?? undefined,
  }
}
