'use client'
import { useEffect, useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { trackAffiliateClick, trackViewItem, trackViewCta, getCtaVariant } from '@/lib/tracking'
import { incrementVisibleCards } from '@/lib/visibleCards'
import type { Experience } from '@/types/experience'

const SOURCE_LABEL: Record<Experience['affiliateSource'], string> = {
  viator: 'Viator',
  getyourguide: 'GetYourGuide',
  direct: 'operatore verificato',
}

export const CTA_LABELS: Record<'A' | 'B', string> = {
  A: 'Vedi disponibilità e prezzo aggiornato',
  B: 'Controlla posti disponibili',
}

function getBadge(experience: Experience): string | undefined {
  if (experience.rating >= 4.7 && experience.reviewCount > 1000) return '⭐ Best value'
  return experience.badge
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
  const cardRef = useRef<HTMLDivElement>(null)
  const viewFired = useRef(false)

  useEffect(() => {
    setVariant(getCtaVariant())
  }, [])

  useEffect(() => {
    const el = cardRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !viewFired.current) {
          viewFired.current = true
          const v = getCtaVariant()
          trackViewItem(experience, index ?? 0, v)
          trackViewCta(experience, index ?? 0, v)
          incrementVisibleCards()
          onVisible?.()
          observer.disconnect()
        }
      },
      { threshold: 0.5 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [experience, index, onVisible])

  const ctaText = CTA_LABELS[variant]
  const track = () => trackAffiliateClick(experience, index, variant, ctaText)
  const badge = getBadge(experience)

  return (
    <Card ref={cardRef} className="overflow-hidden flex flex-col">
      <div className="relative h-44 bg-sky-100 shrink-0">
        {experience.image && (
          <img
            src={experience.image}
            alt={experience.title}
            className="w-full h-full object-cover"
            loading={index === 0 ? 'eager' : 'lazy'}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
        )}
        {badge && (
          <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow">
            {badge}
          </span>
        )}
      </div>
      <CardContent className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug">{experience.title}</h3>
          <div className="shrink-0 text-right">
            {experience.originalPrice && (
              <p className="text-xs text-gray-400 line-through leading-none">{experience.originalPrice}</p>
            )}
            <Badge variant="outline" className="text-xs">{experience.price}</Badge>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          ⭐ {experience.rating}{' '}
          <span className="text-gray-400">
            ({experience.reviewCount.toLocaleString('it-IT')} recensioni su {SOURCE_LABEL[experience.affiliateSource]})
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>⏱️ {experience.duration}</span>
          {experience.location && <span>📍 {experience.location}</span>}
        </div>
        <div className="mt-auto pt-1 space-y-1.5">
          <p className="text-xs text-orange-600 font-medium text-center">
            Disponibilità limitata — verifica ora
          </p>
          <a
            href={experience.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            onMouseDown={track}
            onClick={track}
            className="block"
          >
            <Button className="w-full bg-sky-600 hover:bg-sky-700 text-white text-sm h-9">
              {ctaText}
            </Button>
          </a>
          <p className="text-xs text-green-600 text-center font-medium">
            ✓ Cancellazione gratuita
          </p>
          <p className="text-xs text-gray-400 text-center">
            Prenotazione sicura su {SOURCE_LABEL[experience.affiliateSource]} — nessun costo extra
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
