'use client'

import { ProdottoConSpiegazione } from '@/types/product'
import { suppliersByProduct, fornitori } from '@/data/suppliers'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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

function scoreBadge(score: number) {
  if (score >= 80) return { label: 'Ottimo', variant: 'success' as const }
  if (score >= 60) return { label: 'Adatto', variant: 'warning' as const }
  return { label: 'Critico', variant: 'destructive' as const }
}

export default function ProductCard({ product }: { product: ProdottoConSpiegazione }) {
  const { label, variant } = scoreBadge(product.score)
  const parsed = product.reasoning ? parseReasoning(product.reasoning) : null
  const fornitoriProdotto = product.fornitoriDB && product.fornitoriDB.length > 0
    ? product.fornitoriDB
    : (suppliersByProduct[product.id] ?? []).map(f => ({
        ...fornitori[f.fornitoreId],
        distanzaKm: f.distanzaKm,
        prezzo: f.prezzo,
      })).filter(f => f.id)

  const isCritico = product.score < 60

  const borderColor = product.score >= 80
    ? 'border-green-200'
    : product.score >= 60
    ? 'border-yellow-200'
    : 'border-red-200'

  return (
    <Card className={`overflow-hidden flex flex-row ${borderColor}`}>

      {/* CONTENUTO SINISTRA */}
      <div className="flex-1 flex flex-col gap-2 p-5">

        {/* NOME + BADGE */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base font-semibold text-gray-900">{product.nome}</span>
          <Badge variant={variant}>{label}</Badge>
        </div>

        <p className="text-xs text-gray-400">
          {product.marca} · Compatibilità: {product.score}/100
        </p>

        {/* REASONING */}
        {parsed && (
          <div className="flex flex-col gap-1 mt-1">
            <p className={`text-sm font-semibold ${isCritico ? 'text-red-700' : 'text-gray-900'}`}>
              {isCritico ? '❗' : '✔'} {parsed.mainReasoning}
            </p>
            {parsed.technicalPoints.length > 0 && (
              <ul className="flex flex-col gap-0.5">
                {parsed.technicalPoints.map((point, i) => (
                  <li key={i} className="text-xs text-gray-400">· {point}</li>
                ))}
              </ul>
            )}
            {parsed.userMatch && (
              <Badge variant="default" className="self-start mt-1 bg-blue-50 text-blue-700">
                ⚓ {parsed.userMatch}
              </Badge>
            )}
          </div>
        )}

        {/* SPIEGAZIONE */}
        <div className="text-xs text-gray-400 leading-relaxed">
          {product.spiegazione.split(' • ').map((item, i) => (
            <div key={i}>· {item}</div>
          ))}
        </div>

        {/* PREZZO + CTA */}
        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center gap-3 flex-wrap">
          {product.prezzo ? (
            <span className="text-base font-bold text-gray-900">€{product.prezzo}</span>
          ) : null}
          {product.linkAcquisto && (
            <Button size="sm" asChild>
              <a href={product.linkAcquisto} target="_blank" rel="noopener noreferrer">
                Scopri prodotto →
              </a>
            </Button>
          )}
        </div>

        {/* FORNITORI */}
        {fornitoriProdotto.length > 0 && (
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-400 mb-2">Disponibile presso:</p>
            <ul className="flex flex-col gap-1.5">
              {fornitoriProdotto.map((f, i) => (
                <li key={i} className="flex items-center justify-between text-xs">
                  <span className="text-gray-700">
                    {f.nome} <span className="text-gray-400">· {f.distanzaKm} km</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900">€{f.prezzo}</span>
                    <Button size="sm" variant="outline" asChild>
                      <a href={`/fornitore/${f.id}?product=${product.id}`}>
                        Contatta →
                      </a>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* IMMAGINE DESTRA */}
      <div className="w-72 shrink-0 bg-gray-50 flex items-center justify-center overflow-hidden border-l border-gray-100 min-h-[280px]">
        {product.immagine ? (
          <img
            src={product.immagine}
            alt={product.nome}
            className="w-full h-full object-contain p-4"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              const next = e.currentTarget.nextElementSibling as HTMLElement | null
              if (next) next.hidden = false
            }}
          />
        ) : null}
        <span hidden={!!product.immagine} className="text-gray-300 text-xs text-center px-4">
          📷 Nessuna immagine
        </span>
      </div>

    </Card>
  )
}
