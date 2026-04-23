import { getAllDestinationSlugs, getDestination, getAllDestinations } from '@/lib/content/destinations'
import { getAllArticleSlugs, getArticles } from '@/lib/content/articles'

describe('getAllDestinationSlugs', () => {
  it('returns an array', async () => {
    const slugs = await getAllDestinationSlugs()
    expect(Array.isArray(slugs)).toBe(true)
  })
})

describe('getAllDestinations', () => {
  it('returns array of objects with slug and name', async () => {
    const dests = await getAllDestinations()
    expect(Array.isArray(dests)).toBe(true)
    dests.forEach(d => {
      expect(typeof d.slug).toBe('string')
      expect(typeof d.name).toBe('string')
    })
  })
})

describe('getAllArticleSlugs', () => {
  it('returns an array', async () => {
    const slugs = await getAllArticleSlugs()
    expect(Array.isArray(slugs)).toBe(true)
  })
})

describe('getArticles', () => {
  it('returns array of article metas', async () => {
    const articles = await getArticles()
    expect(Array.isArray(articles)).toBe(true)
    articles.forEach(a => {
      expect(typeof a.slug).toBe('string')
      expect(typeof a.title).toBe('string')
    })
  })
})
