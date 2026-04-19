import { ParsedQuery } from '@/types/parsedQuery'
import { Prodotto, ProdottoConSpiegazione } from '@/types/product'
import { boatRules } from '@/constants/boatRules'

export function match(
  query: ParsedQuery,
  products: Prodotto[]
): ProdottoConSpiegazione[] {
  const strategies: Record<string, (q: ParsedQuery, p: Prodotto[]) => ProdottoConSpiegazione[]> = {
    ancora: matchAncora,
    autopilota: matchAutopilota,
    energia: matchEnergia,
  }
  return strategies[query.categoria ?? '']?.(query, products) ?? []
}

function resolveLunghezza(query: ParsedQuery) {
  const isStima = query.lunghezzaBarca === null
  const valore = query.lunghezzaBarca ?? 10
  const label = `${valore}m`
  return { valore, label, isStima }
}

function applyConfidence(
  product: Prodotto,
  score: number,
  spiegazione: string,
  reasoning: string,
  query: ParsedQuery
): ProdottoConSpiegazione {
  const confidenceBassa = query.confidence < 0.5
  return {
    ...product,
    score: confidenceBassa ? Math.round(score * 0.7) : score,
    spiegazione: confidenceBassa ? `${spiegazione} — stima basata su informazioni incomplete.` : spiegazione,
    reasoning,
  }
}

function matchAncora(query: ParsedQuery, products: Prodotto[]): ProdottoConSpiegazione[] {
  const { valore, label, isStima } = resolveLunghezza(query)
  const pesoIdeale = valore
  const tolleranza = pesoIdeale * 0.2
  const min = pesoIdeale - tolleranza
  const max = pesoIdeale + tolleranza
  const risultati: ProdottoConSpiegazione[] = []

  for (const product of products) {
    if (product.categoria !== 'ancora') continue

    const pesoRaw = product.specs.peso
    const peso = typeof pesoRaw === 'number' && !isNaN(pesoRaw) ? pesoRaw : null
    let score = 0
    let spiegazione = ''
    let reasoning = ''

    if (peso === null) {
      score = 40
      spiegazione = `Ancora compatibile con barca da ${label} — verifica il peso con il fornitore`
      reasoning = `Prodotto disponibile per barca da ${valore}m`
      risultati.push(applyConfidence(product, score, spiegazione, reasoning, query))
      continue
    }

    if (peso >= min && peso <= max) {
      const distanza = Math.abs(peso - pesoIdeale) / tolleranza
      score = Math.round(100 - distanza * 30)
      const stimaLabel = isStima ? ' (stima su barca da 10m)' : ''
      spiegazione = [
        `Peso: ${peso} kg`,
        `Ideale per: barca da ${label}${stimaLabel}`,
        `Valutazione: ${peso >= pesoIdeale * 0.9 && peso <= pesoIdeale * 1.1 ? 'ottima tenuta' : 'buona tenuta in condizioni standard'}`
      ].join(' • ')
      reasoning = `Per una barca da ${valore}m, un'ancora da ${peso}kg offre un buon equilibrio tra tenuta e facilità di recupero, risultando adatta alla maggior parte degli ancoraggi in crociera.`
    } else {
      const distanzaEsterna = Math.abs(peso - pesoIdeale) / pesoIdeale
      score = Math.round(Math.max(10, 60 - distanzaEsterna * 100))
      spiegazione = peso < pesoIdeale
        ? `Ancora da ${peso}kg: sottodimensionata per barca da ${label}. Potrebbe compromettere la tenuta in condizioni di vento o fondali difficili.`
        : `Ancora da ${peso}kg: sovradimensionata per barca da ${label}. Funziona ma aggiunge peso inutile e può complicare la manovra.`
      reasoning = peso < pesoIdeale
        ? `Un'ancora da ${peso}kg può risultare leggera per una barca di ${valore}m, soprattutto con vento o fondali difficili, riducendo la sicurezza all'ancoraggio.`
        : `Un'ancora da ${peso}kg garantisce ottima tenuta, ma è più pesante del necessario per una barca di ${valore}m e può rendere le manovre meno pratiche.`
    }

    if (score > 0) risultati.push(applyConfidence(product, score, spiegazione, reasoning, query))
  }

  return risultati
}

function matchAutopilota(query: ParsedQuery, products: Prodotto[]): ProdottoConSpiegazione[] {
  const { valore, label, isStima } = resolveLunghezza(query)
  const tipoRichiesto = boatRules.autopilota.tipi.find(t => valore <= t.maxLength)?.tipo ?? 'idraulico'
  const risultati: ProdottoConSpiegazione[] = []

  for (const product of products) {
    if (product.categoria !== 'autopilota') continue

    const tipoProdotto = product.specs.tipo as string
    const compatibile = (
      (tipoRichiesto === 'timoneria' && tipoProdotto === 'cockpit') ||
      (tipoRichiesto === 'cockpit' && tipoProdotto === 'idraulico')
    )
    let score = 0
    let spiegazione = ''
    let reasoning = ''

    if (tipoProdotto === tipoRichiesto) {
      reasoning = 'Sistema correttamente dimensionato per questa lunghezza'
    } else if (compatibile) {
      reasoning = 'Sistema più potente del necessario rispetto alle alternative'
    } else {
      reasoning = 'Sistema meno adatto rispetto ad altre opzioni disponibili'
    }

    if (tipoProdotto === tipoRichiesto) {
      score = 100
      spiegazione = [
        `Tipo: ${tipoRichiesto}`,
        `Adatto per: barca da ${label}`,
        `Uso consigliato: crociera standard`
      ].join(' • ')
    } else if (compatibile) {
      score = 70
      spiegazione = `Autopilota ${tipoProdotto}: compatibile ma sovradimensionato per barca da ${label}. Funziona ma è pensato per barche più grandi.`
    } else {
      score = 30
      spiegazione = `Autopilota ${tipoProdotto}: non adatto per barca da ${label}. Tipo richiesto: ${tipoRichiesto}.`
    }

    if (isStima && spiegazione) spiegazione += ' — stima su barca da 10m.'
    if (score > 0) risultati.push(applyConfidence(product, score, spiegazione, reasoning, query))
  }

  return risultati
}

function matchEnergia(query: ParsedQuery, products: Prodotto[]): ProdottoConSpiegazione[] {
  const { valore, label, isStima } = resolveLunghezza(query)
  const minAh = valore * boatRules.energia.ahPerMetro * boatRules.energia.fattoreSicurezza
  const baselineAh = valore * boatRules.energia.ahPerMetro
  const risultati: ProdottoConSpiegazione[] = []

  for (const product of products) {
    if (product.categoria !== 'energia') continue

    const capacita = product.specs.capacitaAh as number
    let score = 0
    const reasoning = capacita >= baselineAh
      ? 'Garantisce autonomia adeguata per crociera'
      : capacita >= minAh
      ? 'Autonomia limitata rispetto alle alternative'
      : 'Capacità insufficiente per utilizzo continuo'

    if (capacita >= baselineAh) score = 100
    else if (capacita >= minAh) score = 70
    else score = 30

    const spiegazione = [
      `Capacità: ${capacita} Ah`,
      `Minimo richiesto: ${minAh} Ah`,
      `Valutazione: ${capacita >= minAh * 0.95 ? 'sufficiente per crociera' : 'da verificare consumi'}`
    ].join(' • ') + (isStima ? ' — stima su barca da 10m.' : '')

    if (score > 0) risultati.push(applyConfidence(product, score, spiegazione, reasoning, query))
  }

  return risultati
}
