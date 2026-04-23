import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const DEST_DIR = path.join(process.cwd(), 'content', 'destinazioni')

export type DestinationMeta = {
  slug: string
  name: string
  tagline: string
  coverImage: string
  publishedAt: string
}

export async function getAllDestinationSlugs(): Promise<{ slug: string }[]> {
  if (!fs.existsSync(DEST_DIR)) return []
  return fs
    .readdirSync(DEST_DIR)
    .filter(f => f.endsWith('.mdx'))
    .map(f => ({ slug: f.replace('.mdx', '') }))
}

export async function getAllDestinations(): Promise<DestinationMeta[]> {
  if (!fs.existsSync(DEST_DIR)) return []
  const files = fs.readdirSync(DEST_DIR).filter(f => f.endsWith('.mdx'))
  return files.map(file => {
    const slug = file.replace('.mdx', '')
    const raw = fs.readFileSync(path.join(DEST_DIR, file), 'utf-8')
    const { data } = matter(raw)
    return {
      slug,
      name: data.name ?? slug,
      tagline: data.tagline ?? '',
      coverImage: data.coverImage ?? '',
      publishedAt: data.publishedAt ?? '',
    }
  })
}

export async function getDestination(slug: string): Promise<{ meta: DestinationMeta; source: string } | null> {
  const filePath = path.join(DEST_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data } = matter(raw)
  const meta: DestinationMeta = {
    slug,
    name: data.name ?? slug,
    tagline: data.tagline ?? '',
    coverImage: data.coverImage ?? '',
    publishedAt: data.publishedAt ?? '',
  }
  return { meta, source: raw }
}
