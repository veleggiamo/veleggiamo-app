import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface Row {
  nome: string
  categoria: string
  marca: string
  prezzo: string
  disponibile: string
  [key: string]: string
}

function parseFile(buffer: ArrayBuffer, filename: string): Row[] {
  const isExcel = filename.endsWith('.xlsx') || filename.endsWith('.xls')

  if (isExcel) {
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    return XLSX.utils.sheet_to_json<Row>(sheet, { defval: '' })
  }

  const text = new TextDecoder().decode(buffer)
  const { data } = Papa.parse<Row>(text, { header: true, skipEmptyLines: true })
  return data
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const supplierId = formData.get('supplier_id') as string | null

  if (!file) return NextResponse.json({ error: 'File mancante' }, { status: 400 })
  if (!supplierId) return NextResponse.json({ error: 'supplier_id mancante' }, { status: 400 })

  const buffer = await file.arrayBuffer()
  const rows = parseFile(buffer, file.name)

  const results = { inserted: 0, updated: 0, errors: [] as string[] }

  for (const row of rows) {
    if (!row.nome) continue

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
      const baseFields = new Set(['nome', 'categoria', 'marca', 'prezzo', 'disponibile'])
      const specs: Record<string, string | number> = {}
      for (const [k, v] of Object.entries(row)) {
        if (!baseFields.has(k) && v !== '') {
          specs[k] = isNaN(Number(v)) ? v : Number(v)
        }
      }

      const { data: created, error } = await supabase
        .from('products')
        .insert({ nome: row.nome, categoria: row.categoria, marca: row.marca, specs })
        .select('id')
        .single()

      if (error || !created) {
        results.errors.push(`Errore creazione prodotto: ${row.nome}`)
        continue
      }
      productId = created.id
    }

    const { error: spError } = await supabase
      .from('supplier_products')
      .upsert(
        {
          supplier_id: supplierId,
          product_id: productId,
          prezzo: parseFloat(row.prezzo) || null,
          disponibile: String(row.disponibile).toLowerCase() !== 'false',
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
