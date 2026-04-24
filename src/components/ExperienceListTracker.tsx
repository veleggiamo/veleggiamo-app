'use client'
import { useEffect, useRef } from 'react'

export function ExperienceListTracker({ destination, count }: { destination: string; count: number }) {
  const fired = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined' || count === 0 || fired.current) return
    fired.current = true
    window.gtag?.('event', 'view_experience_list', {
      destination: destination.toLowerCase().trim(),
      count,
      page_path: window.location.pathname,
    })
  }, [destination, count])

  return null
}
