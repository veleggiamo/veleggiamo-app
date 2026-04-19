import { parse } from '@/lib/intentParser'
import { match } from '@/lib/matchingEngine'
import { products as productsMock } from '@/data/products'
import { stores } from '@/data/stores'
import { ParsedQuery } from '@/types/parsedQuery'
import { ProdottoConSpiegazione } from '@/types/product'
import { Negozio, RisultatoRicerca } from '@/types/searchResult'
import { getProductsFromDB, getSuppliersForProduct, searchProductsByName } from '@/lib/db'

export async function search(rawQuery: string): Promise<RisultatoRicerca> {
  const parsed = parse(rawQuery)
  const enriched = parsed
  const nearbyStores = stores

  // Ricerca per nome prodotto specifico
  const nameMatches = await searchProductsByName(rawQuery)
  if (nameMatches.length > 0) {
    const results = await Promise.all(
      nameMatches.map(async (p) => {
        const fornitoriDB = await getSuppliersForProduct(p.id)
        return {
          ...p,
          score: 100,
          spiegazione: `Prodotto trovato: ${p.nome}`,
          reasoning: `Corrispondenza diretta con il prodotto cercato`,
          fornitoriDB,
        } as ProdottoConSpiegazione
      })
    )
    return { query: rawQuery, parsedQuery: enriched, results, stores: nearbyStores }
  }

  const dbProducts = await getProductsFromDB()
  const products = dbProducts.length > 0 ? dbProducts : productsMock

  const matched = match(enriched, products)

  const ranked = [...matched].sort((a, b) => {
    const isOutOfRange = (s: ProdottoConSpiegazione) =>
      s.spiegazione.includes('fuori') || s.spiegazione.includes('sotto') || s.spiegazione.includes('sovra')
    const aTier = isOutOfRange(a) ? 0 : 1
    const bTier = isOutOfRange(b) ? 0 : 1
    if (bTier !== aTier) return bTier - aTier
    return b.score - a.score
  })

  if (ranked.length > 1) {
    const best = ranked[0]
    const second = ranked[1]
    if (best.score - second.score >= 10) {
      if (enriched.categoria === 'ancora') {
        const bestPeso = best.specs.peso as number
        const secondPeso = second.specs.peso as number
        const ideale = enriched.lunghezzaBarca ?? 10
        const diffBest = Math.abs(bestPeso - ideale)
        const diffSecond = Math.abs(secondPeso - ideale)

        const confronto = diffBest < diffSecond
          ? ' — più vicino al peso ideale rispetto alle alternative'
          : ' — migliore compromesso tra tenuta e maneggevolezza'

        const tipoLabels: Record<string, string> = {
          rocna: ' — ottimo grip su fondali misti',
          bruce: ' — ottimo grip su fondali misti',
          delta: ' — eccellente su sabbia e fango',
          cqr: ' — eccellente su sabbia e fango',
          danforth: ' — leggera e facile da stivare',
        }
        const tipo = (best.specs.tipo as string)?.toLowerCase() ?? ''
        const tipoLabel = tipoLabels[tipo] ?? ''

        const materiale = (best.specs.materiale as string)?.toLowerCase() ?? ''
        const usoConsigliato = (best.specs.usoConsigliato as string)?.toLowerCase() ?? ''
        const extraLabel =
          materiale.includes('inox') ? ' — resistente alla corrosione, ideale per uso intensivo' :
          materiale.includes('zincato') || materiale.includes('galvanizzato') ? ' — buona protezione con costo contenuto' :
          usoConsigliato.includes('fondali difficili') ? ' — adatta a condizioni impegnative' :
          usoConsigliato.includes('crociera') ? ' — bilanciata per uso generale' :
          ''

        best.reasoning = (best.reasoning ?? '') + confronto + tipoLabel + extraLabel
      } else if (enriched.categoria === 'energia') {
        const bestAh = best.specs.capacitaAh as number
        const secondAh = second.specs.capacitaAh as number
        if (bestAh >= secondAh * 1.2) {
          best.reasoning = (best.reasoning ?? '') + ' — maggiore autonomia rispetto alla seconda opzione'
        }
      } else if (enriched.categoria === 'autopilota') {
        if (best.score >= 90 && second.score < 80) {
          best.reasoning = (best.reasoning ?? '') + ' — più adatto rispetto alla seconda opzione'
        }
      }
    }
  }

  // Personalizzazione utente (TASK 29)
  if (ranked.length > 0 && enriched.lunghezzaBarca) {
    const best = ranked[0]
    const lung = enriched.lunghezzaBarca
    const categoria = enriched.categoria

    let personalizzazione = ''

    if (categoria === 'ancora') {
      personalizzazione = ` — adatta a una barca di ${lung}m`
    } else if (categoria === 'autopilota') {
      personalizzazione = ` — ideale per mantenere la rotta su una barca di ${lung}m`
    } else if (categoria === 'energia') {
      personalizzazione = ` — adeguata per i consumi tipici di una barca di ${lung}m`
    }

    best.reasoning = (best.reasoning ?? '') + personalizzazione
  }

  // TASK 31 — Profilo utente implicito (solo ancora)
  if (enriched.categoria === 'ancora' && ranked.length > 0) {
    const best = ranked[0]
    const queryText = enriched.rawQuery.toLowerCase()

    let profilo: 'crociera' | 'regata' | 'impegnativo' | 'generale' = 'generale'

    if (
      queryText.includes('crociera') ||
      queryText.includes('tranquilla') ||
      queryText.includes('familiare')
    ) {
      profilo = 'crociera'
    } else if (
      queryText.includes('regata') ||
      queryText.includes('veloce') ||
      queryText.includes('leggera')
    ) {
      profilo = 'regata'
    } else if (
      queryText.includes('fondali') ||
      queryText.includes('fango') ||
      queryText.includes('roccia')
    ) {
      profilo = 'impegnativo'
    }

    if (profilo === 'crociera') {
      best.reasoning = (best.reasoning ?? '') + ' — scelta ideale per una crociera tranquilla e sicura'
    } else if (profilo === 'regata') {
      best.reasoning = (best.reasoning ?? '') + ' — più adatta a chi cerca leggerezza e prestazioni'
    } else if (profilo === 'impegnativo') {
      best.reasoning = (best.reasoning ?? '') + ' — indicata per ancoraggi in condizioni difficili'
    } else {
      best.reasoning = (best.reasoning ?? '') + ' — buona scelta per uso generale'
    }
  }

  // arricchisci con fornitori DB (solo se stiamo usando dati DB)
  if (dbProducts.length > 0) {
    await Promise.all(
      ranked.map(async (p) => {
        p.fornitoriDB = await getSuppliersForProduct(p.id)
      })
    )
  }

  return {
    query: rawQuery,
    parsedQuery: enriched,
    results: ranked,
    stores: nearbyStores,
  }
}
