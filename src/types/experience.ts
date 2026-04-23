export type Experience = {
  id: string
  slug: string
  title: string
  description: string
  destination: string
  price: string
  duration: string
  rating: number
  reviewCount: number
  image: string
  affiliateUrl: string
  affiliateSource: 'viator' | 'getyourguide' | 'direct'
  order?: number
  includes?: string[]
  departureInfo?: string
  featured?: boolean
  cancellation?: string
  isIdealFor?: string[]
  notIdealFor?: string[]
}
