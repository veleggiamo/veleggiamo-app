import { Categoria } from './parsedQuery'

export interface Prodotto {
  id: string
  nome: string
  categoria: Categoria
  marca: string
  prezzo: number
  specs: Record<string, string | number>
  compatibilita: {
    lunghezzaMin: number
    lunghezzaMax: number
  }
  linkAcquisto: string
  immagine: string
}

export interface ProdottoConSpiegazione extends Prodotto {
  spiegazione: string
  score: number
  reasoning?: string
}
