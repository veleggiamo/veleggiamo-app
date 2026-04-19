import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSuppliersForProduct } from '@/lib/db'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const productId = '633417ec-cb4d-4348-bfa9-26ccc87fb091'

  // test 1: tutti i supplier_products senza filtri
  const { data: all, error: e1 } = await supabase
    .from('supplier_products')
    .select('supplier_id, product_id, disponibile, prezzo')

  // test 2: filtro per product_id
  const { data: byProduct, error: e2 } = await supabase
    .from('supplier_products')
    .select('supplier_id, prezzo, disponibile')
    .eq('product_id', productId)

  // test 3: tutti i suppliers
  const { data: allSuppliers, error: e3 } = await supabase
    .from('suppliers')
    .select('id, nome')

  const suppliersViaFunction = await getSuppliersForProduct(productId)

  return NextResponse.json({
    allSupplierProducts: { count: all?.length ?? 0, error: e1?.message, sample: all?.slice(0, 2) },
    byProductId: { count: byProduct?.length ?? 0, error: e2?.message, data: byProduct },
    allSuppliers: { count: allSuppliers?.length ?? 0, error: e3?.message, data: allSuppliers },
    suppliersViaFunction,
  })
}
