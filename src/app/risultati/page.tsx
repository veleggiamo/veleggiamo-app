import { search } from '@/services/searchService'
import ProductList from '@/components/ProductList'

export default async function RisultatiPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q || ''
  const data = query ? await search(query) : null

  return (
    <main className="p-6 flex flex-col gap-6">
      <a href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition w-fit">
        ← Torna alla ricerca
      </a>
      <h1 className="text-2xl font-bold">Risultati</h1>

      {!query && <p>Nessuna query</p>}

      {data && (
        <>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-sm text-gray-700">
            <div><strong>Categoria:</strong> {data.parsedQuery.categoria ?? 'non rilevata'}</div>
            <div><strong>Lunghezza:</strong> {data.parsedQuery.lunghezzaBarca ? `${data.parsedQuery.lunghezzaBarca}m` : 'non specificata'}</div>
            <div><strong>Confidence:</strong> {data.parsedQuery.confidence}</div>
          </div>

          {data.parsedQuery.confidence < 0.5 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-sm text-yellow-800">
              Query poco chiara: stiamo mostrando risultati basati su ipotesi.
              Prova ad aggiungere lunghezza della barca o categoria (es. "ancora 10 metri").
            </div>
          )}
          <div className="mb-6 text-lg text-gray-800">
            {data.parsedQuery.categoria && (
              <>
                Ti consigliamo{' '}
                <span className="font-semibold">
                  {data.parsedQuery.categoria}
                </span>{' '}
                {data.parsedQuery.lunghezzaBarca
                  ? `per una barca da ${data.parsedQuery.lunghezzaBarca}m`
                  : 'in base alla tua richiesta'}
              </>
            )}
          </div>

          <ProductList products={data.results} />
        </>
      )}
    </main>
  )
}
