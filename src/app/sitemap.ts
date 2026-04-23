import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/config/site'
import { getAllDestinationSlugs } from '@/lib/content/destinations'
import { getAllArticleSlugs } from '@/lib/content/articles'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.domain
  const now = new Date().toISOString()

  const destinationSlugs = await getAllDestinationSlugs()
  const articleSlugs = await getAllArticleSlugs()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/destinazioni`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/articoli`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
  ]

  const destinationRoutes: MetadataRoute.Sitemap = destinationSlugs.map(({ slug }) => ({
    url: `${base}/destinazioni/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  const articleRoutes: MetadataRoute.Sitemap = articleSlugs.map(({ slug }) => ({
    url: `${base}/articoli/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticRoutes, ...destinationRoutes, ...articleRoutes]
}
