import Link from 'next/link'

export function ExperienceEmptyState() {
  return (
    <div className="border border-gray-100 rounded-xl p-8 text-center space-y-3">
      <p className="font-semibold text-gray-900 text-sm">Nessuna esperienza disponibile al momento</p>
      <p className="text-xs text-gray-500">Controlla le migliori destinazioni per trovare alternative</p>
      <Link
        href="/destinazioni"
        className="inline-block mt-2 text-sm text-sky-600 font-medium hover:underline"
      >
        Vedi tutte le destinazioni →
      </Link>
    </div>
  )
}
