import Link from 'next/link'

const CATEGORIES = [
  { label: 'Sicilia',              href: '/destinazioni/sicilia',           img: '/images/sicilia/pexels-raymond-petrik-1448389535-34170086.jpg' },
  { label: 'Sardegna',            href: '/destinazioni/sardegna',          img: '/images/sardegna/pexels-vince-32911045.jpg' },
  { label: 'Costiera Amalfitana', href: '/destinazioni/costiera-amalfitana', img: '/images/amalfi/pexels-hellojoshwithers-27025482.jpg' },
  { label: 'Venezia',             href: '/destinazioni/venezia',           img: '/images/generiche/pexels-julia-volk-5273458.jpg' },
  { label: 'Barca privata',       href: '/destinazioni',                   img: '/images/sardegna/pexels-davide-lorenzon-788830-13409756.jpg' },
  { label: 'Tramonto',            href: '/destinazioni',                   img: '/images/amalfi/pexels-small-steps-898071686-19990860.jpg' },
  { label: 'Snorkeling',          href: '/destinazioni',                   img: '/images/sicilia/pexels-hub-jacqu-750015482-29011885.jpg' },
  { label: 'Tour guidati',        href: '/destinazioni',                   img: '/images/generiche/pexels-matthardy-3560374.jpg' },
]

export function CategoryStrip() {
  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex gap-8 overflow-x-auto py-5 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.label}
              href={cat.href}
              className="group flex flex-col items-center gap-2 shrink-0 text-center"
            >
              <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-sky-400 transition-all duration-200">
                <img
                  src={cat.img}
                  alt={cat.label}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-xs font-medium text-gray-600 group-hover:text-sky-600 transition-colors whitespace-nowrap">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
