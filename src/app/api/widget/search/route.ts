import { NextRequest, NextResponse } from 'next/server'
import { search } from '@/services/searchService'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = searchParams.get('q') ?? ''
  const supplierId = searchParams.get('sid') ?? ''

  if (!q) return NextResponse.json({ results: [] })

  const data = await search(q)

  const results = data.results.map(p => {
    const fornitori = p.fornitoriDB ?? []
    const thisSupplier = fornitori.find(f => f.id === supplierId)
    return {
      id: p.id,
      nome: p.nome,
      marca: p.marca,
      categoria: p.categoria,
      prezzo: p.prezzo,
      score: p.score,
      immagine: p.immagine,
      reasoning: p.reasoning,
      fornitore: thisSupplier ?? fornitori[0] ?? null,
      altriFornitoriCount: fornitori.length - 1,
    }
  }).sort((a, b) => {
    // fornitore richiedente primo
    const aHas = a.fornitore?.id === supplierId ? 1 : 0
    const bHas = b.fornitore?.id === supplierId ? 1 : 0
    return bHas - aHas || b.score - a.score
  })

  return NextResponse.json(
    { results },
    { headers: { 'Access-Control-Allow-Origin': '*' } }
  )
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    },
  })
}
