import type { Metadata } from 'next'
import { getArticles } from '@/lib/content/articles'
import { ArticleCard } from '@/components/ArticleCard'
import { siteConfig } from '@/lib/config/site'

export const metadata: Metadata = {
  title: 'Guide per Gite in Barca in Italia',
  description: 'Guide pratiche per organizzare la tua gita in barca in Italia. Destinazioni, prezzi, consigli e itinerari selezionati dalla redazione.',
  alternates: { canonical: `${siteConfig.domain}/articoli` },
}

export default async function ArticoliPage() {
  const articles = await getArticles()

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        Guide per organizzare la tua gita in barca
      </h1>
      <p className="text-gray-500 mb-10 max-w-2xl">
        Tutto quello che devi sapere per scegliere la destinazione giusta, prenotare al momento giusto e vivere un&apos;esperienza indimenticabile in mare.
      </p>
      {articles.length === 0 ? (
        <p className="text-gray-400 text-sm">Nessun articolo disponibile al momento.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(article => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      )}
    </div>
  )
}
