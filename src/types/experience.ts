export type Experience = {
  id: string
  slug: string
  title: string
  description: string
  destination: string
  location?: string
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
  badge?: string
  cancellation?: string
  isIdealFor?: string[]
  notIdealFor?: string[]
}
