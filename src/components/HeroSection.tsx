import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative w-full h-[70vh] min-h-[500px] flex items-center justify-center text-center overflow-hidden">
      {/* Video background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/images/amalfi/pexels-hellojoshwithers-27025482.jpg"
          className="w-full h-full object-cover"
        >
          <source src="/images/3391236-hd_1920_1080_30fps.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl px-6 text-white">
        <p className="text-sm font-semibold uppercase tracking-widest text-white/70 mb-4">
          500+ esperienze selezionate
        </p>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight drop-shadow-md">
          Le migliori gite in barca in Italia
        </h1>
        <p className="mt-4 text-lg md:text-xl text-white/90 max-w-xl mx-auto">
          Scopri esperienze selezionate tra Sicilia, Sardegna e Costiera Amalfitana
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/destinazioni"
            className="inline-block bg-white text-gray-900 font-semibold px-7 py-3 rounded-full hover:bg-gray-100 transition shadow-lg"
          >
            Scopri le destinazioni
          </Link>
          <Link
            href="/articoli"
            className="inline-block border border-white/50 text-white font-semibold px-7 py-3 rounded-full hover:bg-white/10 transition"
          >
            Leggi le guide
          </Link>
        </div>
      </div>
    </section>
  )
}
