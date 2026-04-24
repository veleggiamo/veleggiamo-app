import type { Experience } from '@/types/experience'

const IS_DEV = process.env.NODE_ENV === 'development'

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

function normalizeDestination(destination: string): string {
  return destination.toLowerCase().trim().replace(/\s+/g, '-')
}

export function parsePrice(price: string): number {
  const cleaned = price.replace(/[€$£\s.]/g, '').replace(',', '.').replace(/[^\d.]/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

export function trackAffiliateClick(experience: Experience, position?: number): void {
  if (typeof window === 'undefined') return

  const destination = normalizeDestination(experience.destination)
  const page_path = window.location.pathname
  const debug = IS_DEV ? { debug_mode: true } : {}

  const selectContentEvent = {
    experience_slug: experience.slug,
    destination,
    source: experience.affiliateSource,
    position: position ?? 0,
    page_path,
    session_id: getSessionId(),
    outbound: true,
    ...debug,
  }

  window.gtag?.('event', 'select_content', selectContentEvent)

  window.gtag?.('event', 'begin_checkout', {
    currency: 'EUR',
    value: parsePrice(experience.price),
    items: [{
      item_id: experience.slug,
      item_name: experience.title,
      item_category: destination,
    }],
    ...debug,
  })

  if (IS_DEV) {
    console.log('[select_content]', selectContentEvent)
    console.log('[begin_checkout]', { value: parsePrice(experience.price), item: experience.slug })
  }
}
