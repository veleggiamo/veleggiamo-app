import Link from 'next/link'
import type { DestinationMeta } from '@/lib/content/destinations'

type Props = {
  destination: Pick<DestinationMeta, 'slug' | 'name' | 'tagline'> & { coverImage?: string }
}

export function DestinationCard({ destination }: Props) {
  return (
    <Link
      href={`/destinazioni/${destination.slug}`}
      className="group relative overflow-hidden rounded-xl bg-sky-900 text-white aspect-square flex flex-col justify-end p-4 hover:ring-2 hover:ring-sky-400 transition-all"
    >
      {destination.coverImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:opacity-60 transition-opacity"
          style={{ backgroundImage: `url(${destination.coverImage})` }}
        />
      )}
      <div className="relative z-10">
        <p className="font-bold text-base leading-tight">{destination.name}</p>
        <p className="text-xs text-sky-200 mt-0.5">{destination.tagline}</p>
      </div>
    </Link>
  )
}
