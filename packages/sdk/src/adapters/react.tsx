'use client'

import { useEffect, useRef } from 'react'
import { init, trackPageView } from '../core'
import type { TractycConfig } from '../types'

interface AnalyticsProps extends TractycConfig {
  /** Pass current pathname from your router to track SPA navigation */
  path?: string
}

/**
 * React SPA adapter. Works with React Router, TanStack Router, etc.
 *
 * @example
 * // App.tsx
 * import { Analytics } from '@traytic/analytics/react'
 * import { useLocation } from 'react-router-dom'
 *
 * function App() {
 *   const { pathname } = useLocation()
 *   return (
 *     <>
 *       <Analytics siteId="your_site_id" path={pathname} />
 *       <Router />
 *     </>
 *   )
 * }
 */
export function Analytics({ path, ...config }: AnalyticsProps) {
  const isFirstRender = useRef(true)

  useEffect(() => {
    init(config)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (path) trackPageView(window.location.origin + path)
  }, [path])

  return null
}
