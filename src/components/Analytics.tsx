'use client'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export function Analytics() {
  const pathname = usePathname()
  const firedDepths = useRef(new Set<number>())

  useEffect(() => {
    if (typeof window === 'undefined') return
    firedDepths.current.clear()
    window.gtag?.('event', 'page_view', {
      page_path: pathname,
      page_title: document.title,
    })
  }, [pathname])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const thresholds = [25, 50, 75, 100]

    const handleScroll = () => {
      const el = document.documentElement
      const pct = Math.floor(((el.scrollTop + window.innerHeight) / el.scrollHeight) * 100)
      for (const t of thresholds) {
        if (pct >= t && !firedDepths.current.has(t)) {
          firedDepths.current.add(t)
          window.gtag?.('event', 'scroll_depth', { depth: t, page_path: pathname })
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [pathname])

  return null
}
