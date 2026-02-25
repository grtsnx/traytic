'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { init, trackPageView } from '../core'
import type { TractycConfig } from '../types'

interface AnalyticsProps extends TractycConfig {}

/**
 * Drop this into your Next.js root layout. That's it.
 *
 * Set NEXT_PUBLIC_TRAYTIC_SITE_ID and (optionally)
 * NEXT_PUBLIC_TRAYTIC_ENDPOINT in your .env.local — no props needed.
 *
 * @example
 * // app/layout.tsx
 * import { Analytics } from '@traytic/analytics/next'
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html lang="en">
 *       <body>
 *         {children}
 *         <Analytics />
 *       </body>
 *     </html>
 *   )
 * }
 */
export function Analytics(props: AnalyticsProps = {}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    init(props)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams}` : '')
    trackPageView(url)
  }, [pathname, searchParams])

  return null
}
