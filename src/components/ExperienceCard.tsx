'use client'
import { useEffect, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { trackAffiliateClick, trackViewItem, getCtaVariant } from '@/lib/tracking'
import type { Experience } from '@/types/experience'

const SOURCE_LABEL: Record<Experience['affiliateSource'], string> = {
  viator: 'Viator',
  getyourguide: 'GetYourGuide',
  direct: 'operatore verificato',
}

export const CTA_LABELS: Record<'A' | 'B', string> = {
  A: 'Vedi disponibilità e prezzo',
  B: 'Controlla posti disponibili',
}

function getBadge(experience: Experience): string | undefined {
  if (experience.rating >= 4.7 && experience.reviewCount > 1000) return '🏆 Top scelta'
  return experience.badge
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.min(Math.round(rating), 5)
  return (
    <span className="text-amber-400 tracking-tight">
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
    </span>
  )
}

export function ExperienceCard({
  experience,
  index,
  onVisible,
}: {
  experience: Experience
  index?: number
  onVisible?: () => void
}) {
  const [variant, setVariant] = useState<'A' | 'B'>('A')
  const variantRef = useRef<'A' | 'B'>('A')
  const cardRef = useRef<HTMLDivElement>(null)
  const viewFired = useRef(false)

  useEffect(() => {
    const v = getCtaVariant()
    setVariant(v)
    variantRef.current = v
  }, [])

  useEffect(() => {
    const el = cardRef.current
    if (!el) return

    if (!('IntersectionObserver' in window)) {
      if (!viewFired.current) {
        viewFired.current = true
        trackViewItem(experience, index ?? 0, variantRef.current, CTA_LABELS[variantRef.current])
        onVisible?.()
      }
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !viewFired.current) {
          viewFired.current = true
          trackViewItem(experience, index ?? 0, variantRef.current, CTA_LABELS[variantRef.current])
          onVisible?.()
          observer.disconnect()
        }
      },
      { threshold: 0.25 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [experience, index, onVisible])

  const ctaText = CTA_LABELS[variant]
  const track = () => trackAffiliateClick(experience, index, variant, ctaText)
  const badge = getBadge(experience)

  return (
    <div
      ref={cardRef}
      className="group flex flex-col rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300"
    >
      {/* IMAGE */}
      <div className="relative aspect-video bg-sky-100 shrink-0 overflow-hidden">
        {experience.image && (
          <img
            src={experience.image}
            alt={experience.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading={index === 0 ? 'eager' : 'lazy'}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
        )}
        {badge && (
          <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
            {badge}
          </span>
        )}
        {experience.originalPrice && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            Offerta
          </span>
        )}
      </div>

      {/* CONTENT */}
      <div className="flex flex-col flex-1 p-4 gap-3">

        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
          {experience.title}
        </h3>

        {/* RATING */}
        <div className="flex items-center gap-1.5">
          <StarRating rating={experience.rating} />
          <span className="text-sm font-semibold text-gray-800">{experience.rating}</span>
          <span className="text-xs text-gray-400">
            ({experience.reviewCount.toLocaleString('it-IT')} su {SOURCE_LABEL[experience.affiliateSource]})
          </span>
        </div>

        {/* META */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>⏱ {experience.duration}</span>
          {experience.location && <span>📍 {experience.location}</span>}
        </div>

        {/* PRICE + CTA */}
        <div className="mt-auto pt-2 space-y-2">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">da</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-sky-700">{experience.price}</span>
                {experience.originalPrice && (
                  <span className="text-xs text-gray-400 line-through">{experience.originalPrice}</span>
                )}
              </div>
            </div>
            <Badge variant="outline" className="text-xs text-green-600 border-green-200 bg-green-50">
              ✓ Cancellazione gratuita
            </Badge>
          </div>

          <a
            href={experience.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            onMouseDown={track}
            onClick={track}
            className="block"
          >
            <Button className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold h-10">
              {ctaText}
            </Button>
          </a>

          <p className="text-xs text-gray-400 text-center">
            Prenotazione sicura su {SOURCE_LABEL[experience.affiliateSource]}
          </p>
        </div>
      </div>
    </div>
  )
}
