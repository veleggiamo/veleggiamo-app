import { getEvents } from '@/lib/data/events'

describe('getEvents', () => {
  it('returns an array', async () => {
    const results = await getEvents()
    expect(Array.isArray(results)).toBe(true)
  })

  it('respects limit', async () => {
    const results = await getEvents({ limit: 1 })
    expect(results.length).toBeLessThanOrEqual(1)
  })
})
