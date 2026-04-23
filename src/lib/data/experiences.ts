import type { Experience } from '@/types/experience'

const MOCK_EXPERIENCES: Experience[] = [
  {
    id: '1',
    slug: 'gita-barca-taormina',
    title: 'Gita in barca a Taormina e Isola Bella',
    description: 'Scopri le meraviglie della costa taorminese a bordo di un elegante cabinato. Snorkeling nelle acque cristalline di Isola Bella.',
    destination: 'sicilia',
    price: 'da €80',
    duration: '4 ore',
    rating: 4.8,
    reviewCount: 124,
    image: '/images/experiences/taormina.jpg',
    affiliateUrl: 'https://www.viator.com',
    affiliateSource: 'viator',
    order: 1,
    featured: true,
    includes: ['Skipper incluso', 'Attrezzatura snorkeling', 'Acqua e snack'],
    departureInfo: 'Partenza dal porto di Taormina, ore 9:00',
    cancellation: 'Cancellazione gratuita fino a 24h prima',
    isIdealFor: ['coppie', 'appassionati di snorkeling', 'amanti della natura'],
    notIdealFor: ['gruppi numerosi (max 8 persone)', 'chi soffre il mal di mare'],
  },
  {
    id: '2',
    slug: 'escursione-eolie-lipari',
    title: 'Escursione alle Isole Eolie da Milazzo',
    description: 'Un giorno intero alla scoperta di Lipari, Vulcano e Panarea. Mare vulcanico e paesaggi unici al mondo.',
    destination: 'sicilia',
    price: 'da €120',
    duration: 'Giornata intera',
    rating: 4.9,
    reviewCount: 87,
    image: '/images/experiences/eolie.jpg',
    affiliateUrl: 'https://www.viator.com',
    affiliateSource: 'viator',
    order: 2,
    featured: true,
    includes: ['Skipper e guida', 'Pranzo a bordo', 'Snorkeling'],
    departureInfo: 'Partenza dal porto di Milazzo, ore 8:00',
    cancellation: 'Cancellazione gratuita fino a 48h prima',
    isIdealFor: ['avventurieri', 'famiglie con bambini grandi', 'fotografi'],
    notIdealFor: ['chi ha poco tempo'],
  },
  {
    id: '3',
    slug: 'tour-costa-amalfitana-positano',
    title: 'Tour in barca della Costiera da Positano',
    description: 'Naviga tra Positano, Praiano e la Grotta dello Smeraldo. Aperitivo al tramonto incluso.',
    destination: 'costiera-amalfitana',
    price: 'da €95',
    duration: '5 ore',
    rating: 4.7,
    reviewCount: 203,
    image: '/images/experiences/positano.jpg',
    affiliateUrl: 'https://www.viator.com',
    affiliateSource: 'viator',
    order: 1,
    featured: true,
    includes: ['Skipper', 'Aperitivo a bordo', 'Soste balneari'],
    departureInfo: 'Partenza dal molo Beaurivage di Positano, ore 10:00',
    cancellation: 'Cancellazione gratuita fino a 24h prima',
    isIdealFor: ['coppie romantiche', 'amanti del tramonto', 'turisti premium'],
    notIdealFor: ["chi cerca spiagge affollate"],
  },
  {
    id: '4',
    slug: 'gita-maddalena-caprera',
    title: "Arcipelago della Maddalena in barca a vela",
    description: "Esplora le 7 isole dell'Arcipelago della Maddalena. Acque turchesi e natura incontaminata.",
    destination: 'sardegna',
    price: 'da €110',
    duration: '6 ore',
    rating: 4.9,
    reviewCount: 156,
    image: '/images/experiences/maddalena.jpg',
    affiliateUrl: 'https://www.getyourguide.com',
    affiliateSource: 'getyourguide',
    order: 1,
    featured: true,
    includes: ['Skipper', 'Pranzo sardo', 'Snorkeling', 'Kayak'],
    departureInfo: 'Partenza da La Maddalena, ore 9:30',
    cancellation: 'Cancellazione gratuita fino a 24h prima',
    isIdealFor: ['famiglie', 'amanti della vela', 'naturalisti'],
    notIdealFor: ['chi cerca movida'],
  },
  {
    id: '5',
    slug: 'gita-barca-venezia-laguna',
    title: 'Tour privato in barca della Laguna di Venezia',
    description: "Scopri Burano, Murano e Torcello lontano dalla folla. Un'esperienza esclusiva nella Laguna.",
    destination: 'venezia',
    price: 'da €150',
    duration: '4 ore',
    rating: 4.8,
    reviewCount: 98,
    image: '/images/experiences/venezia-laguna.jpg',
    affiliateUrl: 'https://www.viator.com',
    affiliateSource: 'viator',
    order: 1,
    featured: false,
    includes: ['Barca privata', 'Guida locale', 'Stop a Burano e Murano'],
    departureInfo: 'Partenza da Fondamente Nove, Venezia',
    cancellation: 'Cancellazione gratuita fino a 24h prima',
    isIdealFor: ['chi vuole evitare la folla', 'fotografi', 'coppie'],
    notIdealFor: ['chi cerca divertimento notturno'],
  },
]

export async function getExperiences(params?: {
  destination?: string
  limit?: number
  featured?: boolean
}): Promise<Experience[]> {
  let results = [...MOCK_EXPERIENCES]

  if (params?.destination) {
    results = results.filter(e => e.destination === params.destination)
  }
  if (params?.featured !== undefined) {
    results = results.filter(e => e.featured === params.featured)
  }

  results.sort((a, b) => (a.order ?? 99) - (b.order ?? 99))

  if (params?.limit) {
    results = results.slice(0, params.limit)
  }

  return results
}

export async function getExperience(slug: string): Promise<Experience | null> {
  return MOCK_EXPERIENCES.find(e => e.slug === slug) ?? null
}
