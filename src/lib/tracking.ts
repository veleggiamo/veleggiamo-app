import type { Experience } from '@/types/experience'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export function trackAffiliateClick(experience: Experience, position?: number): void {
  if (typeof window !== 'undefined') {
    window.gtag?.('event', 'click_experience', {
      experience_slug: experience.slug,
      destination: experience.destination,
      source: experience.affiliateSource,
      position: position ?? -1,
    })
  }
  if (process.env.NODE_ENV === 'development') {
    console.log('[affiliate_click]', experience.slug, experience.affiliateSource, `pos:${position ?? '?'}`)
  }
}
