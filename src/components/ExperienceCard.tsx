'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { trackAffiliateClick } from '@/lib/tracking'
import type { Experience } from '@/types/experience'

const SOURCE_LABEL: Record<Experience['affiliateSource'], string> = {
  viator: 'Viator',
  getyourguide: 'GetYourGuide',
  direct: 'operatore verificato',
}

export function ExperienceCard({ experience, index }: { experience: Experience; index?: number }) {
  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="relative h-44 bg-sky-100 shrink-0">
        {experience.image && (
          <img
            src={experience.image}
            alt={experience.title}
            className="w-full h-full object-cover"
          />
        )}
        {experience.badge && (
          <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow">
            {experience.badge}
          </span>
        )}
      </div>
      <CardContent className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug">{experience.title}</h3>
          <Badge variant="outline" className="shrink-0 text-xs">{experience.price}</Badge>
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
          <a
            href={experience.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackAffiliateClick(experience, index)}
            className="block"
          >
            <Button className="w-full bg-sky-600 hover:bg-sky-700 text-white text-sm h-9">
              Vedi disponibilità e prezzo aggiornato
            </Button>
          </a>
          <p className="text-xs text-green-600 text-center font-medium">
            ✓ Cancellazione gratuita
          </p>
          <p className="text-xs text-gray-400 text-center">
            Prenotazione sicura tramite {SOURCE_LABEL[experience.affiliateSource]}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
