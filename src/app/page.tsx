'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SearchBar from '@/components/SearchBar'

const esempi = ['ancora 10m', 'autopilota 12m', 'batteria 9m crociera']

export default function Home() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleEsempio = (testo: string) => {
    router.push(`/risultati?q=${encodeURIComponent(testo)}`)
  }

  return (
    <main className="min-h-screen bg-white px-6 py-16">

      {/* HERO */}
      <section className="max-w-3xl mx-auto text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Scegli l'attrezzatura giusta per la tua barca
        </h1>
        <p className="text-lg text-gray-500">
          Inserisci lunghezza e utilizzo. Ti diciamo cosa scegliere e perché.
        </p>

        <SearchBar initialQuery={query} />

        <div className="flex flex-wrap justify-center gap-2">
          {esempi.map((e) => (
            <button
              key={e}
              onClick={() => handleEsempio(e)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm px-3 py-1.5 rounded-full transition"
            >
              {e}
            </button>
          ))}
        </div>
      </section>

      {/* COME FUNZIONA */}
      <section className="mt-20 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        {[
          { step: '1', titolo: 'Inserisci la tua barca', desc: 'Lunghezza e tipo di utilizzo' },
          { step: '2', titolo: 'Analizziamo le opzioni', desc: 'Confronto tecnico sui prodotti disponibili' },
          { step: '3', titolo: 'Ti consigliamo', desc: 'Scelta chiara con spiegazione' },
        ].map(({ step, titolo, desc }) => (
          <div key={step} className="space-y-2">
            <div className="text-3xl font-bold text-blue-600">{step}</div>
            <h3 className="font-semibold text-gray-900">{titolo}</h3>
            <p className="text-sm text-gray-500">{desc}</p>
          </div>
        ))}
      </section>

      {/* PERCHÉ È DIVERSO */}
      <section className="mt-20 max-w-2xl mx-auto text-center space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Perché è diverso?</h2>
        <ul className="text-sm text-gray-500 space-y-1">
          <li>— Niente cataloghi infiniti da sfogliare</li>
          <li>— Spiegazioni tecniche in linguaggio chiaro</li>
          <li>— Scelta guidata in base alla tua barca</li>
        </ul>
      </section>

    </main>
  )
}
