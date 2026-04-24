import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { ArticleMeta } from '@/types/article'

const ARTICLES_DIR = path.join(process.cwd(), 'content', 'articoli')

const DESTINATION_FALLBACK: Record<string, string> = {
  sicilia: '/images/sicilia/pexels-raymond-petrik-1448389535-34170086.jpg',
  sardegna: '/images/sardegna/pexels-vince-32911045.jpg',
  'costiera-amalfitana': '/images/amalfi/pexels-hellojoshwithers-27025482.jpg',
  venezia: '/images/generiche/pexels-julia-volk-5273458.jpg',
  puglia: '/images/amalfi/pexels-hellojoshwithers-27025484.jpg',
  calabria: '/images/amalfi/pexels-magda-ehlers-pexels-35424369.jpg',
}

function resolveImage(coverImage: string, destination: string): string {
  if (coverImage) {
    const abs = path.join(process.cwd(), 'public', coverImage)
    if (fs.existsSync(abs)) return coverImage
  }
  return DESTINATION_FALLBACK[destination] ?? ''
}

function calcReadingTime(source: string): number {
  const wordCount = source.replace(/---[\s\S]*?---/, '').split(/\s+/).length
  return Math.max(1, Math.round(wordCount / 200))
}

export async function getAllArticleSlugs(): Promise<{ slug: string }[]> {
  if (!fs.existsSync(ARTICLES_DIR)) return []
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter(f => f.endsWith('.mdx'))
    .map(f => ({ slug: f.replace('.mdx', '') }))
}

export async function getArticles(params?: {
  destination?: string
  limit?: number
}): Promise<ArticleMeta[]> {
  if (!fs.existsSync(ARTICLES_DIR)) return []
  const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.mdx'))
  let articles: ArticleMeta[] = files.map(file => {
    const slug = file.replace('.mdx', '')
    const raw = fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf-8')
    const { data } = matter(raw)
    return {
      slug,
      title: data.title ?? '',
      description: data.description ?? '',
      destination: data.destination ?? '',
      publishedAt: data.publishedAt ?? '',
      updatedAt: data.updatedAt,
      coverImage: resolveImage(data.coverImage ?? '', data.destination ?? ''),
      readingTime: calcReadingTime(raw),
      seo: data.seo,
    }
  })

  articles.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))

  if (params?.destination) {
    articles = articles.filter(a => a.destination === params.destination)
  }
  if (params?.limit) {
    articles = articles.slice(0, params.limit)
  }
  return articles
}

export async function getArticle(slug: string): Promise<{ meta: ArticleMeta; source: string } | null> {
  const filePath = path.join(ARTICLES_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data } = matter(raw)
  const meta: ArticleMeta = {
    slug,
    title: data.title ?? '',
    description: data.description ?? '',
    destination: data.destination ?? '',
    publishedAt: data.publishedAt ?? '',
    updatedAt: data.updatedAt,
    coverImage: resolveImage(data.coverImage ?? '', data.destination ?? ''),
    readingTime: calcReadingTime(raw),
    seo: data.seo,
  }
  return { meta, source: raw }
}

export function extractToc(source: string): { id: string; title: string }[] {
  const matches = source.matchAll(/^## (.+)$/gm)
  return Array.from(matches).map(m => ({
    id: m[1].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    title: m[1],
  }))
}
