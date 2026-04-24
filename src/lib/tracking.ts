import type { Experience } from '@/types/experience'

function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr'
  const key = 'vlg_sid'
  let sid = sessionStorage.getItem(key)
  if (!sid) {
    sid = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36)
    sessionStorage.setItem(key, sid)
  }
  return sid
}

export function trackAffiliateClick(experience: Experience, position?: number): void {
  const event = {
    experience_slug: experience.slug,
    destination: experience.destination,
    source: experience.affiliateSource,
    position: position ?? 0,
    session_id: getSessionId(),
  }

  if (typeof window !== 'undefined') {
    window.gtag?.('event', 'click_experience', event)
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[affiliate_click]', event)
  }
}
