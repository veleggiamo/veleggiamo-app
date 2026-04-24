import type { Experience } from '@/types/experience'

const IS_DEV = process.env.NODE_ENV === 'development'
const PURCHASE_WINDOW_MS = 30 * 60 * 1000

const CTA_IDS: Record<'A' | 'B', string> = {
  A: 'price_focus',
  B: 'availability_focus',
}

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
  try { return localStorage.getItem(key) } catch { return null }
}

function lsSet(key: string, value: string): void {
  try { localStorage.setItem(key, value) } catch { /* private mode / storage full */ }
}

export function parsePrice(price: string): number {
  const cleaned = price.replace(/[€$£\s.]/g, '').replace(',', '.').replace(/[^\d.]/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

export function getItemPayload(experience: Experience, index: number) {
  return {
    item_id: experience.slug,
    item_name: experience.title,
    item_category: normalizeDestination(experience.destination),
    price: parsePrice(experience.price),
    index,
  }
}

export function trackAffiliateClick(
  experience: Experience,
  position?: number,
  ctaVariant?: 'A' | 'B',
  ctaText?: string,
): void {
  if (typeof window === 'undefined') return

  const destination = normalizeDestination(experience.destination)
  const debug = IS_DEV ? { debug_mode: true } : {}
  const pos = position ?? 0
  const variant = ctaVariant ?? getCtaVariant()
  const item = getItemPayload(experience, pos)

  // Standard GA4 ecommerce event — keep clean
  window.gtag?.('event', 'select_item', {
    item_list_name: destination,
    items: [item],
    ...debug,
  })

  // Custom event — CTA performance + contextual data
  window.gtag?.('event', 'cta_click', {
    items: [item],
    item_list_name: destination,
    index: pos,
    cta_variant: variant,
    cta_id: CTA_IDS[variant],
    cta_text: ctaText ?? '',
    position_bucket: getPositionBucket(pos),
    page_path: window.location.pathname,
    session_id: getSessionId(),
    device_type: getDeviceType(),
    traffic_source: getTrafficSource(),
    ...debug,
  })

  if (item.price > 0) {
    window.gtag?.('event', 'begin_checkout', {
      currency: 'EUR',
      value: item.price,
      items: [item],
      ...debug,
    })
  }

  lsSet('vlg_last_click', JSON.stringify({
    slug: experience.slug,
    price: experience.price,
    title: experience.title,
    destination,
    source: experience.affiliateSource,
    timestamp: Date.now(),
  }))

  if (IS_DEV) {
    console.log('[select_item]', { item_list_name: destination, item: item.item_id })
    console.log('[cta_click]', { cta_id: CTA_IDS[variant], variant, index: pos })
    if (item.price > 0) console.log('[begin_checkout]', { value: item.price, item: item.item_id })
    else console.log('[begin_checkout] SKIPPED — price is 0')
  }
}

export function trackViewItem(
  experience: Experience,
  index: number,
  ctaVariant: 'A' | 'B',
  ctaText?: string,
): void {
  if (typeof window === 'undefined') return

  const destination = normalizeDestination(experience.destination)
  const item = getItemPayload(experience, index)
  const debug = IS_DEV ? { debug_mode: true } : {}

  // Standard GA4 ecommerce — item_list_name matches view_item_list for funnel attribution
  window.gtag?.('event', 'view_item', {
    ...item,
    item_list_name: destination,
    cta_variant: ctaVariant,
    cta_id: CTA_IDS[ctaVariant],
    cta_text: ctaText ?? '',
    ...debug,
  })

  if (IS_DEV) {
    console.log('[view_item]', { item_id: item.item_id, index, item_list_name: destination, cta_id: CTA_IDS[ctaVariant] })
  }
}

export function trackViewItemList(experiences: Experience[], destination: string): void {
  if (typeof window === 'undefined') return

  const dest = normalizeDestination(destination)
  const debug = IS_DEV ? { debug_mode: true } : {}
  const items = experiences.slice(0, 10).map((exp, i) => getItemPayload(exp, i))

  window.gtag?.('event', 'view_item_list', {
    item_list_name: dest,
    items,
    ...debug,
  })

  if (IS_DEV) {
    console.log('[view_item_list]', { item_list_name: dest, count: items.length })
  }
}

export function checkAndTrackPurchase(): void {
  if (typeof window === 'undefined') return

  const raw = lsGet('vlg_last_click')
  if (!raw) return

  let lastClick: { slug: string; price: string; title?: string; destination: string; source: string; timestamp: number }
  try {
    lastClick = JSON.parse(raw)
  } catch {
    return
  }

  if (Date.now() - lastClick.timestamp > PURCHASE_WINDOW_MS) return

  try { localStorage.removeItem('vlg_last_click') } catch { /* ignore */ }

  const value = parsePrice(lastClick.price)
  if (value <= 0) return

  const debug = IS_DEV ? { debug_mode: true } : {}
  const purchaseEvent = {
    currency: 'EUR',
    value,
    items: [{
      item_id: lastClick.slug,
      item_name: lastClick.title ?? lastClick.slug,
      item_category: lastClick.destination,
      price: value,
    }],
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
