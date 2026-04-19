import { NextRequest, NextResponse } from 'next/server'
import { search } from '@/services/searchService'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')

  if (!q || q.trim().length === 0) {
    return NextResponse.json({ error: 'Parametro q mancante' }, { status: 400 })
  }

  const risultati = await search(q.trim())
  return NextResponse.json(risultati)
}
