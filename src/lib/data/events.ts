export type SiteEvent = {
  id: string
  title: string
  description: string
  date: string
  location: string
  image: string
  href: string
}

const MOCK_EVENTS: SiteEvent[] = [
  {
    id: '1',
    title: 'Veleggiata della Primavera — Sicilia',
    description: 'Il grande raduno velico primaverile lungo la costa siciliana. Aperto a tutti.',
    date: '2026-05-10',
    location: 'Palermo',
    image: '/images/events/veleggiata-sicilia.jpg',
    href: '/articoli/veleggiata-primavera-sicilia',
  },
  {
    id: '2',
    title: "Regata dell'Adriatico — Venezia",
    description: 'Storica regata nella Laguna di Venezia. Spettacolo garantito per grandi e piccini.',
    date: '2026-06-15',
    location: 'Venezia',
    image: '/images/events/regata-venezia.jpg',
    href: '/articoli/regata-adriatico-venezia',
  },
]

export async function getEvents(params?: { limit?: number }): Promise<SiteEvent[]> {
  if (params?.limit) return MOCK_EVENTS.slice(0, params.limit)
  return MOCK_EVENTS
}
