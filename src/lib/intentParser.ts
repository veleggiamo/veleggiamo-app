import { ParsedQuery, Categoria } from '../types/parsedQuery'

export function parse(rawQuery: string): ParsedQuery {
  const lower = rawQuery.toLowerCase().trim()
  const lunghezzaBarca = extractLunghezza(lower)
  const categoria = extractCategoria(lower)

  const confidence =
    lunghezzaBarca !== null && categoria !== null ? 1 :
    lunghezzaBarca !== null || categoria !== null ? 0.5 : 0

  return { categoria, lunghezzaBarca, rawQuery, confidence }
}

function extractLunghezza(query: string): number | null {
  const metri = query.match(/(\d+(?:\.\d+)?)\s*(?:m|metri|mt)\b/)
  if (metri) return parseFloat(metri[1])

  const piedi = query.match(/(\d+(?:\.\d+)?)\s*(?:ft|feet|piedi|piede|')\b/)
  if (piedi) return Math.round(parseFloat(piedi[1]) * 0.3048 * 10) / 10

  return null
}

function extractCategoria(query: string): Categoria | null {
  if (/ancora|anchor|ancoraggio/.test(query)) return 'ancora'
  if (/autopilot|pilota\s*auto|pilota\s+automatico/.test(query)) return 'autopilota'
  if (/batter|solar|energia|pannello/.test(query)) return 'energia'
  return null
}
