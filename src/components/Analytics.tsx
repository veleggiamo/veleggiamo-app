'use client'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { checkAndTrackPurchase } from '@/lib/tracking'

const IS_DEV = process.env.NODE_ENV === 'development'

export function Analytics() {
  const pathname = usePathname()
  const firedDepths = useRef(new Set<number>())
  const purchaseChecked = useRef(false)

  useEffect(() => {
    if (!purchaseChecked.current) {
      purchaseChecked.current = true
      checkAndTrackPurchase()
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    firedDepths.current.clear()
    const debug = IS_DEV ? { debug_mode: true } : {}
    window.gtag?.('event', 'page_view', {
      page_path: pathname,
      page_title: document.title,
      ...debug,
    })

    const timer = setTimeout(() => {
      window.gtag?.('event', 'engaged_user', {
        page_path: pathname,
        time_on_page: 15,
        ...debug,
      })
    }, 15000)

    return () => clearTimeout(timer)
  }, [pathname])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const thresholds = [25, 50, 75, 100]
    const debug = IS_DEV ? { debug_mode: true } : {}

    const handleScroll = () => {
      const el = document.documentElement
      const pct = Math.floor(((el.scrollTop + window.innerHeight) / el.scrollHeight) * 100)
      for (const t of thresholds) {
        if (pct >= t && !firedDepths.current.has(t)) {
          firedDepths.current.add(t)
          window.gtag?.('event', 'scroll_depth', {
            depth: t,
            engagement_score: t / 100,
            page_path: pathname,
            ...debug,
          })
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [pathname])

  return null
}
