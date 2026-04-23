import type { Metadata } from 'next'
import Link from 'next/link'
import { getExperiences } from '@/lib/data/experiences'
import { getEvents } from '@/lib/data/events'
import { getArticles } from '@/lib/content/articles'
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
  { slug: 'sicilia', name: 'Sicilia', tagline: 'Acque cristalline e grotte marine', coverImage: '/images/destinazioni/sicilia.jpg' },
  { slug: 'costiera-amalfitana', name: 'Costiera Amalfitana', tagline: 'Coste spettacolari e tramonti sul Tirreno', coverImage: '/images/destinazioni/costiera.jpg' },
  { slug: 'sardegna', name: 'Sardegna', tagline: 'Mare turchese e calette selvagge', coverImage: '/images/destinazioni/sardegna.jpg' },
  { slug: 'venezia', name: 'Venezia', tagline: 'Laguna unica, esperienze fuori dal comune', coverImage: '/images/destinazioni/venezia.jpg' },
]

export default async function HomePage() {
  const [experiences, events, articles] = await Promise.all([
    getExperiences({ featured: true, limit: 3 }),
    getEvents({ limit: 2 }),
    getArticles({ limit: 3 }),
  ])

  return (
    <div className="bg-white">

      {/* HERO */}
      <section className="relative bg-sky-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-900/80 to-sky-800/60" />
        <div className="relative max-w-4xl mx-auto px-6 py-24 text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Scopri le migliori gite in barca in Italia
          </h1>
          <p className="text-sky-100 text-lg max-w-2xl mx-auto">
            Guide esperte, destinazioni selezionate e le migliori esperienze in mare lungo le coste italiane.
          </p>
          <p className="text-sm text-sky-200">
            Gite in barca in Italia · Escursioni in mare · Esperienze costiere uniche — oltre 500+ esperienze selezionate in tutta Italia
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/destinazioni">
              <Button className="bg-white text-sky-700 hover:bg-sky-50 font-semibold px-8">
                Scopri le gite
              </Button>
            </Link>
            <Link href="/articoli">
              <Button variant="outline" className="border-white text-white hover:bg-white/10 font-semibold px-8">
                Leggi le guide
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* DESTINAZIONI */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Destinazioni principali</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {DESTINATIONS.map(dest => (
            <DestinationCard key={dest.slug} destination={dest} />
          ))}
        </div>
      </section>

      {/* TOP ESPERIENZE */}
      {experiences.length > 0 && (
        <section className="bg-sky-50 py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Le nostre scelte migliori</h2>
              <p className="text-gray-500 text-sm mt-1">Selezionate dalla redazione</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {experiences.map(exp => (
                <ExperienceCard key={exp.slug} experience={exp} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* GUIDE / ARTICOLI */}
      {articles.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Guide per organizzare la tua gita</h2>
            <Link href="/articoli" className="text-sm text-sky-600 hover:underline">
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
