import { ProdottoConSpiegazione } from '@/types/product'
import ProductCard from './ProductCard'

export default function ProductList({
  products,
}: {
  products: ProdottoConSpiegazione[]
}) {
  const top = products.slice(0, 1)
  const others = products.slice(1)

  return (
    <div className="flex flex-col gap-6">

      {/* TOP */}
      {top.length > 0 && (
        <div>
          <div className="mb-2 text-sm font-semibold text-green-700">
            ⭐ Migliore scelta
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3 text-sm text-green-800">
            Questo prodotto è il più adatto in base alla tua richiesta:
            compatibilità {top[0].score}/100.
          </div>

          <ProductCard product={top[0]} />
        </div>
      )}

      {/* ALTERNATIVE */}
      {others.length > 0 && (
        <div>
          <div className="mt-4 mb-2 text-sm font-semibold text-gray-500">
            Alternative
          </div>

          <div className="flex flex-col gap-4">
            {others.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
