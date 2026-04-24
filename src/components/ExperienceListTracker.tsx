'use client'
import { useEffect, useRef } from 'react'
import { trackViewItemList } from '@/lib/tracking'
import type { Experience } from '@/types/experience'

export function ExperienceListTracker({
  destination,
  count,
  experiences,
}: {
  destination: string
  count: number
  experiences?: Experience[]
}) {
  const fired = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined' || count === 0 || fired.current) return
    fired.current = true

    window.gtag?.('event', 'view_experience_list', {
      destination: destination.toLowerCase().trim(),
      count,
      page_path: window.location.pathname,
    })

    if (experiences && experiences.length > 0) {
      trackViewItemList(experiences, destination)
    }
  }, [destination, count, experiences])

  return null
}
