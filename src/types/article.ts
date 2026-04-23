export type ArticleMeta = {
  title: string
  description: string
  slug: string
  destination: string
  publishedAt: string
  updatedAt?: string
  coverImage: string
  readingTime?: number
  seo?: {
    title?: string
    description?: string
  }
}
