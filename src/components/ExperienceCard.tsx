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

export function ExperienceCard({ experience }: { experience: Experience }) {
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
      </div>
      <CardContent className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug">{experience.title}</h3>
          <Badge variant="secondary" className="shrink-0 text-xs">{experience.price}</Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>⭐ {experience.rating} ({experience.reviewCount})</span>
          <span>⏱️ {experience.duration}</span>
        </div>
        {experience.cancellation && (
          <p className="text-xs text-green-600 font-medium">{experience.cancellation}</p>
        )}
        <div className="mt-auto pt-1 space-y-1.5">
          <a
            href={experience.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackAffiliateClick(experience)}
            className="block"
          >
            <Button className="w-full bg-sky-600 hover:bg-sky-700 text-white text-sm h-9">
              Verifica disponibilità
            </Button>
          </a>
          <p className="text-xs text-gray-400 text-center">
            Prenotazione sicura tramite {SOURCE_LABEL[experience.affiliateSource]}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
