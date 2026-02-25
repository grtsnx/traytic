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
 * Set NEXT_PUBLIC_TRAYTIC_SITE_ID and (optionally)
 * NEXT_PUBLIC_TRAYTIC_ENDPOINT in your env — or pass as props.
 *
 * @example
 * import { Analytics } from '@traytic/analytics/react'
 * import { useLocation } from 'react-router-dom'
 *
 * function App() {
 *   const { pathname } = useLocation()
 *   return (
 *     <>
 *       <Analytics path={pathname} />
 *       <Router />
 *     </>
 *   )
 * }
 */
export function Analytics({ path, ...config }: AnalyticsProps = {}) {
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
