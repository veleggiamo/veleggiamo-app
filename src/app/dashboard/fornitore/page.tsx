'use client'

import { useState, useEffect } from 'react'
import { useUser, UserButton } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Product {
  id: string
  nome: string
  categoria: string
  marca: string
  prezzo: number | null
  disponibile: boolean
}

export default function DashboardFornitore() {
  const { user, isLoaded } = useUser()
  const [supplierId, setSupplierId] = useState<string | null>(null)
  const [supplierNome, setSupplierNome] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ ok?: boolean; inserted?: number; updated?: number; errors?: string[] } | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  useEffect(() => {
    if (!isLoaded || !user) return
    const email = user.primaryEmailAddress?.emailAddress
    if (!email) return

    supabase
      .from('suppliers')
      .select('id, nome')
      .eq('email', email)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setSupplierId(data.id)
          setSupplierNome(data.nome)
          loadProducts(data.id)
        }
      })
  }, [isLoaded, user])

  async function loadProducts(sid: string) {
    setLoadingProducts(true)
    const { data } = await supabase
      .from('supplier_products')
      .select('prezzo, disponibile, products(id, nome, categoria, marca)')
      .eq('supplier_id', sid)
      .order('updated_at', { ascending: false })

    if (data) {
      setProducts(data.map((row: any) => ({
        id: row.products.id,
        nome: row.products.nome,
        categoria: row.products.categoria,
        marca: row.products.marca,
        prezzo: row.prezzo,
        disponibile: row.disponibile,
      })))
    }
    setLoadingProducts(false)
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !supplierId) return
    setLoading(true)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('supplier_id', supplierId)

    const res = await fetch('/api/upload-catalog', { method: 'POST', body: formData })
    const json = await res.json()
    setResult(json)
    setLoading(false)
    if (json.ok) loadProducts(supplierId)
  }

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center text-gray-400">Caricamento...</div>

  if (!user) return null

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-3xl mx-auto flex flex-col gap-8">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Fornitore</h1>
            <p className="text-sm text-gray-500 mt-0.5">{supplierNome || user.primaryEmailAddress?.emailAddress}</p>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>

        {!supplierId && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
            Account non collegato a nessun fornitore. Contatta l'amministratore per attivare il tuo account.
          </div>
        )}

        {/* UPLOAD */}
        {supplierId && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-800 mb-1">Carica catalogo</h2>
            <p className="text-xs text-gray-400 mb-4">
              Formati: <strong>Excel (.xlsx, .xls)</strong> o CSV — colonne: <code className="bg-gray-100 px-1 rounded">nome, categoria, marca, prezzo, disponibile, peso</code>
            </p>
            <form onSubmit={handleUpload} className="flex flex-col gap-3">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={e => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100"
              />
              <button
                type="submit"
                disabled={!file || loading}
                className="w-fit bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition"
              >
                {loading ? 'Caricamento...' : 'Carica'}
              </button>
            </form>

            {result && (
              <div className={`mt-4 p-4 rounded-xl text-sm ${result.errors?.length ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
                {result.ok && (
                  <p className="text-green-800 font-medium">✔ {result.inserted} prodotti aggiunti, {result.updated} aggiornati</p>
                )}
                {result.errors?.map((e, i) => <p key={i} className="text-yellow-800">{e}</p>)}
              </div>
            )}
          </div>
        )}

        {/* PRODOTTI */}
        {supplierId && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-800 mb-4">I tuoi prodotti</h2>
            {loadingProducts ? (
              <p className="text-sm text-gray-400">Caricamento...</p>
            ) : products.length === 0 ? (
              <p className="text-sm text-gray-400">Nessun prodotto ancora caricato.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase">
                      <th className="pb-2 pr-4">Prodotto</th>
                      <th className="pb-2 pr-4">Categoria</th>
                      <th className="pb-2 pr-4">Marca</th>
                      <th className="pb-2 pr-4">Prezzo</th>
                      <th className="pb-2">Disponibile</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 pr-4 font-medium text-gray-900">{p.nome}</td>
                        <td className="py-2 pr-4 text-gray-500">{p.categoria ?? '—'}</td>
                        <td className="py-2 pr-4 text-gray-500">{p.marca ?? '—'}</td>
                        <td className="py-2 pr-4 text-gray-700">{p.prezzo ? `€${p.prezzo}` : '—'}</td>
                        <td className="py-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.disponibile ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {p.disponibile ? 'Sì' : 'No'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  )
}
