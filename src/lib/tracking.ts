import type { Experience } from '@/types/experience'

const IS_DEV = process.env.NODE_ENV === 'development'
const PURCHASE_WINDOW_MS = 30 * 60 * 1000

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

export function getCtaVariant(): 'A' | 'B' {
  if (typeof window === 'undefined') return 'A'
  const key = 'vlg_cta_variant'
  const stored = sessionStorage.getItem(key)
  if (stored === 'A' || stored === 'B') return stored
  const variant = Math.random() < 0.5 ? 'A' : 'B'
  sessionStorage.setItem(key, variant)
  return variant
}

function normalizeDestination(destination: string): string {
  return destination.toLowerCase().trim().replace(/\s+/g, '-')
}

function getPositionBucket(position: number): string {
  if (position === 0) return 'top_1'
  if (position < 3) return 'top_3'
  if (position < 6) return 'top_6'
  return 'rest'
}

function getDeviceType(): 'mobile' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop'
  return window.innerWidth < 768 ? 'mobile' : 'desktop'
}

function getTrafficSource(): 'organic' | 'social' | 'direct' {
  if (typeof window === 'undefined') return 'direct'
  const ref = document.referrer
  if (ref.includes('google') || ref.includes('bing') || ref.includes('yahoo')) return 'organic'
  if (ref.includes('facebook') || ref.includes('instagram') || ref.includes('tiktok')) return 'social'
  return 'direct'
}

function lsGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function lsSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // localStorage unavailable (private mode, storage full)
  }
}

export function parsePrice(price: string): number {
  const cleaned = price.replace(/[€$£\s.]/g, '').replace(',', '.').replace(/[^\d.]/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

export function trackAffiliateClick(experience: Experience, position?: number, ctaVariant?: 'A' | 'B'): void {
  if (typeof window === 'undefined') return

  const destination = normalizeDestination(experience.destination)
  const page_path = window.location.pathname
  const debug = IS_DEV ? { debug_mode: true } : {}
  const pos = position ?? 0
  const variant = ctaVariant ?? getCtaVariant()

  const selectContentEvent = {
    experience_slug: experience.slug,
    destination,
    source: experience.affiliateSource,
    position: pos,
    position_bucket: getPositionBucket(pos),
    cta_variant: variant,
    page_path,
    session_id: getSessionId(),
    device_type: getDeviceType(),
    traffic_source: getTrafficSource(),
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

  lsSet('vlg_last_click', JSON.stringify({
    slug: experience.slug,
    price: experience.price,
    destination,
    source: experience.affiliateSource,
    timestamp: Date.now(),
  }))

  if (IS_DEV) {
    console.log('[select_content]', selectContentEvent)
    console.log('[begin_checkout]', { value: parsePrice(experience.price), item: experience.slug })
  }
}

export function trackViewItem(experience: Experience, index: number, ctaVariant: 'A' | 'B'): void {
  if (typeof window === 'undefined') return

  const destination = normalizeDestination(experience.destination)
  const debug = IS_DEV ? { debug_mode: true } : {}

  window.gtag?.('event', 'view_item', {
    item_id: experience.slug,
    item_name: experience.title,
    item_category: destination,
    index,
    cta_variant: ctaVariant,
    ...debug,
  })

  if (IS_DEV) {
    console.log('[view_item]', { item_id: experience.slug, index, cta_variant: ctaVariant })
  }
}

export function checkAndTrackPurchase(): void {
  if (typeof window === 'undefined') return

  const raw = lsGet('vlg_last_click')
  if (!raw) return

  let lastClick: { slug: string; price: string; destination: string; source: string; timestamp: number }
  try {
    lastClick = JSON.parse(raw)
  } catch {
    return
  }

  if (Date.now() - lastClick.timestamp > PURCHASE_WINDOW_MS) return

  // Remove so we don't fire again on next page load
  try { localStorage.removeItem('vlg_last_click') } catch { /* ignore */ }

  const debug = IS_DEV ? { debug_mode: true } : {}
  const purchaseEvent = {
    currency: 'EUR',
    value: parsePrice(lastClick.price),
    item_id: lastClick.slug,
    destination: lastClick.destination,
    source: lastClick.source,
    session_id: getSessionId(),
    device_type: getDeviceType(),
    traffic_source: getTrafficSource(),
    ...debug,
  }

  window.gtag?.('event', 'purchase', purchaseEvent)

  if (IS_DEV) {
    console.log('[purchase]', purchaseEvent)
  }
}
