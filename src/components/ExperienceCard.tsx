'use client'
import { useEffect, useRef, useState } from 'react'
import { trackAffiliateClick, trackViewItem, getCtaVariant } from '@/lib/tracking'
import type { Experience } from '@/types/experience'

const SOURCE_LABEL: Record<Experience['affiliateSource'], string> = {
  viator: 'Viator',
  getyourguide: 'GetYourGuide',
  direct: 'operatore verificato',
}

export const CTA_LABELS: Record<'A' | 'B', string> = {
  A: 'Controlla disponibilità',
  B: 'Verifica posti disponibili',
}

function getBadge(experience: Experience): string | undefined {
  if (experience.rating >= 4.7 && experience.reviewCount > 1000) return '🏆 Top scelta'
  return experience.badge
}

function getTrustLine(reviewCount: number): string {
  const rounded = Math.floor(reviewCount / 100) * 100
  return `Prenotato ${rounded.toLocaleString('it-IT')}+ volte`
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
  const isHighDemand = experience.rating > 4.6

  return (
    <div
      ref={cardRef}
      className="group flex flex-col rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
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
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

        {badge && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
            {badge}
          </span>
        )}
        {experience.originalPrice && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
            Offerta
          </span>
        )}
      </div>

      {/* CONTENT */}
      <div className="flex flex-col flex-1 p-4 gap-2.5">

        {/* LOCATION */}
        {experience.location && (
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span>📍</span>{experience.location}
          </p>
        )}

        {/* TITLE */}
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
          {experience.title}
        </h3>

        {/* RATING + TRUST */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 text-xs tracking-tight">
              {'★'.repeat(Math.min(Math.round(experience.rating), 5))}
              {'☆'.repeat(5 - Math.min(Math.round(experience.rating), 5))}
            </span>
            <span className="text-xs font-semibold text-gray-800">{experience.rating}</span>
            <span className="text-xs text-gray-400">
              ({experience.reviewCount.toLocaleString('it-IT')})
            </span>
          </div>
          <p className="text-xs text-gray-400">{getTrustLine(experience.reviewCount)}</p>
        </div>

        {/* DURATION */}
        <p className="text-xs text-gray-500">⏱ {experience.duration}</p>

        {/* PRICE + CTA */}
        <div className="mt-auto pt-2 space-y-2.5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">da</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">{experience.price}</span>
                {experience.originalPrice && (
                  <span className="text-xs text-gray-400 line-through mr-1">{experience.originalPrice}</span>
                )}
                <span className="text-xs text-gray-400">/ persona</span>
              </div>
            </div>
            <span className="text-xs text-green-600 font-medium">✓ Cancellazione gratuita</span>
          </div>

          {/* URGENCY — only if high demand */}
          {isHighDemand && (
            <p className="text-xs text-orange-500 font-medium">Alta richiesta 🔥</p>
          )}

          <a
            href={experience.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            onMouseDown={track}
            onClick={track}
            className="block w-full bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold text-center py-2.5 rounded-lg transition-colors duration-200"
          >
            {ctaText}
          </a>

          <p className="text-xs text-gray-400 text-center">
            Prenotazione sicura su {SOURCE_LABEL[experience.affiliateSource]}
          </p>
        </div>
      </div>
    </div>
  )
}
