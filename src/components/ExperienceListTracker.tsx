'use client'
import { useEffect } from 'react'

export function ExperienceListTracker({ destination, count }: { destination: string; count: number }) {
  useEffect(() => {
    if (typeof window === 'undefined' || count === 0) return
    window.gtag?.('event', 'view_experience_list', { destination, count })
  }, [destination, count])
  return null
}
