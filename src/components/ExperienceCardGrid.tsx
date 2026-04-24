'use client'
import { useRef } from 'react'
import { ExperienceCard } from '@/components/ExperienceCard'
import { ExperienceListTracker } from '@/components/ExperienceListTracker'
import type { Experience } from '@/types/experience'

export function ExperienceCardGrid({
  experiences,
  destination,
  startIndex = 0,
  className,
}: {
  experiences: Experience[]
  destination: string
  startIndex?: number
  className?: string
}) {
  const visibleCount = useRef(0)

  return (
    <>
      <ExperienceListTracker destination={destination} count={experiences.length} experiences={experiences} />
      <div className={className ?? 'grid grid-cols-1 md:grid-cols-3 gap-5'}>
        {experiences.map((exp, i) => (
          <ExperienceCard
            key={exp.slug}
            experience={exp}
            index={startIndex + i}
            onVisible={() => { visibleCount.current++ }}
          />
        ))}
      </div>
    </>
  )
}
