import type { Experience } from '@/types/experience'

export function trackAffiliateClick(experience: Experience): void {
  console.log('[affiliate_click]', experience.slug, experience.affiliateSource)
  // Phase 2: replace with Plausible/GA4/Supabase event
}
