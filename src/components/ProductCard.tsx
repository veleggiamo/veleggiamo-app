'use client'

import { ProdottoConSpiegazione } from '@/types/product'
import { suppliersByProduct, fornitori } from '@/data/suppliers'

const USER_MATCH_KEYWORDS = ['barca di', 'crociera', 'regata', 'uso']

function parseReasoning(reasoning: string) {
  const parts = reasoning.split(' — ').map(p => p.trim()).filter(Boolean)
  const mainReasoning = parts[0] ?? ''
  const rest = parts.slice(1)

  const technicalPoints: string[] = []
  let userMatch: string | null = null

  for (const part of rest) {
    if (USER_MATCH_KEYWORDS.some(kw => part.toLowerCase().includes(kw))) {
      if (!userMatch) userMatch = part
    } else {
      technicalPoints.push(part)
    }
  }

  return { mainReasoning, technicalPoints, userMatch }
}

export default function ProductCard({ product }: { product: ProdottoConSpiegazione }) {
  const getLevel = (score: number) => {
    if (score >= 80) return { label: 'Ottimo', bg: 'bg-green-100 text-green-700' }
    if (score >= 60) return { label: 'Adatto', bg: 'bg-yellow-100 text-yellow-700' }
    return { label: 'Critico', bg: 'bg-red-100 text-red-700' }
  }

  const level = getLevel(product.score)
  const parsed = product.reasoning ? parseReasoning(product.reasoning) : null
  const fornitoriProdotto = product.fornitoriDB && product.fornitoriDB.length > 0
    ? product.fornitoriDB
    : (suppliersByProduct[product.id] ?? []).map(f => ({
        ...fornitori[f.fornitoreId],
        distanzaKm: f.distanzaKm,
        prezzo: f.prezzo,
      })).filter(f => f.id)
  const isCritico = product.score < 60
  const reasoningIcon = isCritico ? '❗' : '✔'
  const reasoningStyle = isCritico
    ? 'text-sm font-semibold text-red-700'
    : 'text-sm font-semibold text-gray-900'

  return (
    <div className={`border rounded-xl overflow-hidden shadow-sm bg-white flex flex-row ${
      product.score >= 80 ? 'border-green-200' :
      product.score >= 60 ? 'border-yellow-200' :
      'border-red-200'
    }`}>

      {/* CONTENUTO SINISTRA */}
      <div className="flex-1 p-4 flex flex-col gap-2">

        {/* NOME + BADGE inline */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-lg font-semibold text-gray-900">{product.nome}</div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${level.bg}`}>
            {level.label}
          </span>
        </div>
        <div className="text-sm text-gray-400">{product.marca} · Compatibilità: {product.score}/100</div>

        {/* REASONING */}
        {parsed && (
          <div className="flex flex-col gap-1 mt-1">
            <div className={reasoningStyle}>
              {reasoningIcon} {parsed.mainReasoning}
            </div>
            {parsed.technicalPoints.length > 0 && (
              <ul className="flex flex-col gap-0.5">
                {parsed.technicalPoints.map((point, i) => (
                  <li key={i} className="text-xs text-gray-400">· {point}</li>
                ))}
              </ul>
            )}
            {parsed.userMatch && (
              <span className="inline-flex items-center gap-1 self-start mt-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                ⚓ {parsed.userMatch}
              </span>
            )}
          </div>
        )}

        {/* SPIEGAZIONE */}
        <div className="text-xs text-gray-400 leading-relaxed">
          {product.spiegazione.split(' • ').map((item, i) => (
            <div key={i}>· {item}</div>
          ))}
        </div>

        {/* PREZZO + BOTTONE */}
        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center gap-4">
          <div className="text-base font-semibold text-gray-900">
            {product.prezzo ? `€${product.prezzo}` : ''}
          </div>
          <a
            href={product.linkAcquisto}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            Scopri prodotto →
          </a>
        </div>

        {/* FORNITORI */}
        {fornitoriProdotto.length > 0 && (
          <div className="pt-3 border-t border-gray-100">
            <div className="text-xs font-medium text-gray-500 mb-2">Disponibile presso:</div>
            <ul className="flex flex-col gap-1.5">
              {fornitoriProdotto.map((f, i) => (
                <li key={i} className="flex items-center justify-between text-xs">
                  <span className="text-gray-700">
                    {f.nome} <span className="text-gray-400">· {f.distanzaKm} km</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900">€{f.prezzo}</span>
                    <a
                      href={`/fornitore/${f.id}?product=${product.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Contatta →
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>

      {/* IMMAGINE DESTRA */}
      <div className="w-80 min-h-[320px] shrink-0 bg-gray-50 flex items-center justify-center overflow-hidden border-l border-gray-100">
        {product.immagine ? (
          <img
            src={product.immagine}
            alt={product.nome}
            className="w-full h-full object-contain p-4"
            onError={(e) => {
              const t = e.currentTarget
              t.style.display = 'none'
              t.nextElementSibling!.removeAttribute('hidden')
            }}
          />
        ) : null}
        <span hidden={!!product.immagine} className="text-gray-300 text-sm text-center px-4">📷 Nessuna immagine</span>
      </div>

    </div>
  )
}
