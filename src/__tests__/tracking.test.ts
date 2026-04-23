import { trackAffiliateClick } from '@/lib/tracking'
import type { Experience } from '@/types/experience'

describe('trackAffiliateClick', () => {
  it('logs without throwing', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {})
    const exp = { slug: 'test', affiliateSource: 'viator' } as Experience
    expect(() => trackAffiliateClick(exp)).not.toThrow()
    expect(spy).toHaveBeenCalledWith('[affiliate_click]', 'test', 'viator')
    spy.mockRestore()
  })
})
