import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface CsvRow {
  nome: string
  categoria: string
  marca: string
  prezzo: string
  disponibile: string
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const supplierId = formData.get('supplier_id') as string | null

  if (!file) return NextResponse.json({ error: 'File mancante' }, { status: 400 })
  if (!supplierId) return NextResponse.json({ error: 'supplier_id mancante' }, { status: 400 })

  const text = await file.text()

  const { data, errors } = Papa.parse<CsvRow>(text, {
    header: true,
    skipEmptyLines: true,
  })

  if (errors.length > 0) {
    return NextResponse.json({ error: 'CSV non valido', details: errors }, { status: 400 })
  }

  const results = { inserted: 0, updated: 0, errors: [] as string[] }

  for (const row of data) {
    if (!row.nome) continue

    // trova o crea il prodotto
    let productId: string

    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('nome', row.nome)
      .eq('marca', row.marca ?? '')
      .maybeSingle()

    if (existing) {
      productId = existing.id
    } else {
      const { data: created, error } = await supabase
        .from('products')
        .insert({ nome: row.nome, categoria: row.categoria, marca: row.marca })
        .select('id')
        .single()

      if (error || !created) {
        results.errors.push(`Errore creazione prodotto: ${row.nome}`)
        continue
      }
      productId = created.id
    }

    // crea o aggiorna supplier_products
    const { error: spError } = await supabase
      .from('supplier_products')
      .upsert(
        {
          supplier_id: supplierId,
          product_id: productId,
          prezzo: parseFloat(row.prezzo) || null,
          disponibile: row.disponibile?.toLowerCase() !== 'false',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'supplier_id,product_id' }
      )

    if (spError) {
      results.errors.push(`Errore salvataggio: ${row.nome}`)
    } else {
      existing ? results.updated++ : results.inserted++
    }
  }

  return NextResponse.json({ ok: true, ...results })
}
