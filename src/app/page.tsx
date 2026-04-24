import type { Metadata } from 'next'
import Link from 'next/link'
import { getExperiences } from '@/lib/data/experiences'
import { getEvents } from '@/lib/data/events'
import { getArticles } from '@/lib/content/articles'
import { HeroSection } from '@/components/HeroSection'
import { CategoryStrip } from '@/components/CategoryStrip'
import { ExperienceCard } from '@/components/ExperienceCard'
import { ArticleCard } from '@/components/ArticleCard'
import { DestinationCard } from '@/components/DestinationCard'
import { siteConfig } from '@/lib/config/site'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: `${siteConfig.name} — Gite in Barca in Italia`,
  description: 'Scopri le migliori escursioni e gite in barca in Italia. Guide, destinazioni e esperienze selezionate per vivere il mare al meglio.',
  openGraph: {
    title: `${siteConfig.name} — Gite in Barca in Italia`,
    description: 'Scopri le migliori escursioni e gite in barca in Italia.',
    images: [siteConfig.defaultOgImage],
  },
}

const DESTINATIONS = [
  { slug: 'sicilia', name: 'Sicilia', tagline: 'Acque cristalline e grotte marine', coverImage: '/images/sicilia/pexels-raymond-petrik-1448389535-34170086.jpg' },
  { slug: 'costiera-amalfitana', name: 'Costiera Amalfitana', tagline: 'Coste spettacolari e tramonti sul Tirreno', coverImage: '/images/amalfi/pexels-hellojoshwithers-27025482.jpg' },
  { slug: 'sardegna', name: 'Sardegna', tagline: 'Mare turchese e calette selvagge', coverImage: '/images/sardegna/pexels-vince-32911045.jpg' },
  { slug: 'venezia', name: 'Venezia', tagline: 'Laguna unica, esperienze fuori dal comune', coverImage: '/images/generiche/pexels-julia-volk-5273458.jpg' },
]

export default async function HomePage() {
  const [experiences, events, articles] = await Promise.all([
    getExperiences({ featured: true, limit: 6 }),
    getEvents({ limit: 2 }),
    getArticles({ limit: 3 }),
  ])

  return (
    <div className="bg-white">

      <HeroSection />
      <CategoryStrip />

      {/* TOP ESPERIENZE */}
      {experiences.length > 0 && (
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-6">
            {/* MICRO TRUST */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8 text-sm text-gray-600">
              <span>⭐ 10.000+ recensioni verificate</span>
              <span>🔒 Prenotazione sicura</span>
              <span>💸 Cancellazione gratuita su molte esperienze</span>
            </div>
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900">Le esperienze più prenotate</h2>
              <p className="text-sm text-gray-500 mt-1">Le attività più amate dai viaggiatori in Italia</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {experiences.map((exp, i) => (
                <ExperienceCard key={exp.slug} experience={exp} index={i} />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/destinazioni">
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-8 h-11">
                  Vedi tutte le esperienze →
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* TRUST BAR */}
      <section className="border-y border-gray-100 py-8 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: '✓', label: 'Cancellazione gratuita', sub: 'sulla maggior parte delle esperienze' },
              { icon: '🔒', label: 'Prenotazione sicura', sub: 'su Viator e GetYourGuide' },
              { icon: '★', label: 'Rating medio 4.8', sub: 'su migliaia di recensioni' },
              { icon: '🌊', label: '4 destinazioni', sub: 'le coste più belle d\'Italia' },
            ].map(item => (
              <div key={item.label} className="space-y-1">
                <p className="text-2xl">{item.icon}</p>
                <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                <p className="text-xs text-gray-500">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DESTINAZIONI */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Destinazioni principali</h2>
            <p className="text-sm text-gray-500 mt-1">Le coste più belle d'Italia</p>
          </div>
          <Link href="/destinazioni" className="text-sm text-sky-600 hover:underline font-medium">
            Tutte →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {DESTINATIONS.map(dest => (
            <DestinationCard key={dest.slug} destination={dest} />
          ))}
        </div>
      </section>

      {/* GUIDE / ARTICOLI */}
      {articles.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Guide per organizzare la tua gita</h2>
              <p className="text-sm text-gray-500 mt-1">Consigli pratici da chi conosce il mare</p>
            </div>
            <Link href="/articoli" className="text-sm text-sky-600 hover:underline font-medium">
              Tutte le guide →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map(article => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* BANNER EVENTI */}
      {events.length > 0 && (
        <section className="bg-amber-50 border-y border-amber-100 py-12">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Eventi da non perdere questo mese
            </h2>
            <div className="space-y-4">
              {events.map(event => (
                <Link key={event.id} href={event.href} className="flex gap-4 p-4 bg-white rounded-xl border border-amber-100 hover:border-sky-200 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 group-hover:text-sky-600 transition-colors">
                      {event.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                    <p className="text-xs text-gray-400 mt-1">📍 {event.location} · 📅 {event.date}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  )
}
