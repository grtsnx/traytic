'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { init, trackPageView } from '../core'
import type { TractycConfig } from '../types'

interface AnalyticsProps extends TractycConfig {}

/**
 * Drop this into your Next.js root layout. That's it.
 *
 * @example
 * // app/layout.tsx
 * import { Analytics } from '@traytic/analytics/next'
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <Analytics siteId="your_site_id" />
 *       </body>
 *     </html>
 *   )
 * }
 */
export function Analytics(props: AnalyticsProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Initialize once
  useEffect(() => {
    init(props)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Track route changes (App Router)
  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams}` : '')
    trackPageView(url)
  }, [pathname, searchParams])

  return null
}
