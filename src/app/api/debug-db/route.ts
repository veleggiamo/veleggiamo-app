import { NextResponse } from 'next/server'
import { getProductsFromDB } from '@/lib/db'

export async function GET() {
  const products = await getProductsFromDB()
  return NextResponse.json({
    count: products.length,
    products: products.slice(0, 3).map(p => ({
      id: p.id,
      nome: p.nome,
      categoria: p.categoria,
      prezzo: p.prezzo,
    })),
    env: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'MISSING',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'MISSING',
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'MISSING',
    }
  })
}
