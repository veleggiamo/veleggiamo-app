import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { compileMDX } from 'next-mdx-remote/rsc'
import { getDestination, getAllDestinationSlugs } from '@/lib/content/destinations'
import { getExperiences } from '@/lib/data/experiences'
import { getArticles } from '@/lib/content/articles'
import { ExperienceCard } from '@/components/ExperienceCard'
import { ExperienceListTracker } from '@/components/ExperienceListTracker'
import { ExperienceEmptyState } from '@/components/ExperienceEmptyState'
import { ArticleCard } from '@/components/ArticleCard'
import { siteConfig } from '@/lib/config/site'

export async function generateStaticParams() {
  return getAllDestinationSlugs()
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const data = await getDestination(slug)
  if (!data) return {}
  const experiences = await import('@/lib/data/experiences').then(m => m.getExperiences({ destination: slug }))
  const title = `Gite in Barca in ${data.meta.name} 2026 — Esperienze e Guide`
  const description = `Scopri le migliori gite in barca in ${data.meta.name}: zone, prezzi 2026, quando andare e ${experiences.length > 0 ? `${experiences.length} esperienze selezionate` : 'guide pratiche'}.`
  return {
    title,
    description,
    alternates: { canonical: `${siteConfig.domain}/destinazioni/${slug}` },
    openGraph: {
      title,
      description,
      url: `${siteConfig.domain}/destinazioni/${slug}`,
      type: 'website',
      images: [
        {
          url: data.meta.coverImage || siteConfig.defaultOgImage,
          width: 1200,
          height: 630,
        },
      ],
    },
  }
}

const FAQ_DATA: Record<string, { q: string; a: string }[]> = {
  sicilia: [
    { q: 'Quanto costa una gita in barca in Sicilia?', a: 'Le escursioni di mezza giornata costano in media €70–€120 a persona. Per gite private o giornate intere con pranzo a bordo, i prezzi salgono a €200–€400.' },
    { q: 'Qual è il periodo migliore per le gite in barca in Sicilia?', a: 'Da maggio a settembre. Maggio e settembre offrono ottimo clima con meno folla.' },
    { q: 'Serve prenotare in anticipo?', a: 'In estate è consigliabile prenotare con almeno 1–2 settimane di anticipo, soprattutto per le escursioni alle Eolie.' },
  ],
  sardegna: [
    { q: 'Qual è la zona migliore della Sardegna per le gite in barca?', a: "L'Arcipelago della Maddalena è il must assoluto. Per acque turchesi, il Golfo di Orosei è insuperabile." },
    { q: 'Quanto costa noleggiare una barca in Sardegna?', a: 'Per escursioni guidate si parte da €80 a persona. Il noleggio autonomo va da €150 al giorno.' },
    { q: 'Quando è meglio andare in Sardegna?', a: 'Giugno–settembre, con picco luglio–agosto.' },
  ],
  'costiera-amalfitana': [
    { q: 'Qual è il miglior punto di partenza per le gite sulla Costiera?', a: 'Positano e Amalfi sono i più comodi. Da Sorrento si raggiunge la Costiera in circa 30 minuti.' },
    { q: 'È possibile fare gite al tramonto sulla Costiera Amalfitana?', a: 'Sì, le gite al tramonto da Positano sono tra le esperienze più richieste, con aperitivo a bordo.' },
    { q: 'Le gite in barca includono la Grotta dello Smeraldo?', a: "Molte escursioni prevedono la sosta alla Grotta. Verificare sempre l'itinerario." },
  ],
  venezia: [
    { q: 'Vale la pena prendere una barca privata a Venezia?', a: 'Sì, se il budget lo permette. Permette di fermarsi dove si vuole e raggiungere canali inaccessibili ai mezzi pubblici.' },
    { q: 'Quale isola della laguna merita di più?', a: "Burano per le fotografie, Torcello per la storia, Murano per chi ama l'arte vetraria." },
    { q: 'Le gite sono adatte ai bambini?', a: 'Sì, la laguna è quasi sempre piatta e sicura.' },
  ],
}

export default async function DestinazioneSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [data, experiences, articles] = await Promise.all([
    getDestination(slug),
    getExperiences({ destination: slug }),
    getArticles({ destination: slug }),
  ])

  if (!data) notFound()

  const { content } = await compileMDX({
    source: data.source,
    options: { parseFrontmatter: true },
  })

  const topExperiences = experiences.slice(0, 3)
  const remainingExperiences = experiences.slice(3, 9)
  const faqs = FAQ_DATA[slug] ?? []

  const faqJsonLd = faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  } : null

  const itemListJsonLd = experiences.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Migliori gite in barca in ${data.meta.name}`,
    itemListElement: experiences.slice(0, 6).map((exp, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'TouristTrip',
        name: exp.title,
        url: exp.affiliateUrl,
        offers: { '@type': 'Offer', priceCurrency: 'EUR' },
      },
    })),
  } : null

  return (
    <div className="bg-white">
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      {itemListJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}

      <div className="bg-sky-50 border-b border-sky-100 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Gite in barca in {data.meta.name}
          </h1>
          <p className="text-gray-500 mt-2">
            Escursioni, tour e esperienze selezionate lungo la costa
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-14">

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Le migliori gite in barca in {data.meta.name}
          </h2>
          <p className="text-sm text-gray-500 mb-6">Selezionate dalla redazione</p>
          {topExperiences.length > 0 ? (
            <>
              <ExperienceListTracker destination={slug} count={experiences.length} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {topExperiences.map((exp, i) => (
                  <ExperienceCard key={exp.slug} experience={exp} index={i} />
                ))}
              </div>
            </>
          ) : (
            <ExperienceEmptyState />
          )}
        </section>

        <div className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-a:text-sky-600">
          {content}
        </div>

        {remainingExperiences.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-5">Altre esperienze</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {remainingExperiences.map((exp, i) => (
                <ExperienceCard key={exp.slug} experience={exp} index={topExperiences.length + i} />
              ))}
            </div>
          </section>
        )}

        {faqs.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-5">
              Domande frequenti sulle gite in barca in {data.meta.name}
            </h2>
            <div className="space-y-4">
              {faqs.map(({ q, a }) => (
                <div key={q} className="border border-gray-100 rounded-lg p-4">
                  <p className="font-semibold text-gray-900 text-sm">{q}</p>
                  <p className="text-gray-600 text-sm mt-1">{a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {articles.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-5">
              Guide su {data.meta.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {articles.map(article => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}
