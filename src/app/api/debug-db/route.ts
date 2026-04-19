import { NextResponse } from 'next/server'
import { getProductsFromDB, getSuppliersForProduct } from '@/lib/db'

export async function GET() {
  const products = await getProductsFromDB()
  const firstProduct = products[0]
  const suppliers = firstProduct ? await getSuppliersForProduct(firstProduct.id) : []

  return NextResponse.json({
    productsCount: products.length,
    firstProduct: firstProduct ? { id: firstProduct.id, nome: firstProduct.nome } : null,
    suppliersForFirst: suppliers,
    env: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'MISSING',
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'MISSING',
    }
  })
}
