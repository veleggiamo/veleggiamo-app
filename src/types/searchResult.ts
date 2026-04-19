import { ParsedQuery } from './parsedQuery'
import { ProdottoConSpiegazione } from './product'

export interface Negozio {
  id: string
  nome: string
  lat: number
  lng: number
}

export interface RisultatoRicerca {
  query: string
  parsedQuery: ParsedQuery
  results: ProdottoConSpiegazione[]
  stores: Negozio[]
}
