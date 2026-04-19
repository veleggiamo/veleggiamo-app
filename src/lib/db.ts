import { createClient } from '@supabase/supabase-js'
import { Prodotto } from '@/types/product'
import { Categoria } from '@/types/parsedQuery'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface FornitoreDB {
  id: string
  nome: string
  indirizzo: string
  telefono: string
  email: string
  sito?: string
  distanzaKm: number
  prezzo: number
}

// Converte un record Supabase in Prodotto compatibile col motore
function toProduct(row: {
  product_id: string
  prezzo: number | null
  products: {
    id: string
    nome: string
    categoria: string
    marca: string
    specs: Record<string, unknown> | null
  }
}): Prodotto {
  const specs = (row.products.specs ?? {}) as Record<string, string | number>
  return {
    id: row.products.id,
    nome: row.products.nome,
    categoria: row.products.categoria as Categoria,
    marca: row.products.marca ?? '',
    prezzo: row.prezzo ?? 0,
    specs,
    compatibilita: {
      lunghezzaMin: (specs.lunghezzaMin as number) ?? 6,
      lunghezzaMax: (specs.lunghezzaMax as number) ?? 15,
    },
    linkAcquisto: (specs.linkAcquisto as string) ?? '',
    immagine: (specs.immagine as string) ?? '',
  }
}

export async function getProductsFromDB(): Promise<Prodotto[]> {
  const { data, error } = await supabase
    .from('supplier_products')
    .select(`
      product_id,
      prezzo,
      disponibile,
      products (id, nome, categoria, marca, specs)
    `)
    .eq('disponibile', true)

  if (error || !data || data.length === 0) return []

  // deduplicazione: un prodotto può avere più fornitori, prendi prezzo minimo
  const map = new Map<string, typeof data[0]>()
  for (const row of data) {
    const existing = map.get(row.product_id)
    if (!existing || (row.prezzo ?? 0) < (existing.prezzo ?? 0)) {
      map.set(row.product_id, row)
    }
  }

  return Array.from(map.values()).map(toProduct)
}

export async function getSuppliersForProduct(productId: string): Promise<FornitoreDB[]> {
  const { data, error } = await supabase
    .from('supplier_products')
    .select(`
      prezzo,
      suppliers (id, nome, indirizzo, telefono, email, sito)
    `)
    .eq('product_id', productId)
    .eq('disponibile', true)

  if (error || !data) return []

  return data
    .filter(row => row.suppliers)
    .map(row => ({
      id: (row.suppliers as any).id,
      nome: (row.suppliers as any).nome,
      indirizzo: (row.suppliers as any).indirizzo ?? '',
      telefono: (row.suppliers as any).telefono ?? '',
      email: (row.suppliers as any).email ?? '',
      sito: (row.suppliers as any).sito ?? undefined,
      distanzaKm: 0,
      prezzo: row.prezzo ?? 0,
    }))
}
