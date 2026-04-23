import { getExperiences, getExperience } from '@/lib/data/experiences'

describe('getExperiences', () => {
  it('returns a non-empty array', async () => {
    const results = await getExperiences()
    expect(Array.isArray(results)).toBe(true)
    expect(results.length).toBeGreaterThan(0)
  })

  it('filters by destination', async () => {
    const results = await getExperiences({ destination: 'sicilia' })
    results.forEach(r => expect(r.destination).toBe('sicilia'))
  })

  it('respects limit', async () => {
    const results = await getExperiences({ limit: 2 })
    expect(results.length).toBeLessThanOrEqual(2)
  })

  it('filters featured experiences', async () => {
    const results = await getExperiences({ featured: true })
    results.forEach(r => expect(r.featured).toBe(true))
  })
})

describe('getExperience', () => {
  it('returns null for unknown slug', async () => {
    const result = await getExperience('does-not-exist')
    expect(result).toBeNull()
  })

  it('returns correct experience for valid slug', async () => {
    const all = await getExperiences()
    const first = all[0]
    const result = await getExperience(first.slug)
    expect(result?.slug).toBe(first.slug)
  })
})
