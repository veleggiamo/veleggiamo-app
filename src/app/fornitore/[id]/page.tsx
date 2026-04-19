import { createClient } from '@supabase/supabase-js'
import { products as productsMock } from '@/data/products'
import FornitoreForm from '@/components/FornitoreForm'
import Link from 'next/link'

async function getFornitore(id: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await supabase
    .from('suppliers')
    .select('id, nome, indirizzo, telefono, email')
    .eq('id', id)
    .maybeSingle()
  return data
}

export default async function FornitoreePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ product?: string }>
}) {
  const { id } = await params
  const { product: productId } = await searchParams

  const fornitore = await getFornitore(id)
  const prodotto = productId ? productsMock.find(p => p.id === productId) : null

  if (!fornitore) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 mb-2">Fornitore non trovato</div>
          <Link href="/" className="text-blue-600 hover:underline text-sm">← Torna alla ricerca</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-xl mx-auto flex flex-col gap-8">

        <a href="/risultati" className="text-sm text-gray-400 hover:text-gray-600">
          ← Torna ai risultati
        </a>

        {/* SCHEDA FORNITORE */}
        <div className="border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{fornitore.nome}</h1>
            <p className="text-sm text-gray-500 mt-1">{fornitore.indirizzo}</p>
          </div>

          <div className="flex flex-col gap-2">
            <a
              href={`tel:${fornitore.telefono}`}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition"
            >
              <span className="text-lg">📞</span>
              <div>
                <div className="text-xs text-gray-400">Telefono</div>
                <div className="text-sm font-medium text-gray-900">{fornitore.telefono}</div>
              </div>
            </a>

            <a
              href={`mailto:${fornitore.email}`}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition"
            >
              <span className="text-lg">✉️</span>
              <div>
                <div className="text-xs text-gray-400">Email</div>
                <div className="text-sm font-medium text-gray-900">{fornitore.email}</div>
              </div>
            </a>
          </div>
        </div>

        {/* FORM RICHIESTA */}
        <div className="border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Richiedi disponibilità</h2>
          <FornitoreForm
            fornitoreId={id}
            fornitoreNome={fornitore.nome}
            prodottoId={productId ?? null}
            prodottoNome={prodotto?.nome ?? null}
          />
        </div>

      </div>
    </main>
  )
}
