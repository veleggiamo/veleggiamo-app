export type Categoria = 'ancora' | 'autopilota' | 'energia'

export interface ParsedQuery {
  categoria: Categoria | null
  lunghezzaBarca: number | null
  rawQuery: string
  confidence: number
}
