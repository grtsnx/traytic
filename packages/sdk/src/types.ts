export interface TractycConfig {
  /** Your site ID from the Traytic dashboard */
  siteId: string
  /** API endpoint. Defaults to https://api.traytic.com/collect */
  endpoint?: string
  /** Respect Do Not Track browser setting. Default: true */
  respectDnt?: boolean
  /** Hash dynamic path segments e.g. /users/123 → /users/[id] */
  hashPaths?: boolean
  /** Disable tracking entirely */
  disabled?: boolean
}

export interface TrackOptions {
  /** Custom event properties */
  props?: Record<string, string>
}
