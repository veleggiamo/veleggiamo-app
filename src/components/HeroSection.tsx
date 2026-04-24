import Link from 'next/link'
import { Button } from '@/components/ui/button'

const DEST_PILLS = [
  { slug: 'sicilia', name: 'Sicilia' },
  { slug: 'sardegna', name: 'Sardegna' },
  { slug: 'costiera-amalfitana', name: 'Costiera Amalfitana' },
  { slug: 'venezia', name: 'Venezia' },
]

export function HeroSection() {
  return (
    <section className="relative bg-sky-950 text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-950 via-sky-900 to-blue-900" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(56,189,248,0.15),transparent)]" />

      <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-28 text-center space-y-7">

        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-sky-100">
          <span className="text-amber-400">★</span>
          <span>500+ esperienze selezionate in tutta Italia</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
          Le migliori gite in barca<br className="hidden md:block" />
          <span className="text-sky-300"> lungo le coste italiane</span>
        </h1>

        <p className="text-sky-100 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Guide esperte, destinazioni selezionate e le migliori esperienze in mare.
          Prenotazione sicura su Viator e GetYourGuide.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
          <Link href="/destinazioni">
            <Button size="lg" className="bg-white text-sky-800 hover:bg-sky-50 font-semibold px-8 shadow-lg shadow-sky-950/40">
              Scopri le destinazioni
            </Button>
          </Link>
          <Link href="/articoli">
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold px-8">
              Leggi le guide
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 justify-center pt-2">
          {DEST_PILLS.map(dest => (
            <Link
              key={dest.slug}
              href={`/destinazioni/${dest.slug}`}
              className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-4 py-1.5 text-xs text-sky-100 transition-colors"
            >
              {dest.name} →
            </Link>
          ))}
        </div>

        <div className="flex justify-center gap-8 pt-4 text-center">
          {[
            { value: '4', label: 'Destinazioni' },
            { value: '500+', label: 'Esperienze' },
            { value: '4.8★', label: 'Rating medio' },
          ].map(stat => (
            <div key={stat.label}>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-sky-300 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
    </section>
  )
}
