'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID

export function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!GA4_ID) return

    const url = pathname + (searchParams?.toString() ? `?${searchParams}` : '')

    window.gtag?.('config', GA4_ID, {
      page_path: url,
    })
  }, [pathname, searchParams])

  return null
}