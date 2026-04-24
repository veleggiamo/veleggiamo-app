import Link from 'next/link'

const DESTINATIONS = [
  {
    label: 'Sicilia',
    sub: '5 esperienze',
    href: '/destinazioni/sicilia',
    img: '/images/sicilia/pexels-raymond-petrik-1448389535-34170086.jpg',
  },
  {
    label: 'Sardegna',
    sub: '5 esperienze',
    href: '/destinazioni/sardegna',
    img: '/images/sardegna/pexels-vince-32911045.jpg',
  },
  {
    label: 'Puglia',
    sub: '5 esperienze',
    href: '/destinazioni/puglia',
    img: '/images/amalfi/pexels-hellojoshwithers-27025484.jpg',
  },
  {
    label: 'Calabria',
    sub: '5 esperienze',
    href: '/destinazioni/calabria',
    img: '/images/amalfi/pexels-magda-ehlers-pexels-35424369.jpg',
  },
  {
    label: 'Costiera Amalfitana',
    sub: '1 esperienza',
    href: '/destinazioni/costiera-amalfitana',
    img: '/images/amalfi/pexels-hellojoshwithers-27025482.jpg',
  },
  {
    label: 'Venezia',
    sub: '1 esperienza',
    href: '/destinazioni/venezia',
    img: '/images/generiche/pexels-julia-volk-5273458.jpg',
  },
]

export function CategoryStrip() {
  return (
    <div className="bg-white border-b border-gray-100 py-6">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-lg font-semibold text-gray-900 mb-5 text-center">
          Scegli la tua prossima esperienza
        </p>
        <div className="flex gap-10 overflow-x-auto scrollbar-hide pb-1 md:justify-center">
          {DESTINATIONS.map(dest => (
            <Link
              key={dest.label}
              href={dest.href}
              className="group flex flex-col items-center gap-2.5 shrink-0 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-gray-200 group-hover:ring-sky-500 group-hover:ring-offset-2 group-active:scale-95 transition-all duration-200 shadow-sm group-hover:shadow-md">
                <img
                  src={dest.img}
                  alt={dest.label}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-800 group-hover:text-sky-600 transition-colors whitespace-nowrap leading-tight">
                  {dest.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 whitespace-nowrap">{dest.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
