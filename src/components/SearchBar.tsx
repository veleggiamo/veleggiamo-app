'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchBar({ initialQuery = '' }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery)
  const router = useRouter()

  const handleSearch = (q = query) => {
    if (!q.trim()) return
    router.push(`/risultati?q=${encodeURIComponent(q)}`)
  }

  return (
    <div className="w-full max-w-2xl flex gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Es. ancora per barca 10 metri"
        className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={() => handleSearch()}
        className="bg-blue-600 text-white px-6 rounded-xl text-lg font-medium hover:bg-blue-700 transition"
      >
        Cerca
      </button>
    </div>
  )
}
