import Link from 'next/link'
import { siteConfig } from '@/lib/config/site'

const DESTINATION_LINKS = [
  { label: 'Sicilia', href: '/destinazioni/sicilia' },
  { label: 'Sardegna', href: '/destinazioni/sardegna' },
  { label: 'Costiera Amalfitana', href: '/destinazioni/costiera-amalfitana' },
  { label: 'Venezia', href: '/destinazioni/venezia' },
]

export function Footer() {
  return (
    <footer className="bg-amber-50 border-t border-amber-100 mt-20">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <p className="font-bold text-lg text-sky-600 mb-2">{siteConfig.name}</p>
          <p className="text-sm text-gray-500">{siteConfig.tagline}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-sm mb-3">Destinazioni</p>
          <ul className="space-y-2">
            {DESTINATION_LINKS.map(({ label, href }) => (
              <li key={href}>
                <Link href={href} className="text-sm text-gray-500 hover:text-sky-600 transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-sm mb-3">Esplora</p>
          <ul className="space-y-2">
            {siteConfig.nav.map(({ label, href }) => (
              <li key={href}>
                <Link href={href} className="text-sm text-gray-500 hover:text-sky-600 transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-amber-200 py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} {siteConfig.name}. Tutti i diritti riservati.
      </div>
    </footer>
  )
}
