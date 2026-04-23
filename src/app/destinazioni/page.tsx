import type { Metadata } from 'next'
import { getAllDestinations } from '@/lib/content/destinations'
import { DestinationCard } from '@/components/DestinationCard'
import { siteConfig } from '@/lib/config/site'

export const metadata: Metadata = {
  title: 'Destinazioni per Gite in Barca in Italia',
  description: 'Scopri le destinazioni migliori per le gite in barca in Italia: Sicilia, Sardegna, Costiera Amalfitana, Venezia e molto altro.',
  alternates: { canonical: `${siteConfig.domain}/destinazioni` },
}

export default async function DestinazioniPage() {
  const destinations = await getAllDestinations()

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        Destinazioni per gite in barca in Italia
      </h1>
      <p className="text-gray-500 mb-10 max-w-2xl">
        Esplora le coste più belle d&apos;Italia. Guide dettagliate, esperienze selezionate e tutto quello che devi sapere per organizzare la tua gita in barca.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {destinations.map(dest => (
          <DestinationCard key={dest.slug} destination={dest} />
        ))}
      </div>
    </div>
  )
}
