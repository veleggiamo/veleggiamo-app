import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative w-full h-[70vh] min-h-[500px] flex items-center justify-center text-center">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-boat.jpg"
          alt="Gite in barca in Italia"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl px-6 text-white">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Le migliori gite in barca in Italia
        </h1>

        <p className="mt-4 text-lg md:text-xl text-white/90">
          Scopri esperienze selezionate tra Sicilia, Sardegna e Costiera Amalfitana
        </p>

        <div className="mt-8">
          <Link
            href="#esperienze"
            className="inline-block bg-white text-black font-semibold px-6 py-3 rounded-full hover:bg-gray-200 transition"
          >
            Scopri le migliori esperienze
          </Link>
        </div>
      </div>
    </section>
  )
}
