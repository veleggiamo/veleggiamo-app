import { createClient } from '@supabase/supabase-js'
import { Prodotto } from '@/types/product'
import { Categoria } from '@/types/parsedQuery'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

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

function toProduct(row: any): Prodotto {
  const p = Array.isArray(row.products) ? row.products[0] : row.products
  if (!p) throw new Error('no product')
  const specs = (p.specs ?? {}) as Record<string, string | number>
  return {
    id: p.id,
    nome: p.nome,
    categoria: p.categoria as Categoria,
    marca: p.marca ?? '',
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
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('supplier_products')
      .select('product_id, prezzo, disponibile, products!product_id(id, nome, categoria, marca, specs)')
      .eq('disponibile', true)

    if (error) {
      console.error('[DB] getProductsFromDB error:', error.message)
      return []
    }
    if (!data || data.length === 0) return []

    const map = new Map<string, any>()
    for (const row of data) {
      const pid = row.product_id
      const existing = map.get(pid)
      if (!existing || (row.prezzo ?? 0) < (existing.prezzo ?? 0)) {
        map.set(pid, row)
      }
    }

    const result: Prodotto[] = []
    for (const row of map.values()) {
      try { result.push(toProduct(row)) } catch { /* skip malformed row */ }
    }
    return result
  } catch (e) {
    console.error('[DB] getProductsFromDB exception:', e)
    return []
  }
}

export async function getSuppliersForProduct(productId: string): Promise<FornitoreDB[]> {
  const supabase = getSupabase()

  const { data: spRows, error: spErr } = await supabase
    .from('supplier_products')
    .select('supplier_id, prezzo')
    .eq('product_id', productId)
    .eq('disponibile', true)

  console.log('[DB] getSuppliersForProduct productId:', productId)
  console.log('[DB] spRows:', JSON.stringify(spRows), 'error:', spErr?.message)

  if (!spRows || spRows.length === 0) return []

  const ids = spRows.map((r: any) => r.supplier_id)
  const prezzoMap = Object.fromEntries(spRows.map((r: any) => [r.supplier_id, r.prezzo]))

  const { data: suppliersData, error: sErr } = await supabase
    .from('suppliers')
    .select('id, nome, indirizzo, telefono, email, sito')
    .in('id', ids)

  console.log('[DB] suppliersData:', JSON.stringify(suppliersData), 'error:', sErr?.message)

  if (!suppliersData) return []

  return suppliersData.map((s: any) => ({
    id: s.id,
    nome: s.nome,
    indirizzo: s.indirizzo ?? '',
    telefono: s.telefono ?? '',
    email: s.email ?? '',
    sito: s.sito ?? undefined,
    distanzaKm: 0,
    prezzo: prezzoMap[s.id] ?? 0,
  }))
}
