import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { compileMDX } from 'next-mdx-remote/rsc'
import { getArticle, getAllArticleSlugs, getArticles, extractToc } from '@/lib/content/articles'
import { getExperiences } from '@/lib/data/experiences'
import { ExperienceCardGrid } from '@/components/ExperienceCardGrid'
import { ExperienceEmptyState } from '@/components/ExperienceEmptyState'
import { CoverImage } from '@/components/CoverImage'
import { ArticleCard } from '@/components/ArticleCard'
import { siteConfig } from '@/lib/config/site'

export async function generateStaticParams() {
  return getAllArticleSlugs()
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const data = await getArticle(slug)
  if (!data) return {}
  const title = data.meta.seo?.title ?? data.meta.title
  const description = data.meta.seo?.description ?? data.meta.description
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `${siteConfig.domain}/articoli/${slug}` },
    openGraph: {
      title,
      description,
      url: `${siteConfig.domain}/articoli/${slug}`,
      type: 'article',
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

export default async function ArticoloSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getArticle(slug)
  if (!data) notFound()

  const [experiences, relatedArticles] = await Promise.all([
    getExperiences({ destination: data.meta.destination }),
    getArticles({ destination: data.meta.destination, limit: 3 }),
  ])

  const hubSlug = `gite-barca-${data.meta.destination}`
  const otherArticles = relatedArticles
    .filter(a => a.slug !== slug)
    .sort((a, b) => {
      if (a.slug === hubSlug) return -1
      if (b.slug === hubSlug) return 1
      return 0
    })
    .slice(0, 4)
  const toc = extractToc(data.source)

  const ExperienceListMdx = ({ limit = 3 }: { limit?: number }) => {
    const items = experiences.slice(0, limit)
    if (items.length === 0) return <ExperienceEmptyState />
    return (
      <ExperienceCardGrid
        experiences={items}
        destination={data.meta.destination}
        className="grid grid-cols-1 md:grid-cols-3 gap-5 not-prose my-6"
      />
    )
  }

  const { content } = await compileMDX({
    source: data.source,
    options: { parseFrontmatter: true },
    components: { ExperienceList: ExperienceListMdx },
  })

  const displayDate = data.meta.updatedAt ?? data.meta.publishedAt

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.meta.title,
    description: data.meta.seo?.description ?? data.meta.description,
    datePublished: data.meta.publishedAt,
    dateModified: data.meta.updatedAt ?? data.meta.publishedAt,
    author: { '@type': 'Organization', name: 'Veleggiamo', url: siteConfig.domain },
    image: data.meta.coverImage,
    url: `${siteConfig.domain}/articoli/${slug}`,
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <div className="flex flex-col lg:flex-row gap-10">

        {/* MAIN */}
        <article className="flex-1 min-w-0">
          {data.meta.coverImage && (
            <div className="relative h-64 md:h-80 rounded-xl overflow-hidden bg-sky-100 mb-8">
              <CoverImage src={data.meta.coverImage} alt={data.meta.title} className="w-full h-full object-cover" />
            </div>
          )}

          <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
            {data.meta.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 border-b border-gray-100 pb-4 mb-6">
            <span>📍 <Link href={`/destinazioni/${data.meta.destination}`} className="hover:text-sky-600 capitalize">{data.meta.destination.replace(/-/g, ' ')}</Link></span>
            {data.meta.readingTime && <span>⏱️ {data.meta.readingTime} min di lettura</span>}
            <span>📅 Aggiornato: {displayDate}</span>
          </div>

          {experiences.length > 0 && (
            <div className="bg-sky-50 border border-sky-100 rounded-lg p-3 mb-6 text-sm">
              <span className="text-gray-600">Vuoi vedere subito le migliori gite? </span>
              <a href="#esperienze-consigliate" className="text-sky-600 font-semibold hover:underline">
                → {experiences.length} esperienze consigliate ↓
              </a>
            </div>
          )}

          {toc.length > 0 && (
            <nav className="bg-gray-50 border border-gray-100 rounded-lg p-4 mb-8">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Indice</p>
              <ul className="space-y-1.5">
                {toc.map(({ id, title }) => (
                  <li key={id}>
                    <a href={`#${id}`} className="text-sm text-sky-600 hover:underline">
                      {title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <div className="prose prose-gray max-w-none prose-headings:scroll-mt-20 prose-a:text-sky-600 prose-h2:text-xl prose-h2:font-bold">
            {content}
          </div>

          {experiences.length > 0 && (
            <section id="esperienze-consigliate" className="mt-12 scroll-mt-20">
              <h2 className="text-xl font-bold text-gray-900 mb-5">
                Esperienze consigliate in {data.meta.destination.replace(/-/g, ' ')}
              </h2>
              <ExperienceCardGrid experiences={experiences} destination={data.meta.destination} />
            </section>
          )}
        </article>

        {/* SIDEBAR */}
        <aside className="lg:w-72 shrink-0 space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="bg-sky-50 border border-sky-100 rounded-xl p-5">
            <p className="font-semibold text-gray-900 text-sm mb-3">
              Guida completa alla destinazione
            </p>
            <Link
              href={`/destinazioni/${data.meta.destination}`}
              className="block text-sky-600 font-medium text-sm hover:underline capitalize"
            >
              → Vai alla guida {data.meta.destination.replace(/-/g, ' ')}
            </Link>
          </div>

          {experiences.length > 0 && (
            <div className="border border-gray-100 rounded-xl p-5">
              <p className="font-semibold text-gray-900 text-sm mb-4">Esperienze più prenotate</p>
              <div className="space-y-3">
                {experiences.slice(0, 2).map(exp => (
                  <a
                    key={exp.slug}
                    href={exp.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-gray-700 hover:text-sky-600"
                  >
                    ⭐ {exp.title} — {exp.price}
                  </a>
                ))}
              </div>
            </div>
          )}

          {otherArticles.length > 0 && (
            <div className="border border-gray-100 rounded-xl p-5">
              <p className="font-semibold text-gray-900 text-sm mb-3">Leggi anche</p>
              <ul className="space-y-2">
                {otherArticles.map(a => (
                  <li key={a.slug}>
                    <Link href={`/articoli/${a.slug}`} className="text-sm text-sky-600 hover:underline">
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

      </div>
    </div>
  )
}
